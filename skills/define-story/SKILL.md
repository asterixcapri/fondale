---
name: define-story
description: Interview a Fondale game author and write the story document the whole game is built from, naming every place and how places connect, every Character, every Object, and what is canonically true. Use when a game repository has no `docs/game/story.md`, or when revising the story of an existing game.
---

# Define Story

Settle what exists in the game and what is true about it, and leave the
decisions in `docs/game/story.md` under the names the Game Project will later
declare as registry keys, so that nothing is renamed afterwards.

## Documents

| | |
| --- | --- |
| Reads | nothing: this is the first step of the pipeline |
| Writes | `docs/game/story.md` |
| Missing input | none to miss; when `docs/game/story.md` already exists, revise it in place |
| Next command | `/define-puzzles` |

Paths are literal and relative to the game's own repository, which is the
working directory. Create `docs/game/` when it is absent.

## Workflow

### 1. Take stock

Read `docs/game/story.md` when it exists, and the Engine's own vocabulary from
the installed package at
`node_modules/@asterixcapri/fondale/docs/public/vocabulary.md`, so that you name
things as the Engine names them. Where the package is not installed yet, carry
on from the story alone and say so; nothing settled here depends on the Engine.

Finish when you can state in one line what the document already settles and in
one line what the author is here to change.

### 2. Grill the story

Invoke `$grilling` and interview the author before writing anything. Cover:

- **premise** — where the game opens, what the Player wants, how it ends;
- **the situation** — what hour the game opens at, who is awake at that hour,
  and what each of them is up at that hour for. A cast with no answer to the
  third question becomes people standing in a room for no reason, and no later
  document can invent the reason for them;
- **places** — every place the Player Character can stand, and which place
  reaches which;
- **cast** — every Character the Player can meet, and which one the Player
  plays;
- **objects** — every thing the Player can pick up and carry;
- **truth** — what is canonically true (a Narrative Fact), who knows it when the
  game begins, and who conceals it by saying something else instead (a Claim);
- **scope** — one short adventure: roughly a dozen places, ten Characters,
  twenty Objects, one to two hours of play. When a list grows past that, ask
  which entry leaves.

The author owns the setting, the tone and the look; ask for them, and record
what the author says.

Finish when the frontier is empty, the author has confirmed the premise, every
Character has an ordinary reason to be awake where the game finds them, and
every place, Character, Object and Narrative Fact sits on a list the author has
agreed to.

### 3. Name each thing as a registry key

Each place becomes a Scene, each Character a Character, each thing the Player
carries an Object, and each truth a Narrative Fact or a Claim. The name settled
here is the registry key the Game Project declares for it, and everything built
later refers to the thing by that key. Give every place, Character, Object,
Narrative Fact and Claim a key that obeys all of:

- **unique** across the whole document, so that one key means one thing;
- **a valid TypeScript identifier in lowerCamelCase**: `northGate`,
  `gatekeeper`, `brassKey`;
- **stable under everything the story does to the thing**, because renaming a
  key renames the thing: a lantern is `lantern` whether it burns or not;
- **the thing itself, not what the Player reads**: the label "Hollis" belongs in
  its own column beside the key `gatekeeper`;
- **a proposition, for a Narrative Fact or a Claim**: `gateIsBarredAtNight`.

Finish when every row of the tables in step 4 carries such a key and no key
appears twice.

### 4. Write the story document

Write `docs/game/story.md` in exactly this shape. Tables and stable keys are the
point: the next skills extract values from this file, and a human reads it.

```markdown
# <game name>

**Derives from:** nothing. This document is the origin of the pipeline; every
other document in `docs/game/` derives from it.

## Premise

<Where the game opens, what the Player wants, how it ends. Three sentences.>

## The situation

<What hour the game opens at, and why each Character is awake at it. One line
per Character, in their ordinary words, before anybody knows anything is
wrong.>

## Setting and tone

<What the world is, when it is, how it should feel. The author's words.>

## Places

| Key | Label | What it is | Reaches |
| --- | --- | --- | --- |
| `northGate` | The north gate | <one line> | `guardRoom`, `road` |

## Characters

**Player Character:** `<key>`

| Key | Label | Role in the story | Starts in |
| --- | --- | --- | --- |
| `gatekeeper` | Hollis | <one line> | `northGate` |

## Objects

| Key | Label | Starts in | Why it matters |
| --- | --- | --- | --- |
| `brassKey` | Brass key | `guardRoom` | <one line> |

## Narrative Facts

| Key | Proposition | Known at the start by |
| --- | --- | --- |
| `gateIsBarredAtNight` | <a sentence that is true> | `gatekeeper` |

## Claims

| Key | Proposition | Told by | Instead of |
| --- | --- | --- | --- |
| `gateIsBroken` | <a sentence a Character says> | `gatekeeper` | `gateIsBarredAtNight` |
```

List a connection under both places it joins, and mark a passage that runs one
way only as `otherPlace (one way)` in the row of the place it leaves. Keep every
section, and where the game has no entries write `none` under the heading, so
that a later skill reads an answered question rather than a missing section.

The rows above are examples of the shape; the written document carries the
author's own rows in their place.

Finish when the file exists at that path, every key obeys step 3, every key
named in a `Reaches`, `Starts in`, `Known at the start by`, `Told by` or
`Instead of` cell is a key this document defines, and no example key from this
skill survives in the file.

## Handoff

Report the counts of places, Characters, Objects, Narrative Facts and Claims,
anything the author deferred, and any name you chose rather than the author.

End by giving the author the `Next command` from the table above, alone on its
own line, as the exact text to type.
