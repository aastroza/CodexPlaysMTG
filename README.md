# Codex Plays MTG

Codex is not a pro player. Codex is not a bot laddering in silence. Codex is an AI streamer with a mouse, a decklist, and far too much confidence.

This repo documents the ongoing experiment of teaching Codex how to play Magic: The Gathering Arena, explain its decisions, and eventually stream the whole thing on Twitch.

The goal is simple: make the process visible enough that other people can understand it, improve it, and copy it if they want.

## What This Project Is

Codex Plays MTG is a working notebook for an AI-assisted MTGA setup.

It tracks the practical pieces needed for Codex to:

- understand Magic cards using reliable card data
- inspect the MTGA screen
- move the mouse and interact with the game
- play decks with a clear plan
- explain decisions in plain English
- learn from misplays, UI failures, and testing
- eventually act like a watchable AI streamer, not a silent automation script

This is not trying to hide the human in the loop. The interesting part is the collaboration: Codex can read, reason, click, and narrate, but the setup still needs careful prompts, tools, feedback, and a lot of iteration.

## Current Status

Right now the project is focused on two things:

1. Giving Codex the tools it needs to understand Magic cards.
2. Giving Codex a repeatable way to control MTGA on macOS.

The first skills are stored in this repo under `skills/`:

- `skills/scryfall-api`
- `skills/mtga-control`

These are Codex skills, which are small reusable instruction folders. They teach Codex how to do a specific kind of work.

## The Skills

### Scryfall API

The `scryfall-api` skill teaches Codex how to use the Scryfall API as the source of truth for Magic cards.

Scryfall is used for:

- exact card names
- Oracle text
- card types
- legalities
- rulings
- set data
- search queries
- card images and metadata

This matters because Magic is a game where one word can decide whether a combo works.

### MTGA Control

The `mtga-control` skill teaches Codex how to interact with Magic: The Gathering Arena.

It documents things we learned the hard way, including:

- MTGA does not expose most useful game UI through accessibility APIs.
- Screenshots are the main source of truth.
- Buttons can often be clicked by coordinate.
- Cards in hand should be dragged onto the battlefield, not just clicked.
- Some clicks need a lower-level CoreGraphics helper on macOS.
- During a live game, Codex has to act quickly enough to avoid the rope.

This skill is still early. Every match teaches us something new about the UI.

## Deckbuilding

Codex is also building the decks it plays.

The first major deckbuilding experiment was a Standard combo deck around `Shang-Chi, Master of Kung Fu`.

You can read the writeup here:

[How Codex helped me build a combo deck](https://codexforeveryone.substack.com/p/how-codex-helped-me-build-a-combo)

That process started with one new card and asked Codex to search for real deterministic combo lines before building a decklist. The result was a combo involving:

- `Shang-Chi, Master of Kung Fu`
- `Agatha's Soul Cauldron`
- `Sleep-Cursed Faerie`
- `Hawkeye's Bow`

The important idea was not just the decklist. It was the workflow: verify the card text, prove the combo works, compare possible routes, then build the shell.

That is the kind of process this repo is meant to preserve.

## How To Use This Repo

For now, the repo is mainly documentation plus reusable Codex skills.

To try the skills locally, copy them into your Codex skills directory:

```bash
mkdir -p ~/.codex/skills
cp -R skills/scryfall-api ~/.codex/skills/
cp -R skills/mtga-control ~/.codex/skills/
```

Then restart Codex so it can detect the new skills.

After that, you can ask Codex to use them. For example:

```text
Use $scryfall-api to look up the Oracle text for Agatha's Soul Cauldron.
```

```text
Use $mtga-control to inspect the current MTGA screen.
```

## Where This Is Going

The next pieces will probably include:

- better MTGA screen-reading notes
- match logs
- mulligan heuristics
- sideboarding guides
- deck-specific play patterns
- stream narration rules
- Twitch setup notes
- overlays or captions
- a way to summarize games after they end
- tools for tracking what Codex got right and wrong

The dream version is an AI streamer that can play a real deck, explain its plan, make jokes, punt sometimes, learn from the punt, and show its work.

## Project Philosophy

This project is not about pretending Codex is perfect.

It is about making the loop visible:

1. Give Codex better tools.
2. Let it try.
3. Watch where it fails.
4. Write down what happened.
5. Improve the skills, prompts, and deck plans.
6. Try again.

If Codex wins, great.

If Codex loses because it clicked the wrong card, that is also data.

## Repository Layout

```text
.
├── AGENTS.md
├── README.md
└── skills
    ├── mtga-control
    └── scryfall-api
```

This layout will grow as the project becomes more complete.

