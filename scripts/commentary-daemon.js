#!/usr/bin/env node

const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const root = path.resolve(
  process.env.CODEX_COMMENTARY_ROOT ||
    path.join(repoRoot, "runtime", "commentary")
);

const dirs = {
  inbox: path.join(root, "comments", "inbox"),
  spoken: path.join(root, "comments", "spoken"),
  skipped: path.join(root, "comments", "skipped"),
  failed: path.join(root, "comments", "failed"),
  audioReady: path.join(root, "audio", "ready"),
  audioPlayed: path.join(root, "audio", "played"),
  audioFailed: path.join(root, "audio", "failed")
};

const pollMs = numberFromEnv("CODEX_COMMENTARY_POLL_MS", 250);
const defaultTtlMs = numberFromEnv("CODEX_COMMENTARY_TTL_MS", 8000);
const exitAfterIdleMs = numberFromEnv("CODEX_COMMENTARY_EXIT_AFTER_IDLE_MS", 0);
const rate = String(process.env.CODEX_COMMENTARY_RATE || "185");
const voice = process.env.CODEX_COMMENTARY_VOICE || "";
const muteFile = path.join(root, "commentary.mute");

let stopping = false;

process.on("SIGINT", () => {
  stopping = true;
});

process.on("SIGTERM", () => {
  stopping = true;
});

main().catch((error) => {
  console.error(`[commentary] fatal: ${error.stack || error.message}`);
  process.exitCode = 1;
});

async function main() {
  await ensureDirs();

  console.log(`[commentary] watching ${dirs.inbox}`);
  console.log("[commentary] write comments with: npm run comment -- \"text\"");
  console.log(`[commentary] mute with: touch ${muteFile}`);

  let idleSince = Date.now();

  while (!stopping) {
    const files = await listInbox();

    if (files.length === 0) {
      if (exitAfterIdleMs > 0 && Date.now() - idleSince >= exitAfterIdleMs) {
        console.log("[commentary] idle timeout reached; exiting");
        return;
      }

      await sleep(pollMs);
      continue;
    }

    idleSince = Date.now();
    await processFile(files[0]);
  }

  console.log("[commentary] stopped");
}

async function processFile(filePath) {
  let event;

  try {
    event = await readEvent(filePath);
  } catch (error) {
    await moveRaw(filePath, dirs.failed, {
      status: "failed",
      reason: "invalid_json",
      error: error.message
    });
    console.error(`[commentary] invalid json: ${path.basename(filePath)}`);
    return;
  }

  const normalized = normalizeEvent(event, filePath);

  if (!normalized.text) {
    await writeEvent(filePath, dirs.skipped, normalized, "skipped", {
      reason: "empty_text"
    });
    console.log(`[commentary] skipped empty comment: ${normalized.id}`);
    return;
  }

  if (isMuted()) {
    await writeEvent(filePath, dirs.skipped, normalized, "skipped", {
      reason: "muted"
    });
    console.log(`[commentary] muted; skipped ${normalized.id}`);
    return;
  }

  if (isStale(normalized)) {
    await writeEvent(filePath, dirs.skipped, normalized, "skipped", {
      reason: "stale_before_tts"
    });
    console.log(`[commentary] stale before tts: ${normalized.id}`);
    return;
  }

  const audioPath = path.join(dirs.audioReady, `${safeName(normalized.id)}.aiff`);

  try {
    await synthesize(normalized.text, audioPath);
  } catch (error) {
    await writeEvent(filePath, dirs.failed, normalized, "failed", {
      reason: "tts_failed",
      error: error.message
    });
    console.error(`[commentary] tts failed for ${normalized.id}: ${error.message}`);
    return;
  }

  if (isMuted()) {
    await removeIfExists(audioPath);
    await writeEvent(filePath, dirs.skipped, normalized, "skipped", {
      reason: "muted_after_tts"
    });
    console.log(`[commentary] muted after tts; skipped ${normalized.id}`);
    return;
  }

  if (isStale(normalized)) {
    await removeIfExists(audioPath);
    await writeEvent(filePath, dirs.skipped, normalized, "skipped", {
      reason: "stale_after_tts"
    });
    console.log(`[commentary] stale after tts: ${normalized.id}`);
    return;
  }

  try {
    await play(audioPath);
  } catch (error) {
    await moveAudio(audioPath, dirs.audioFailed);
    await writeEvent(filePath, dirs.failed, normalized, "failed", {
      reason: "playback_failed",
      error: error.message
    });
    console.error(
      `[commentary] playback failed for ${normalized.id}: ${error.message}`
    );
    return;
  }

  const playedAudioPath = await moveAudio(audioPath, dirs.audioPlayed);

  await writeEvent(filePath, dirs.spoken, normalized, "spoken", {
    played_at: new Date().toISOString(),
    audio_file: path.relative(repoRoot, playedAudioPath)
  });

  console.log(`[commentary] spoke ${normalized.id}: ${normalized.text}`);
}

async function ensureDirs() {
  await Promise.all(Object.values(dirs).map((dir) => fs.mkdir(dir, { recursive: true })));
}

async function listInbox() {
  const names = await fs.readdir(dirs.inbox);

  return names
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => path.join(dirs.inbox, name));
}

async function readEvent(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function normalizeEvent(event, filePath) {
  const now = new Date().toISOString();
  const id = String(event.id || path.basename(filePath, ".json"));
  const createdAt = event.created_at || event.createdAt || now;
  const ttlMs = Number(event.ttl_ms || event.ttlMs || defaultTtlMs);

  return {
    id,
    created_at: createdAt,
    ttl_ms: Number.isFinite(ttlMs) ? ttlMs : defaultTtlMs,
    kind: String(event.kind || "commentary"),
    priority: String(event.priority || "normal"),
    text: String(event.text || "").trim()
  };
}

function isStale(event) {
  if (event.ttl_ms <= 0) {
    return false;
  }

  const created = Date.parse(event.created_at);

  if (!Number.isFinite(created)) {
    return false;
  }

  return Date.now() - created > event.ttl_ms;
}

function isMuted() {
  return fsSync.existsSync(muteFile) || process.env.CODEX_COMMENTARY_MUTE === "1";
}

async function synthesize(text, outputPath) {
  const args = [];

  if (voice) {
    args.push("-v", voice);
  }

  args.push("-r", rate, "-o", outputPath, text);
  await run("say", args);
}

async function play(audioPath) {
  await run("afplay", [audioPath]);
}

async function writeEvent(sourcePath, targetDir, event, status, extra = {}) {
  const targetPath = path.join(targetDir, path.basename(sourcePath));
  const next = {
    ...event,
    status,
    ...extra,
    recorded_at: new Date().toISOString()
  };

  await fs.writeFile(targetPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  await removeIfExists(sourcePath);
}

async function moveRaw(sourcePath, targetDir, extra) {
  const targetPath = path.join(targetDir, path.basename(sourcePath));

  try {
    const raw = await fs.readFile(sourcePath, "utf8");
    await fs.writeFile(
      targetPath,
      `${JSON.stringify({ raw, ...extra, recorded_at: new Date().toISOString() }, null, 2)}\n`,
      "utf8"
    );
  } finally {
    await removeIfExists(sourcePath);
  }
}

async function moveAudio(sourcePath, targetDir) {
  const targetPath = path.join(targetDir, path.basename(sourcePath));
  await fs.rename(sourcePath, targetPath);
  return targetPath;
}

async function removeIfExists(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "ignore", "pipe"]
    });

    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with ${code}: ${stderr.trim()}`));
    });
  });
}

function safeName(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 96);
}

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
