#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const repoRoot = path.resolve(__dirname, "..");
const root = path.resolve(
  process.env.CODEX_COMMENTARY_ROOT ||
    path.join(repoRoot, "runtime", "commentary")
);
const inbox = path.join(root, "comments", "inbox");

main().catch((error) => {
  console.error(`[comment] ${error.message}`);
  process.exitCode = 1;
});

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const text = options.stdin ? await readStdin() : options.text.join(" ");

  if (!text.trim()) {
    usage();
    process.exitCode = 1;
    return;
  }

  await fs.mkdir(inbox, { recursive: true });

  const now = new Date();
  const id = options.id || `${stamp(now)}-${randomUUID().slice(0, 8)}`;
  const event = {
    id,
    created_at: now.toISOString(),
    ttl_ms: options.ttlMs,
    kind: options.kind,
    priority: options.priority,
    text: text.trim()
  };

  if (options.voice) {
    event.voice = options.voice;
  }

  if (options.speed) {
    event.speed = Number(options.speed);
  }

  if (options.instructions) {
    event.instructions = options.instructions;
  }

  const fileName = `${stamp(now)}-${safeName(id)}.json`;
  const finalPath = path.join(inbox, fileName);
  const tempPath = `${finalPath}.tmp`;

  await fs.writeFile(tempPath, `${JSON.stringify(event, null, 2)}\n`, "utf8");
  await fs.rename(tempPath, finalPath);

  console.log(`[comment] queued ${id}`);
  console.log(`[comment] ${path.relative(repoRoot, finalPath)}`);
}

function parseArgs(args) {
  const options = {
    ttlMs: Number(process.env.CODEX_COMMENTARY_TTL_MS || 8000),
    kind: "commentary",
    priority: "normal",
    id: "",
    voice: "",
    speed: "",
    instructions: "",
    stdin: false,
    text: []
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--ttl") {
      options.ttlMs = Number(args[++i]);
      continue;
    }

    if (arg === "--kind") {
      options.kind = String(args[++i] || "commentary");
      continue;
    }

    if (arg === "--priority") {
      options.priority = String(args[++i] || "normal");
      continue;
    }

    if (arg === "--id") {
      options.id = String(args[++i] || "");
      continue;
    }

    if (arg === "--voice") {
      options.voice = String(args[++i] || "");
      continue;
    }

    if (arg === "--speed") {
      options.speed = String(args[++i] || "");
      continue;
    }

    if (arg === "--instructions") {
      options.instructions = String(args[++i] || "");
      continue;
    }

    if (arg === "--stdin") {
      options.stdin = true;
      continue;
    }

    options.text.push(arg);
  }

  if (!Number.isFinite(options.ttlMs)) {
    options.ttlMs = 8000;
  }

  return options;
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let text = "";

    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (chunk) => {
      text += chunk;
    });

    process.stdin.on("error", reject);
    process.stdin.on("end", () => resolve(text));
  });
}

function usage() {
  console.error("Usage:");
  console.error('  npm run comment -- "We have Cauldron, but no Shang-Chi yet."');
  console.error('  npm run comment -- --ttl 6000 --kind deck_note "This hand is risky."');
  console.error('  npm run comment -- --voice onyx --speed 1.15 "Short voice test."');
}

function stamp(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function safeName(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 96);
}
