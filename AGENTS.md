# AGENTS.md

This repository documents the Codex Plays MTG project: an experiment in making Codex play Magic: The Gathering Arena, explain its choices, and eventually stream on Twitch.

## Language

Write repository content in English.

Use simple, direct language. The audience includes people who know Magic but may not know Codex internals, and people who know AI tools but may not know MTGA.

Avoid overly technical explanations unless a file is specifically documenting implementation details.

## Project Tone

Keep the tone clear, curious, and a little playful.

The project premise is:

> Codex is not a pro player. Codex is not a bot laddering in silence. Codex is an AI streamer with a mouse, a decklist, and far too much confidence.

Do not make Codex sound like a perfect player. Document mistakes and uncertainty honestly.

## Documentation Rules

When adding project notes, prefer practical documentation:

- what we tried
- what worked
- what failed
- what we learned
- what should change next time

When documenting gameplay, include enough context for someone else to understand the board, hand, deck plan, and decision.

When documenting deckbuilding, cite reliable card data and explain the actual rules interaction.

## Skills

Store reusable Codex skills under `skills/`.

Current skills:

- `skills/scryfall-api`: use Scryfall as the card data source of truth.
- `skills/mtga-control`: control and inspect MTGA on macOS.

If a live session teaches us a new important behavior, update the relevant skill. For example, MTGA card play from hand should be documented as drag-and-drop, not click-to-play.

Keep skills self-contained and useful outside this repo.

## MTGA Safety

Do not spend currency, enter paid events, craft cards, open packs, concede matches, or submit irreversible choices unless the user explicitly asks for that exact action.

For live games, prioritize speed and clarity:

- inspect the screenshot
- choose a simple line
- act quickly
- confirm the result
- keep narration short while the rope is active

## Code And Comments

Write code, comments, scripts, and docs in English.

Keep scripts small and purposeful. Prefer readable automation over clever automation.

If a script controls the mouse, keyboard, MTGA, Twitch, or another live app, document what it can click or change.

## Future Work

Good future additions include:

- match logs
- deck guides
- mulligan notes
- sideboarding notes
- stream narration rules
- Twitch setup documentation
- MTGA UI coordinate notes
- post-game review templates
- tools for evaluating Codex's decisions

