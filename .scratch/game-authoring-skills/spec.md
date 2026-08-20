# Game authoring skills: from an idea to a playable short adventure

**Status:** ready-for-agent

## Problem Statement

Fondale is a complete Engine with complete public documentation, and nobody
outside this repository can build a game with it.

Four content skills exist — `define-scene`, `define-character`, `define-object`,
`define-dialogue` — and all four are written as if this repository were the only
game. They are installed into a game's own repository with `npx skills`, which
copies one skill directory and nothing else, so three of them arrive with a dead
link to `docs/agents/visual-direction.md` and lose the only place their scale
rules were written down.

Worse, those rules were never a value anyone could read. `visual-direction.md`
says to use the reference Character and to preserve the established ratio, but
no file anywhere records what that ratio is for a given game. Every generation
re-decides it by interpreting a sentence. The measured result in
`examples/capri-1535` is Michele at roughly 249 px and Raffaele at 288 px — two
men standing on the same quay, 16% apart in height, and nobody decided it.

And the four skills only cover the fabrication of an asset for a game that
already exists. Somebody starting with an empty repository, an installed
package and an idea has nothing: no skill takes them from that point to a Scene
they can walk across, and nothing tells them in which order to work.

## Solution

Six skills and one script, arranged as a pipeline where each step leaves a
document in the game's own repository and the next step reads it.

Three interviews establish what the game is. `define-story` settles what exists
and what is true. `define-puzzles` settles why the Player cannot reach the end
immediately. `setup-game` settles how large the world is and what it looks like.
Each runs `grilling`, and each writes a document with stable keys and extractable
values rather than prose.

Construction is then ordinary work on the issue tracker: `/to-tickets` reads the
story and the puzzles and produces tickets with blocking edges, and `/implement`
executes them one per session. Those skills already exist and are not rewritten.

Three fabrication skills — `define-scene`, `define-character`, `define-object` —
are invoked by `implement` whenever a ticket needs artwork, and by hand
afterwards whenever the author wants to redo a Character or fix a Scene. They
are the only skills that call `imagegen`, and they replace the three visual
skills that exist today.

The scale stops being a rule and becomes a measured value. The game declares a
scale anchor, how many world units it stands for, and how many pixels it
measures; every other asset's target is arithmetic from there. A generated image
is normalised to its target by a script rather than by asking the generator
again, and the true measurement is written back into the game's asset register.

Because the shared values live in the game and the Engine's contract lives in
the installed package, the skills themselves carry only mechanism, and are
portable to any game.

## User Stories

1. As a game author with an empty repository, I want a first skill that asks me
   what my game is about, so that I can start without knowing Fondale's
   vocabulary.
2. As a game author, I want the story interview to produce a written document,
   so that the decisions survive the session that made them.
3. As a game author, I want the story document to name every place, Character,
   Object and Narrative Fact, so that later steps have something to refer to.
4. As a game author, I want those names to be the ones the Game Project will use
   as registry keys, so that nothing has to be renamed later.
5. As a game author, I want a separate skill for the puzzles, so that designing
   the story and designing the obstacles stay distinct jobs.
6. As a game author, I want each puzzle written as what it needs, what the Player
   does and what changes, so that its dependencies are visible.
7. As a game author, I want the puzzle skill to add a missing Object or Character
   to the story document when a puzzle requires one, so that the two documents
   never contradict each other.
8. As a game author, I want to express puzzles that can be solved in any order
   and converge on a single gate, so that my game can be non-linear without
   becoming unmanageable.
9. As a game author, I want a setup skill that asks how large my world is, so
   that every asset afterwards is generated at a size somebody decided.
10. As a game author, I want to declare a scale anchor in my own terms, so that
    the process works whether my game is about people, insects or robots.
11. As a game author whose game has no visible Player Character, I want the scale
    anchor to be any asset I choose, so that the process still applies.
12. As a game author, I want proposed defaults for resolution and Character
    height, so that I can accept sensible values instead of inventing them.
13. As a game author, I want to override any proposed default, so that the
    process does not impose another game's look on mine.
14. As a game author, I want the setup skill to record the artistic direction of
    my game, so that generations are consistent without me repeating myself.
15. As a game author, I want the setup skill to write the HUD theme decisions
    alongside the world decisions, so that the interface matches the game.
16. As a game author, I want the setup skill to write a section into my
    repository's AGENTS.md, so that any agent working in my repository knows the
    rules without me explaining them.
17. As a game author re-running the setup skill, I want my existing AGENTS.md
    content preserved, so that the skill never overwrites my own instructions.
18. As a game author, I want an asset register listing every asset the game needs
    with its intended size, so that I know what remains to be made.
19. As a game author, I want each skill to state which documents it reads and
    which it writes, so that I can tell what depends on what.
20. As a game author who invokes a skill too early, I want it to stop and name
    the skill I should run first, so that I cannot silently produce work built on
    nothing.
21. As a game author, I want each skill to end by telling me the exact command to
    type next, so that the pipeline is followable without me memorising it.
22. As a game author, I want `/to-tickets` to read my story and puzzle documents,
    so that I do not have to restate the game in a conversation.
23. As a game author, I want a ticket to be one puzzle that can be played from
    beginning to end, so that every completed ticket is something I can try.
24. As a game author, I want tickets ordered by their real dependencies, so that
    I never build something that cannot yet be reached.
25. As a coding agent implementing a ticket, I want the game's AGENTS.md to point
    at the Engine documentation, so that I write against the real interfaces
    without reading the Engine's source.
26. As a coding agent implementing a ticket, I want to be told to invoke the
    fabrication skills rather than generate artwork myself, so that assets are
    not produced at an arbitrary size.
27. As a game author, I want the first visual asset to be the Player Character,
    so that everything else has an anchor to be measured against.
28. As a game author, I want Scenes to be buildable with placeholder Backgrounds
    at their exact final dimensions, so that the game is walkable long before it
    is beautiful.
29. As a game author, I want replacing a placeholder with finished art to change
    no coordinate, so that finishing the artwork cannot break the game.
30. As a game author, I want `define-scene` to derive the Walkable Region and the
    Perspective Scale from the world contract, so that Characters are the right
    size at every depth.
31. As a game author, I want `define-scene` to produce a navigable stage rather
    than a decorative one, so that walking to a target does not take an absurd
    route.
32. As a game author, I want `define-character` to produce every Facing and
    Animation at one consistent height, so that a Character does not change size
    when it turns or walks.
33. As a game author, I want `define-object` to size an Object relative to the
    Character that will carry it, so that a lantern is not the size of a door.
34. As a game author, I want an Object's Inventory Appearance treated on the UI
    scale rather than the world scale, so that it is legible in the bag.
35. As a game author, I want every generation to receive the existing artwork as
    a visual reference, so that a new asset resembles the ones already made.
36. As a game author making the very first asset in an empty game, I want a
    neutral reference derived from the declared numbers, so that the process
    works with nothing to anchor to.
37. As a game author, I want a generated image measured before it is offered to
    me, so that its real height is known rather than assumed.
38. As a game author, I want a generated image normalised to its target height
    automatically, so that approving artwork is not a negotiation with the
    generator.
39. As a game author, I want the measured height written into the asset register,
    so that whoever makes the next asset finds the true size of the existing
    ones.
40. As a game author, I want to approve artwork as it will be seen in play —
    beside a Character, inside its Scene, at actual size — rather than as an
    isolated image, so that I am judging the thing the Player will see.
41. As a game author six months later, I want to invoke `define-character` on its
    own to redo a Character, so that maintenance does not require replaying the
    whole pipeline.
42. As a game author, I want the skills to work in my repository without a copy
    of the Engine's documentation, so that nothing I read goes stale as the
    Engine advances.
43. As a game author, I want the skills to contain no reference to any particular
    game's art style, so that my game looks like mine.
44. As a game author, I want the process to be honest about how long it takes, so
    that I do not abandon it expecting a demo in an afternoon.
45. As a skill maintainer, I want the fabrication cycle written once and
    generated into the three visual skills, so that three installed copies cannot
    drift apart.
46. As a skill maintainer, I want the measurement script covered by tests, so
    that the one piece of real code in this system is known to work.

## Implementation Decisions

**Six skills, cut by trade.** A skill exists where there is a craft the Engine's
documentation does not teach. `docs/public` already teaches the contract, so the
skills carry procedure, not reference. `define-story`, `define-puzzles` and
`setup-game` are interviews; `define-scene`, `define-character` and
`define-object` are fabrication. Nothing else earns a skill.

**`define-dialogue` is removed.** Dialogue in Fondale is declarative data —
knowledge with Disclosure levels, Cover Stories, Relationships, authored
alternatives — fully documented with a complete example. There is nothing to
measure, generate or lay out, so an agent authors it from the guide like a
Sequence or a Command Case. The part that is genuinely hard, deciding who knows
what and who conceals it, is narrative design and belongs to `define-story` and
`define-puzzles`, where Narrative Facts are born.

**Five documents at fixed paths** under `docs/game/` of the host game:
`story.md`, `puzzles.md`, `world.md`, `assets.md` and `progress.md`. Paths are
named literally by the skills, never derived or configured. Documents are
written for an agent to extract values from and for a human to read: stable keys
and tabulated values, not prose. Each document records which documents it derives
from, so that changing one shows what must be revisited.

**Each skill declares its inputs and outputs** in its own text, checks for the
documents it consumes, and stops naming the skill to run first when one is
missing. It never invokes that skill itself.

**Scale is a measured value, not a rule.** `world.md` declares a scale anchor —
which asset it is, how many world units it stands for, how many pixels it
measures at Perspective Scale 1 — and every other asset's pixel target is
computed from its declared size in the same unit. What the unit means is the
game's business; the skills only do the arithmetic. `assets.md` holds one row per
asset: the declared size before fabrication, the measured height after.

**The measured value is written by the script, never by hand.** This is the
defect that produced Michele at 249 and Raffaele at 288: a prompt declaring a
number nobody checked.

**The script normalises, it does not only measure.** Image generation cannot be
asked for a figure exactly 249 px tall and be relied upon to deliver one, and
iterating with the generator over a twelve-pixel discrepancy does not converge.
Generation decides how the figure looks; the script decides how tall it is, by
cropping to the alpha bounding box and rescaling to the target. It reports the
resulting height and ground contact and writes them into the register.

**The script is Node invoking ImageMagick.** ImageMagick is an already-declared
dependency of this repository's art tooling; Node is guaranteed present because
a Fondale game is a TypeScript web project. This keeps Python out of the host
game's prerequisites and puts the tests in the `node --test` pattern the
repository's other tools already use.

**The shared fabrication cycle is generated, not copied by hand.** Anchor,
generate, measure, normalise, recompose, approve, register is identical for a
Scene, a Character and an Object, and `npx skills` installs the three directories
separately, so a cross-reference between them is not available and hand-copied
prose would drift. One source in this repository produces the three SKILL.md
files.

**Skills read the Engine documentation from the installed package**, under the
package's own `docs/public`, rather than copying it into the host game. The
package already ships that directory, so the documentation an agent reads is
always the version of the Engine the game is built against, and the staleness
problem does not arise.

**The skills assume a side-on or three-quarter view with a walkable ground plane
and a horizon**, and say so. Perspective Scale is defined as stops on Scene Space
`y`, so this is what the Engine is built to express; a skill that assumed nothing
would have nothing to teach.

**Art direction leaves the skills.** The illustrated neo-retro language, the
colour compression rules and the palette guidance in `docs/agents/visual-direction.md`
are Capri 1535's choices and are not carried by the skills. The parts of its
Project scale section that hold for any Fondale game — one world scale calibrated
on a reference asset, Perspective Scale used only for depth and never to repair
an asset authored at the wrong size, HUD and Inventory calibrated on the Logical
Resolution as a separate UI scale — become mechanism the skills keep.

**The three visual skills are rewritten rather than corrected.** Their present
text is a source to quarry, not a base to patch.

**Construction reuses the existing skills.** `/to-tickets` and `/implement` are
not reimplemented. They carry `disable-model-invocation`, so no skill of ours can
start them: each of ours ends by telling the author the exact command to type.
Their customisation — that a vertical slice is one playable puzzle, that assets
are made by invoking the fabrication skills, where the documents and the Engine
guides live — goes in the section `setup-game` writes into the game's AGENTS.md,
never into those skills themselves.

**`/to-spec` is skipped in the game workflow.** It exists to extract structure
from a conversation, and the three interview documents already are that
structure.

**Build order is fixed on one point:** the first visual asset is the Player
Character, because it is the anchor every other asset is measured against.

**Placeholders precede artwork.** Scenes are built with schematic Backgrounds at
exactly the Scene Size the Engine validates, so a placeholder and the finished
Art Master are contractually the same object and substituting one for the other
changes no authored coordinate. `docs/public/recipes` is the precedent.

## Testing Decisions

A good test here exercises external behaviour: what the tool does to a file, not
how it decides to do it. Five of the six deliverables are Markdown for agents and
have no automatable seam; they are validated by being executed.

**One seam: the normalisation script's command line.** Given an input PNG and a
target, it produces a normalised PNG and a register row. Tests drive the command
and assert on the output image's dimensions, its alpha bounding box and the
reported measurements. No internal seam is introduced: cropping, rescaling and
register writing are not tested separately.

Fixtures are synthetic PNGs generated by the test itself, covering a figure with
symmetric padding, a figure touching all four edges, a figure with asymmetric
padding, a figure whose target is larger than its source, and a fully transparent
image. The last must fail cleanly rather than report a degenerate bounding box.

**Prior art:** `tools/verify-architecture.mjs`, `tools/verify-docs.mjs` and
`tools/verify-release-preparation.mjs` each sit beside a `.spec.mjs` run with
`node --test` from `npm run build`. The script's tests follow that arrangement
and join the same build step. `skills/define-character/scripts/audit-walk-strip.py`
is the precedent for a script shipped inside a skill directory.

**The generated skill files are verified**, not their prose: a check asserts that
the three SKILL.md files match what the shared source generates, so a hand edit
to one of the three fails the build instead of drifting silently.

**End-to-end validation is manual and explicit:** a short adventure built from
nothing in an empty repository, following only the pipeline. It is the only
evidence that the process works, and the place where unforeseen requirements will
appear. It is not automatable and must not be claimed as a passing test.

## Out of Scope

**The dead-end verifier.** Enumerating reachable states to prove the game stays
completable is the strongest thing this process could offer, and it is deferred.
`puzzles.md` nonetheless keeps the "what it needs / what you do / what changes"
form, which `/to-tickets` needs for dependencies anyway, so the input exists if
the verifier is built later.

**Multi-chapter games.** The target is one short adventure of roughly a dozen
locations, ten Characters, twenty Objects, one to two hours of play — Part One of
Monkey Island as the measure. Chapters as separate Game Projects are ruled out:
Save Snapshots carry Project Identity and Version and are refused across them,
and Continuation State is one per Identity, so nothing would carry over.

**Art direction inside the skills.** The skills carry no visual style of their
own and never say what a game should look like. A game still has a direction: it
is settled by the `setup-game` interview, recorded in `world.md`, and cited by
every generation. What is out of scope is a style shipped in the skills, which
would make every Fondale game resemble Capri 1535.

**Shipping the skills inside the npm package.** They stay in this repository and
install with `npx skills`.

**Changes to the Engine.** This spec is skills and one script; no Engine source
is touched.

**Rewriting `/to-tickets`, `/implement` or `/grilling`.**

## Further Notes

`.scratch/portable-content-skills/spec.md` records an earlier round of decisions
on the same subject and is superseded by this one. Its evidence remains valid —
the measurements, the dead links, the observation that one artist anchored the
harbour composition to Michele's silhouette by accident rather than by
instruction. Its decisions 2, 4, 5, 6, 8, 9 and 10 survive here in stronger form;
its decision 7, copying the Engine documentation into the host game, is reversed;
its decision 11 is settled by removing `define-dialogue` and adding
`define-puzzles`.

Open defects in `examples/capri-1535`, which is the example every reader of these
skills will look at, and which will contradict them until settled: Raffaele
stands 288 px against Michele's roughly 249 with no decision behind the
difference; `skills/define-character` writes `art/character/<name>/` while the
example uses `art/characters/`; and the shipped font in the example's `src/`
travels without the OFL licence text that exists elsewhere in the repository.

Coherence beyond scale — light, palette, edge treatment, whether two Characters
look drawn by the same hand — is not measurable and stays a human judgement. The
visual references and the play-size recomposition improve the odds; the skills
should not pretend to guarantee it.
