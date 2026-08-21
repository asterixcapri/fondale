---
name: define-screenplay
description: Interview a Fondale game author and write the screenplay that turns puzzles into scenes somebody can look at — what each Scene holds, where every Character stands and why, the route between the furniture, and the Sequences that play in it. Use when a game repository has `docs/game/puzzles.md` but no `docs/game/screenplay.md`, or when restaging a Scene, adding a Sequence, or changing what a Scene shows.
---

# Define Screenplay

Settle what the Player sees and what the Player understands without being told,
and leave the decisions in `docs/game/screenplay.md` as one composition and one
staging per Scene, so that a Scene is built as a room somebody lives in rather
than a floor somebody walks on.

The story settles what is true. The puzzles settle what stops the Player. This
document settles what a Scene shows.

## Documents

| | |
| --- | --- |
| Reads | `docs/game/story.md`, `docs/game/puzzles.md` |
| Writes | `docs/game/screenplay.md`, and rows appended to `docs/game/story.md` |
| Missing input | when `docs/game/puzzles.md` is absent, stop, write nothing, and tell the author to run `/define-puzzles` first, leaving that skill for the author to invoke |
| Next command | `/setup-game` |

Paths are literal and relative to the game's own repository, which is the
working directory. When `docs/game/screenplay.md` already exists, revise it in
place.

## The stage the Engine gives you

Five facts about the Engine that are the shape of the drama, not technical
detail. Everything this skill produces is written inside them, and every one of
them has silently rewritten a game that did not know it.

**Nobody enters and nobody leaves.** A `CharacterDefinition` declares
`initialScene`, and no Game Operation moves a Character between Scenes or hides
one. Whoever is in a room is in it from the first frame to the last. This is a
chamber drama, and the composition has to give every person in the room a reason
to be standing in it all night.

**A Character moves only inside a Sequence.** A Direction Step's `motion` walks
any Character — not only the Player Character — through ordinary navigation, so
it obeys the Walkable Region, and it may declare the Facing it ends on. Outside
a Sequence everyone stands still: `initialFacing` holds until something walks
them. Moving a Character costs a `walking` Animation, which is four Facings of
artwork, so naming who moves is ordering assets.

**Everybody is always performing something.** Every Appearance declares an
Animation in the `default` role, and that is what the Engine plays whenever
nothing else is playing. It is required, so it is spent whatever you do with it:
spent on a standing pose, a room full of people reads as a room full of
furniture; spent on an occupation, everyone in the Scene is busy without one
extra line of authoring. What each person is busy with is a decision this
document makes, and each distinct occupation is an Animation in four Facings.

**The Camera is derived, never authored.** It follows the Player Character and
clamps to the Scene, and a Scene the size of the Logical Resolution never moves
it at all. What this document decides is not the shot but the width of the room:
a Scene wider than the viewport is one the Player discovers by walking, so the
first frame holds only part of what the room contains.

**A Scene may open with a Sequence.** A Scene Opening case naming no Entrance
applies to every opening of that Scene, the start of the game included, and it
takes control before the Player does. A skippable one must leave the world in
the same state whether it played or not, so nothing the composition relies on
may be something the opening did.

**Conditions are booleans.** A condition reads a Game Variable or whether the
Player holds an Object. Every shade of state the staging wants is a Variable
somebody declares, and the ones no puzzle asks for are declared here.

## Coordinates and situation

A Player reads a period from a room and never reads a date from one. Where the
game is, when it is, and what hour it is are **coordinates**: no Scene
communicates them, and a Player who lacks one the game depends on reads
everything else wrong. Everything else is the **situation** — what is going on
in this room, who is lying, why these people are here at this hour — and the
situation is shown, always. Telling it spends the one moment where the Player
looks hardest, and leaves them informed rather than suspicious.

Which coordinates a game owes the Player is a decision, not a rule. Ask what the
Player must hold before the first frame can be read at all, and give only that.
A game set in a place and a year the Player has never heard of owes both before
anything else; a game that happens somewhere ordinary owes nothing, and a
caption on it is an apology for a Scene that should have been composed better.
Between two Scenes, a jump of days or of miles is a coordinate the same way.

Then find the cheapest thing that carries what is owed. A line somebody has a
reason to say is the strongest, because it gives the coordinate and a reason for
it at once — a deadline named aloud tells the hour and tells why the hour
matters. A `narration` step at the head of an opening carries what nobody in the
room would ever say out loud: a date, a city, a span of time. A well-staged
opening often settles the whole question by itself, and then nothing is owed.

The ten seconds are a test of the situation, never of the coordinates. What the
world is beyond them — its history, its rumours, its dead — belongs to whoever
in the cast has a reason to bring it up.

## Workflow

### 1. Take stock

Read `docs/game/story.md` for the Scenes, the cast, the Objects and what is
true, and `docs/game/puzzles.md` for what each Scene has to make playable and
which keys carry it. Read `docs/game/screenplay.md` when it exists. Read the
Engine's own contract from the installed package, which is the version the game
is built against: `node_modules/fondale/docs/public/authoring/scene.md` for
Scene Size, Walkable Region, Hotspots and Scene Opening, `authoring/scenery.md`
for what earns a place outside the Background, `authoring/character.md` for
Facing and Animation Roles, and `authoring/sequence.md` for the six steps and
the directions.

Finish when you can name every Scene, say in one line what each is for, and say
in one line what this run is here to stage.

### 2. Grill the staging

Invoke `$grilling` and interview the author before writing anything. Cover:

- **the hour** — when the game is set, to the hour, and what deadline every
  Scene shares. A clock the whole cast is under is what makes people behave;
- **who is awake, and why** — for every Character, the ordinary reason they are
  where they are at that hour. A Character with no reason is a figure standing
  in the middle of a room, and the Player reads it as an error;
- **what is happening in each Scene** — not how the room is built: what is going
  on in it while the Player is there;
- **the ten seconds** — what the Player must understand from the first frame
  alone, with nobody saying anything;
- **the furniture that accuses** — for every thing in the room, what it says
  about the night. A thing that says nothing is decoration and leaves;
- **who stands where, and why that spot and no other** — against the furniture,
  not against an empty floor;
- **what each person is doing** — the occupation their `default` Animation
  performs all game. Ask for an action, not a pose, and ask what that action
  says about the night. Somebody busy at an hour when there is nothing to be
  busy with is the cheapest tension a Scene can carry;
- **the coordinates** — which of the place, the date and the hour the Player
  must hold before the first frame can be read, whether the game's premise turns
  on any of them, and where a Scene sits in time against the one before it;
- **what moves, and when** — who walks, what a Scene stages when it opens, and
  which Sequence each movement belongs to;
- **what changes** — which Appearances of Scenery and Characters change during
  the game, and which puzzle drives each change.

Finish when the frontier is empty, every Character has a reason to be standing
where they stand, and every Scene has an answer to the ten seconds the author
has agreed to.

### 3. Compose each Scene

Compose the first frame before staging anything that happens in it, because
what happens is read against what is standing there.

Settle, for each Scene: how wide the room is, and therefore how much of it the
first frame holds; every element of the set, and for each whether it is painted
into the Background or is Scenery — Scenery only for the two reasons the
Engine's contract gives, that it changes Appearance or animates, or that a
Character passes both in front of it and behind it — and whether it carries a
Hotspot; every Object the Scene holds and when it can be picked up; and every
Character's spot, Facing and occupation, each with the sentence it is saying.
Give every Character an occupation before giving anyone a line: a Scene where
the cast is busy reads as a place, and one where the cast is posed reads as a
menu.

Then settle the route: the Walkable Region as the corridor left between the
furniture, and what stays outside it. Keep it honest against the same rules
`/define-scene` builds under — an obstacle lies outside the region or along its
boundary and never as an island inside it, and no channel is narrower than the
widest Character who has to pass. A chokepoint one person wide is a staging
instrument, so ask for it where somebody is standing in somebody else's way.

Finish when every Scene has a set where every element says something, every
Character stands against a piece of that set and is doing something there, the
route is a corridor rather than a floor, and the ten seconds are answered by
what the first frame holds.

### 4. Direct what happens

Take each Sequence the game needs — the opening of a Scene, the resolution of a
puzzle, the gate — and write it as numbered beats, each beat naming the Engine
step that performs it: a Character speaking, narrator prose, a Direction Step
that walks somebody or plays a gesture, a group of operations, a choice the
Player picks from, or a branch the game takes itself.

The opening of the Scene the game starts in stages rather than explains, and
carries whatever coordinates the game turned out to owe — as a beat of its own
where nobody would say them aloud, and in somebody's mouth where they would.
Give it a line or two of dialogue whatever else it does: an opening in which
nobody speaks reads as a game that has not loaded, and one line from somebody
with a reason to say it puts the game's deadline in the Player's head without
telling them anything they were supposed to notice. A Player who skips a
skippable opening sees none of it, so a coordinate the game cannot do without
either sits in an opening that is not skippable, or sits somewhere the skip does
not reach.

For each Sequence settle where it starts from — a Scene Opening, a Command Case,
a Conversation alternative or a Game Operation — and, when the Player may skip
it, what stays true afterwards. A skip that leaves the world different is one
the Engine refuses, and settling it here is what stops a composition from
depending on a Sequence having played.

Every Character any beat walks is a Character the game moves, so record it: that
is a `walking` Animation in four Facings, and `/setup-game` sizes the asset
register from this column.

Finish when every coordinate the game owes is carried by a beat that names it,
the game's first opening speaks at least once, every Sequence names where it
starts from, every beat names its step,
every skippable Sequence names what survives the skip, every Character who moves
is recorded as moving, and every Appearance that changes during the game names
the puzzle key that drives it.

### 5. Give the story and the puzzles what the staging needs

Staging a room makes holes in the story visible: a Character with no reason to
be awake, a room with nothing in it that accuses, a thing the Player must see
that nothing puts there. Take each to the author, agree the key and the label,
and add the row to the matching table of `docs/game/story.md`, keeping the
section order and the columns that document already has.

A Game Variable this document needs and no puzzle asks for stays here, under
`Staging variables`: `docs/game/puzzles.md` declares the ones puzzles turn, and
this document declares the ones staging turns.

Where a row of `docs/game/story.md` names a thing this document decides is not a
thing the game builds — an Object that turns out to be a mark on the Background
— say so in the Scene that holds it, so that no ticket fabricates it.

List every key you add to the story under `Added to the story`.

Finish when every key this document names is defined in `docs/game/story.md` or
in `docs/game/puzzles.md` or under `Staging variables`, and the author has
agreed to every row you added there.

### 6. Write the screenplay document

Write `docs/game/screenplay.md` in exactly this shape. The head is written once;
everything from `# <Scene label>` down repeats for every Scene.

```markdown
# Screenplay — <game name>

**Derives from:** `docs/game/story.md` and `docs/game/puzzles.md`. Every Scene,
Character, Object and puzzle named here is defined there. **Feeds:**
`/define-scene` and `/define-character`, which take the composition from here,
and the tickets, which take their staging criteria from here.

## The coordinates

| What the Player is given | How | Where |
| --- | --- | --- |
| <the date and the city> | a caption, in these words | the head of the opening |
| <the hour> | `housekeeper` names the tide | the opening, beat 2 |

Everything the game tells the Player outright, and nothing else. Write `none`
where the Scenes carry it all themselves.

## The clock

| Deadline | What it is, and who it presses |
| --- | --- |
| <the morning tide> | <one line> |

## Staging variables

| Key | What it holds | Turned by |
| --- | --- | --- |
| `theHouseHasBeenSeen` | the opening has played | the opening's own operations |

Game Variables no puzzle asks for. Write `none` where the game has none.

## Added to the story

| Key | Table it joined | What needed it |
| --- | --- | --- |

# <Scene label> — `<scene key>`

**<width> × <height> behind the viewport.** <What the first frame holds, and
what the Player only reaches by walking.>

## What is happening

<Not how the room is built: what is going on in it while the Player is there.>

## The first ten seconds

<Numbered. What the Player understands before clicking anything and with nobody
saying a word, from what the first frame holds.>

## The set

| What | Where | What it says | How | Hotspot |
| --- | --- | --- | --- | --- |
| <element> | <where in the room> | <what it says about the night> | Background, or Scenery and the reason | yes, `<puzzle key>`, or no |

## The Objects here

| Key | Where | Picked up |
| --- | --- | --- |
| `lantern` | <where it sits> | from the first minute, or after `<puzzle key>`, or never |

## The cast here

| Key | Where | Facing | Doing | What it says | Moves |
| --- | --- | --- | --- | --- | --- |
| `housekeeper` | <where, against a piece of the set> | `left` | <the occupation the `default` Animation performs> | <why this spot, and what the occupation says about the night> | yes, or no |

## The route

<The corridor left between the furniture: its runs, what joins them, and every
chokepoint asked for on purpose. Then what stays outside it.>

## The opening

<What this Scene stages when it opens, as numbered beats, each naming its step.
Write `none` where the Scene opens on nothing.>

**Skippable:** <yes or no>. **What stays true if skipped:** <keys>.

## The sequences

### <name> — `<puzzle key>`

**Starts from:** <a Scene Opening, a Command Case, a Conversation alternative,
or a Game Operation>.

1. <beat> — <the step that performs it>

**Skippable:** <yes or no>. **What stays true if skipped:** <keys>.

## What changes during the game

| When | What changes | Driven by |
| --- | --- | --- |
| <after a puzzle> | <the Appearance that changes> | `<puzzle key>` |

## The lines that carry the weight

<The few moments where dialogue does work the composition cannot.>

## The ten seconds

**Expected answer:** <what the Player has understood, having been told nothing.>
```

Write `none` under a heading the game has no entries for, so that a later skill
reads an answered question rather than a missing section. The rows above are
examples of the shape; the written document carries the author's own.

Finish when the file exists at that path, every Scene of `docs/game/story.md`
has its own section, every section is present in each, and no example key from
this skill survives in the file.

### 7. Check the ten seconds

Read each Scene as the Player meets it. Take only what the first frame holds —
the set, the Objects in view, the people, their Facing and what they are doing —
and answer the Scene's own question: what has the Player understood, having been
told nothing? Whatever coordinates the game gives are given, so they are never
part of the answer.

Take back to the author every Scene whose honest answer is thinner than the one
the document claims, and fix the composition with the answer rather than the
claim. A Scene whose answer is that there are some people in a room is a Scene
that is not finished.

Then check the staging against the walls: every Character stands in the one
Scene they are in all game, every movement sits inside a Sequence, no
composition depends on a skippable Sequence having played, and every condition
any beat reads is a Game Variable this document or the puzzle document declares.

Finish when every Scene's expected answer is what the first frame actually
gives, and every staging the document asks for is one the Engine performs.

## Handoff

Report the number of Scenes staged, every coordinate the game gives the Player
and how, every occupation the cast now has to be animated doing, every Character
the game now has to move and therefore has to have a `walking` Animation for,
every row you added to `docs/game/story.md`, every Staging variable you
declared, anything the author deferred, and any name you chose rather than the
author.

End by giving the author the `Next command` from the table above, alone on its
own line, as the exact text to type.
