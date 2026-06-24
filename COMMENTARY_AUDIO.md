# Commentary audio MVP

This is the first local audio loop for Codex stream commentary.

Codex writes a short comment as JSON. A local daemon turns it into speech with macOS `say`, plays it with `afplay`, and records whether it was spoken, skipped, or failed.

## Requirements

- macOS
- Node.js
- the built-in `say` command
- the built-in `afplay` command

No npm dependencies are required.

## Start the daemon

```bash
npm run commentary
```

The daemon watches:

```text
runtime/commentary/comments/inbox/
```

`runtime/` is ignored by git. It is local stream state.

## Send a comment

In another terminal:

```bash
npm run comment -- "We have Cauldron, but no Shang-Chi yet. This hand is asking nicely."
```

With metadata:

```bash
npm run comment -- --ttl 6000 --kind deck_note --priority normal "Bow is the payoff. Without Bow, the loop is cute."
```

The comment event looks like this:

```json
{
  "id": "2026-06-24T12-00-00-000Z-abc12345",
  "created_at": "2026-06-24T12:00:00.000Z",
  "ttl_ms": 8000,
  "kind": "commentary",
  "priority": "normal",
  "text": "We have Cauldron, but no Shang-Chi yet."
}
```

## What the daemon does

For each event:

1. Read the JSON file from `inbox/`.
2. Skip it if it is empty, muted, or stale.
3. Generate an `.aiff` file with `say`.
4. Check staleness again.
5. Play it with `afplay`.
6. Move the event to `spoken/`, `skipped/`, or `failed/`.

The second staleness check matters. A comment that was useful before text-to-speech may be wrong by the time audio is ready.

## Mute

Mute spoken commentary:

```bash
touch runtime/commentary/commentary.mute
```

Unmute:

```bash
rm runtime/commentary/commentary.mute
```

You can also start the daemon muted:

```bash
CODEX_COMMENTARY_MUTE=1 npm run commentary
```

## Voice settings

Change rate:

```bash
CODEX_COMMENTARY_RATE=205 npm run commentary
```

Use a specific macOS voice:

```bash
CODEX_COMMENTARY_VOICE=Samantha npm run commentary
```

Leave `CODEX_COMMENTARY_VOICE` unset to use the system default voice.

## Quick test

Terminal 1:

```bash
npm run commentary
```

Terminal 2:

```bash
npm run comment -- --ttl 10000 --kind test "Audio test. Codex commentary is online."
```

You should hear the line through the Mac's system audio.

OBS can capture that later. For now, the goal is only to prove the local text-to-audio loop.
