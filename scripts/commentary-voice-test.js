#!/usr/bin/env node

const { spawn } = require("child_process");

const voices = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["onyx", "echo", "ash", "verse", "cedar"];

const text =
  process.env.CODEX_COMMENTARY_VOICE_TEST_TEXT ||
  "Voice test. Bow is the payoff. Without Bow, the loop is cute. With Bow, it becomes math.";

const speed = process.env.CODEX_COMMENTARY_OPENAI_SPEED || "1.12";

main().catch((error) => {
  console.error(`[voice-test] ${error.message}`);
  process.exitCode = 1;
});

async function main() {
  for (const voice of voices) {
    console.log(`[voice-test] ${voice}`);
    await run("npm", [
      "run",
      "comment",
      "--",
      "--ttl",
      "30000",
      "--kind",
      "voice_test",
      "--voice",
      voice,
      "--speed",
      speed,
      `${voice}. ${text}`
    ]);
  }

  console.log("[voice-test] queued voices:");
  console.log(voices.map((voice) => `- ${voice}`).join("\n"));
  console.log(`[voice-test] speed hint: ${speed}`);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: process.env
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with ${code}`));
    });
  });
}
