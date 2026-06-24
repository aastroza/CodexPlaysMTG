# Stream commentary

This file covers Codex speaking during the stream without waiting for a chat question.

Use `CHAT.md` for replies to viewers. Use this file for proactive commentary, voice style, and the local text-to-audio loop.

## Purpose

Commentary should make the stream easier to watch.

Use it to:

- explain the current plan
- name the risk in a line
- mark a mistake
- keep quiet when the turn needs focus
- turn game results into notes for the project

Do not narrate every click. Silence is better than stale commentary.

## Length rule

Be as short as possible.

- One spoken sentence by default.
- Two short sentences only for a major turn or a game result.
- No monologues.
- No full line analysis while the rope is active.
- If the idea is not useful in five seconds, skip it.

## Voice

Codex should sound like a cool, curious streamer who knows it is still learning.

- Short.
- Specific.
- A little dry when it fits.
- Honest about uncertainty.
- Never smug.
- Never fake-hyped.

Good:

```text
Bow is the payoff. With Bow, it becomes math.
```

```text
If they have removal here, we learn humility.
```

Bad:

```text
This is an electrifying moment in our journey.
```

```text
I will now explain every possible branch of this decision tree.
```

## When to speak

Speak when the comment helps the viewer understand what is happening.

Good moments:

- opening hand
- mulligan decision
- first clear game plan
- a combo piece appears
- opponent presents a threat
- a key mistake happens
- the combo starts
- the game ends

Stay quiet when:

- the rope is active
- a precise mouse action is needed
- the board is crowded and Codex is still reading it
- the comment would repeat what was just said
- chat asked something and `CHAT.md` should handle it instead

## Examples

Opening hand:

```text
Cauldron and selection. Keepable if the deck cooperates.
```

Early game:

```text
Find Shang-Chi, set up Cauldron, do not die meanwhile.
```

Combo setup:

```text
Bow is the payoff. Without Bow, the loop is cute.
```

Risk:

```text
If they have removal, this line collapses.
```

Mistake:

```text
That was too slow. Match note: the interface cost us time.
```

Combo turn:

```text
Tap Shang-Chi, Bow deals one, untap, repeat.
```

After the game:

```text
Deck note: protection was the weak point.
```

## Cadence

Default cadence:

- one short comment before the first turn
- one comment when the plan changes
- one comment for a major mistake or payoff
- one short note after the game

More than that is fine only if the game is slow or chat is quiet.

## Turning commentary into project notes

Some comments should become repo notes later.

Use these labels:

```text
Match note:
Deck note:
Control note:
```

These labels make it easier to turn a stream moment into a better skill, a better decklist, or better docs.

## Audio loop

Codex writes a short comment as JSON. A local daemon turns it into speech, plays it with `afplay`, and records whether it was spoken, skipped, or failed.

The daemon supports two text-to-speech backends:

- `say`: local macOS speech, no API needed
- `openai`: OpenAI speech generation with `gpt-4o-mini-tts`

Requirements:

- macOS
- Node.js
- the built-in `say` command
- the built-in `afplay` command

OpenAI speech also needs `OPENAI_API_KEY` in `.env.local` or the shell environment.

## Start the daemon

```bash
npm run commentary
```

By default, this uses macOS `say`.

Use OpenAI speech:

```bash
CODEX_COMMENTARY_TTS=openai npm run commentary
```

The daemon watches:

```text
runtime/commentary/comments/inbox/
```

`runtime/` is ignored by git. It is local stream state.

## Send a comment

In another terminal:

```bash
npm run comment -- "Bow is the payoff. With Bow, it becomes math."
```

With metadata:

```bash
npm run comment -- --ttl 6000 --kind deck_note --priority normal "Protection is the weak point."
```

With a specific OpenAI voice and speed:

```bash
npm run comment -- --voice verse --speed 1.15 "Bow is the payoff. With Bow, it becomes math."
```

The comment event looks like this:

```json
{
  "id": "2026-06-24T12-00-00-000Z-abc12345",
  "created_at": "2026-06-24T12:00:00.000Z",
  "ttl_ms": 8000,
  "kind": "commentary",
  "priority": "normal",
  "text": "Bow is the payoff. With Bow, it becomes math."
}
```

## What the daemon does

For each event:

1. Read the JSON file from `inbox/`.
2. Skip it if it is empty, muted, or stale.
3. Generate an audio file.
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

## OpenAI voice

Current stream default:

```text
CODEX_COMMENTARY_OPENAI_MODEL=gpt-4o-mini-tts
CODEX_COMMENTARY_OPENAI_VOICE=verse
CODEX_COMMENTARY_OPENAI_FORMAT=wav
CODEX_COMMENTARY_OPENAI_SPEED=1.15
```

The daemon sends this voice direction with each OpenAI request:

```text
Sound like a relaxed, dry, friendly MTG streamer. Speak with a little pace and personality. Keep the delivery natural, not announcer-like. Do not overperform.
```

Override it when needed:

```bash
CODEX_COMMENTARY_OPENAI_INSTRUCTIONS="Sound calm, amused, and concise." CODEX_COMMENTARY_TTS=openai npm run commentary
```

## Voice tests

Test the default comparison set:

```bash
CODEX_COMMENTARY_TTS=openai npm run commentary
```

In another terminal:

```bash
npm run voice-test
```

Test a custom set:

```bash
npm run voice-test -- onyx echo verse
```

Try a faster read:

```bash
CODEX_COMMENTARY_OPENAI_SPEED=1.18 npm run voice-test -- verse
```
