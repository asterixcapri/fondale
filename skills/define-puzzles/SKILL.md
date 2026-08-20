---
name: define-puzzles
description: Interview a Fondale game author and write the puzzle document that turns a story into a game — every obstacle recorded as what it needs, what the Player does and what changes, with the strands that run in parallel and the gate they converge on. Use when a game repository has `docs/game/story.md` but no `docs/game/puzzles.md`, or when adding, removing or reworking a puzzle of an existing game.
---

# Define Puzzles

Settle why the Player cannot reach the end immediately, and leave the decisions
in `docs/game/puzzles.md` as one row per puzzle — what it needs, what the Player
does, what changes — so that the dependencies between puzzles are readable and
the build order comes straight out of the document.

## Documents

| | |
| --- | --- |
| Reads | `docs/game/story.md` |
| Writes | `docs/game/puzzles.md`, and rows appended to `docs/game/story.md` |
| Missing input | when `docs/game/story.md` is absent, stop, write nothing, and tell the author to run `/define-story` first, leaving that skill for the author to invoke |
| Next command | `/setup-game` |

Paths are literal and relative to the game's own repository, which is the
working directory. When `docs/game/puzzles.md` already exists, revise it in
place.

## Workflow

### 1. Take stock

Read `docs/game/story.md`. Every place, Character, Object, Narrative Fact and
Claim it defines is a key you may refer to; a key it does not define is a thing
the game does not yet have. Read `docs/game/puzzles.md` when it exists.

Finish when you can state in one line what the story settles, in one line what
the puzzle document already settles, and in one line what the author is here to
change.

### 2. Grill the puzzles

Invoke `$grilling` and interview the author before writing anything. Cover:

- **the end** — what the Player must have done to finish, and which single
  obstacle stands last in front of it: that obstacle is the **gate**;
- **the obstacles** — for each, what stops the Player, what the Player must
  bring or know to get past it, what the Player physically does, and what is
  different in the world afterwards;
- **the strands** — which puzzles the Player may solve in any order, and which
  ones only make sense after another. Several strands converging on one gate is
  how a short game stays non-linear and still finishable; a single chain from
  first puzzle to last is a corridor, so ask what could run beside it;
- **fair play** — for every thing a puzzle needs, where the Player finds it or
  is told about it, and that the Player can reach that moment before the puzzle
  is in front of them. A solution the Player could not have learned about is not
  a puzzle, it is a lock;
- **scope** — one short adventure of one to two hours of play. A puzzle is one
  ticket somebody will build and play from beginning to end, so an obstacle that
  takes several unrelated Player actions to describe is several puzzles. When
  the list outgrows the places, Characters and Objects the story has, ask which
  puzzle leaves.

Finish when the frontier is empty, the author has confirmed the gate and the
strands, and every obstacle sits on a list the author has agreed to.

### 3. Name each puzzle and each change as a key

Every puzzle and everything a puzzle changes carries a key, under the rules
`docs/game/story.md` states for its own keys, and unique across both documents.

A puzzle's key names the obstacle, not the solution: `barredGate`, not
`useKeyOnGate`.

What a puzzle changes is a proposition that becomes true and stays true, so name
it as one: `gateStandsOpen`, `ferrymanIsPaid`. Where the Engine already carries
that proposition — an Object in the Inventory, a Narrative Fact the Player
knows, a Scene the Player can reach — name the story key of the thing itself;
otherwise the proposition becomes a Game Variable the Game Project declares, and
this key is its name. Either way, one puzzle's change and another puzzle's need
are the same key spelled the same way.

Finish when every puzzle and every change carries such a key, no key means two
things, and every change that is not already Engine state is marked as a Game
Variable.

### 4. Give the story what the puzzles need

A puzzle may need a place, a Character, an Object, a Narrative Fact or a Claim
the story does not have. Take it to the author, agree the key and the label, and
add the row to the matching table of `docs/game/story.md` — keeping the section
order and the columns that document already has — before writing it into a
puzzle row. The two documents describe one game and may not contradict each
other.

Where the new thing changes what the story says in prose, change the prose too,
and tell the author what you changed.

List every key you add there under `Added to the story` in the puzzle document,
so that a reader of either document sees which rows of the story exist because a
puzzle needed them, and what to revisit when a puzzle changes.

Finish when every key any puzzle row names is defined in `docs/game/story.md`,
the author has agreed to every row you added there, and every such key appears
under `Added to the story`.

### 5. Write the puzzle document

Write `docs/game/puzzles.md` in exactly this shape. Tables and stable keys are
the point: the next skills extract values from this file, and a human reads it.

```markdown
# Puzzles — <game name>

**Derives from:** `docs/game/story.md`. Every place, Character, Object,
Narrative Fact and Claim named here is defined there.

## The gate

`<puzzle key>` — <one line: the last obstacle, and what the Player has to have
done to face it.>

## Strands

| Strand | Puzzles | Feeds the gate with |
| --- | --- | --- |
| Harbour | `missingOars`, `unpaidFerryman` | `ferrymanIsPaid` (Game Variable) |

Strands are independent: the Player may work on them in any order, and the game
is finishable whichever one is done first.

## Added to the story

| Key | Table it joined | Puzzle that needed it |
| --- | --- | --- |
| `brassKey` | Objects | `barredGate` |

## Puzzles

| Key | Place | Needs | What the Player does | What changes | Where the Player learns it |
| --- | --- | --- | --- | --- | --- |
| `barredGate` | `northGate` | `brassKey` carried, `ferrymanIsPaid` | <one line, the Player's own action> | `gateStandsOpen` (Game Variable) | <where the key is found>; <who mentions the ferryman>; <what tells the Player the gate wants a key> |
```

The gate carries a row in the Puzzles table like every other puzzle, and its
`Needs` cell names one change from each strand: that is what makes the strands
converge. Order lives in the `Needs` cells and nowhere else, so the Strands
table names which puzzles belong to a strand and what the strand hands the gate,
and leaves their order to be read from their needs.

Write each `Needs` cell as keys this document or the story defines, separated by
commas, and `none` where a puzzle needs nothing. Mark a carried Object as
`<key> carried`, a Narrative Fact the Player must have learned as `<key> known`,
and another puzzle's outcome as that outcome's key alone. Mark a change that
becomes a Game Variable as `<key> (Game Variable)`, so that a reader of a key
knows which registry it belongs to. Write `Where the Player learns it` as one
entry per `Needs` entry, in the same order, naming where the Player finds that
thing or is told about it, and end the cell with the moment the game tells the
Player what this obstacle wants. Where the game has no entries for a section,
write `none` under the heading, so that a later skill reads an answered question
rather than a missing section.

The rows above are examples of the shape; the written document carries the
author's own rows in their place.

Finish when the file exists at that path, every section is present, and no
example key from this skill survives in the file.

### 6. Check fair play

Read the finished document as the Player plays it. For every `Needs` entry of
every puzzle, name the one thing that satisfies it: the story's own starting
state — an Object the Player can reach, a Character who knows a fact and will
say it — or another puzzle's `What changes`. For every entry of every
`Where the Player learns it` cell, name the puzzle, place or Character it points
at, and confirm the Player can reach it without first solving the puzzle it
belongs to.

Take back to the author any entry nothing satisfies and any solution the Player
is never told about, and fix the document with the answer.

Finish when every `Needs` entry has a source named and every entry of every
`Where the Player learns it` cell comes earlier than the puzzle it belongs to.

## Handoff

Report the number of puzzles and strands, the gate, every row you added to
`docs/game/story.md`, anything the author deferred, and any name you chose
rather than the author.

End by giving the author the `Next command` from the table above, alone on its
own line, as the exact text to type.
