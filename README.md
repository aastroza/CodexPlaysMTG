# Codex Plays MTG

Codex Plays MTG is a record of an experiment: can [Codex](https://openai.com/codex) learn to play [Magic: The Gathering Arena](https://magic.wizards.com/mtgarena) in public?

It should be able to read the board, make a play, explain the play, miss something, learn from it, and keep going. This repo keeps the pieces needed to get there.

This project is not currently affiliated with, endorsed by, or sponsored by OpenAI.

## What this repo is for

MTGA is a visual app. It does not hand Codex a clean game state. Codex has to look at the screen, understand the cards, move the mouse, and act before the rope runs out.

That requires a few layers:

- card knowledge from a reliable source
- instructions for controlling MTGA
- notes about the game's UI
- deck plans and match lessons
- a way to explain decisions clearly while playing

This repo is where those layers live. The goal is to leave enough detail that another person can see what worked, what failed, and how to reproduce the setup.

## Current focus

The first useful work is stored as Codex skills under `skills/`.

A skill is a small instruction folder that teaches Codex how to do one job. These two are the base of the project:

- `skills/scryfall-api`
- `skills/mtga-control`

Together they give Codex two things it needs before it can play a real game: card text and a mouse.

## `scryfall-api`

Magic depends on exact words. A combo can work or fail because of one line of Oracle text.

The `scryfall-api` skill tells Codex how to use Scryfall instead of guessing from memory. It can check exact card text and search for cards that fit a deckbuilding question.

That matters for deckbuilding and for gameplay. If Codex is going to explain why a line works, it should start from the actual card text.

## `mtga-control`

The `mtga-control` skill records what we have learned about operating Arena on macOS.

The main lesson so far: MTGA is not a normal accessible app. Codex can see screenshots, but most game objects do not appear as buttons or fields. Playing the game means working from coordinates.

The skill includes notes such as:

- use screenshots as the source of truth
- click buttons by coordinate when needed
- drag cards from hand to the battlefield to play them
- use a CoreGraphics helper when normal clicks do not activate MTGA
- keep live-game narration short so the rope does not punish us

These details sound small until a match is running. Then they are the difference between casting the spell and staring at a highlighted card while the turn timer burns down.

## Decks

Codex is also building the decks it plays.

The first test deck was a Standard combo deck around `Shang-Chi, Master of Kung Fu`. I wrote about that process here:

[How Codex helped me build a combo deck](https://codexforeveryone.substack.com/p/how-codex-helped-me-build-a-combo)


## How to try the skills

Copy the skills into your local Codex skills directory:

```bash
mkdir -p ~/.codex/skills
cp -R skills/scryfall-api ~/.codex/skills/
cp -R skills/mtga-control ~/.codex/skills/
```

Restart Codex after copying them.

Then you can ask for things like:

```text
Use $scryfall-api to look up the Oracle text for Agatha's Soul Cauldron.
```

```text
Use $mtga-control to inspect the current MTGA screen.
```

## Twitch assets

The current Twitch profile assets are in `assets/twitch/`:

- `codexplaysmtg-avatar.png`
- `codexplaysmtg-banner.png`

## Mascot

The stream mascot is `codie`, installed with [Petdex](https://petdex.dev/):

```bash
npx petdex@latest install codie
```

Codie is inspired by [Codie, Vociferous Codex](https://scryfall.com/card/stx/253/codie-vociferous-codex).

## How the project should grow

- What does Codex need to know before playing this deck?
- What does Codex need to see on screen?
- What actions can Codex take reliably in MTGA?
- What went wrong in a real match?
- What instruction would prevent that mistake next time?

Good match notes are welcome. So are bad ones. A failed click, a missed trigger, a slow mulligan decision, or a wrong attack can all improve the setup if we write down the cause.

The project gets better by turning those mistakes into instructions.
