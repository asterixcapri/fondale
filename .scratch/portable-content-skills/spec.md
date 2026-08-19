# Portable content skills: the game owns art direction, skills own the Engine

**Status:** ready-for-human

This records decisions taken on 2026-08-19 about what the four `define-*` skills
are for, what must leave them, and what has to be built beside them. It is a
handoff: the decisions are settled, nothing has been implemented. No skill work
has started.

## Why this came up

The four content skills — `skills/define-scene/`, `skills/define-character/`,
`skills/define-object/`, `skills/define-dialogue/` — live in this repository and
are written as if this repository were the only game. They must instead serve
anyone building a game with Fondale.

The skills are authored here but installed into the game's own repository with
`npx skills`, which copies only the individual skill directory: `SKILL.md`,
`references/`, `scripts/`, `agents/`. Anything outside a skill's own directory
does not travel. That is the whole constraint, and it is already broken today:
three of the four skills point at `docs/agents/visual-direction.md`, which is
not inside any skill directory —

- `skills/define-scene/SKILL.md` (lines 20, 78, 100) and
  `skills/define-scene/references/scene-package.md` (line 102);
- `skills/define-character/SKILL.md` (line 15);
- `skills/define-object/SKILL.md` (lines 15, 33).

In a host game repository every one of those is a dead link.

## Evidence

Measured in `examples/capri-1535` while taking these decisions, and reconfirmed
before writing this file.

- **The two Characters are not at the same scale.** Michele's idle figure
  measures 247–250 px of opaque pixels inside a 256-px native cell (alpha
  bounding box of the four
  `examples/capri-1535/src/characters/michele/v3-workwear-idle-*.png` files),
  and `examples/capri-1535/art/characters/michele-v3/scale.md` states the
  approved figure as "approximately 249 pixels high, with four pixels of
  intentional transparent room below the anchor". Raffaele's
  `examples/capri-1535/src/characters/raffaele/idle.png` is `96×288` with the
  alpha touching all four edges: 288 px of figure, no padding at all. That is a
  16% difference in the height of two men standing on the same quay, and nobody
  decided it.
- **The generation prompt could not have caught it.**
  `examples/capri-1535/art/characters/raffaele/idle.prompt.md` names only a
  "288-pixel native Runtime Asset height" and mentions neither Michele nor the
  harbour. Nothing anchored the new figure to the existing one.
- **The right practice exists, but by accident.**
  `examples/capri-1535/art/scenes/harbour/provenance.md` does cite "Michele's
  approximately `249 px` near silhouette and `145 px` far silhouette" as the
  anchor for the harbour composition. One artist did it on one asset; no skill
  requires it. (Note the correction: this is the harbour's `provenance.md`, not
  a `.prompt.md` file — the harbour directory has no prompt file.)

## Decisions

**1. Art direction leaves the skills.** The skills carry only Engine mechanics:
how sizes are measured, how a walkable Scene is composed, how a generation is
anchored to what already exists. Visual style belongs to the host game.
Concretely, in `docs/agents/visual-direction.md` the "Illustrated neo-retro
language" section, the "Colour compression" rules and the palette guidance are
Capri 1535's choices and must not ship with the skills; the "Project scale"
rules and the geometry they imply are Engine invariants and must.

**2. A new setup skill.** It interviews the user with the `grilling` skill and
writes the game's own decisions into `docs/` of the host game, then wires them
into the host's `AGENTS.md` as a delimited section that never overwrites what is
already there. Proposed names, **not final**: the skill `setup-game`, the
document `docs/visual-contract.md`.

**3. The setup skill proposes defaults**, which the user approved:

- Logical Resolution `1280×720`;
- one drawn pixel equals one Scene Space unit;
- a foreground Character one third of the frame height — 240 of 720;
- the eye level slightly above the Character's head, putting the horizon around
  the upper third;
- every Scene as tall as the frame and at least as wide, wider only when it
  scrolls.

These are defaults the interview can change. Whatever comes out of the interview
is written down and then treated as law by the other skills.

**4. Rules shared between skills live in that generated document**, not
duplicated in each skill's `references/`. Duplicating them across three skill
directories would drift, and a cross-reference between two installed skill
directories is fragile because the path depends on which agent installed them.

**5. A visual skill that finds no such document stops** and tells the user to
run the setup skill. It does not invoke the setup itself.

**6. Skills name fixed paths rather than deriving them.**

**7. The setup skill also copies the Engine's public documentation** into the
host game's `docs/` and links it from `AGENTS.md`, so the game's coding agent
never needs to read Fondale's source. The staleness problem this creates is open
— see below.

**8. Every artwork generation must be anchored to what already exists.** The
real image files of an existing Character and of the target Scene are passed to
the generation as visual references, not only described in words. For the very
first asset in an empty game the reference is a neutral silhouette built from
the numbers in the setup document.

**9. Approval happens on a recomposition at actual play size** — the new asset
placed beside an existing Character and inside the target Scene — not on the
isolated image. This adds to the existing approval step rather than replacing
it.

**10. A measuring script travels inside the visual skills** and must be run on a
generated image before it is proposed. It reports the alpha bounding box: the
figure's real height and where it touches the ground. The measured value is then
written into the game's document beside the asset's name, so whoever generates
the next Character finds the true heights of the existing ones.
`skills/define-character/scripts/audit-walk-strip.py` is the precedent for a
script that ships inside a skill directory.

**11. Possible later skills for screenplay and for puzzle design** must produce
lists with citable names — Narrative Facts, Character Knowledge, Game
Operations — rather than prose, and must declare the boundary with
`define-dialogue`, which already owns those concepts. **This is a sketch, not
an agreed plan.**

## Open questions

- **A copied Engine documentation set ages** (decision 7). An agent reading a
  stale reference generates code against an interface that no longer exists. The
  proposal on the table, not decided: stamp the copy with the Engine version it
  came from and have the skills compare it with the installed version, and make
  the setup skill re-runnable so a second run refreshes the copies without
  repeating the interview. Related fact, not a decision: `docs/public` is
  already inside the npm package's `files` field (`package.json`, alongside
  `dist`, `LICENSE` and `README.md`), so an installed game already has the
  documentation under
  `node_modules/@asterixcapri/fondale/docs/public/`.
- **Final names** for the setup skill and its generated document (decision 2).
- **The scale divergence in `examples/capri-1535`** between Raffaele's 288 px
  and Michele's ≈249 px. Whichever way it is settled, the Example is the
  reference every reader of these skills will look at.
- **Singular against plural.** The skills say `art/character/<character-name>/`
  (`skills/define-character/SKILL.md` lines 49 and 56,
  `skills/define-character/references/character-package.md` line 6,
  `skills/define-character/references/walk-cycle.md` line 11) while the Example
  uses `examples/capri-1535/art/characters/`. One of the two is wrong.
- **Font licence placement.** The shipped
  `examples/capri-1535/src/hud/alegreya-sans-medium.ttf` has no licence file
  beside it, although the SIL Open Font License requires the licence to
  accompany the font wherever it is redistributed. The licence text
  does exist in the repository at
  `examples/capri-1535/art/hud/font/OFL-Alegreya-Sans.txt`, and
  `examples/capri-1535/art/hud/font/README.md` points at the font — but the
  copy that ships in `src/` travels without it.

## State of the work

The public documentation reorganisation that preceded this conversation is done
and committed. `docs/public/` now holds a `README.md` index, `quick-start.md`,
`player-experience.md`, `vocabulary.md`, `contract-index.md`, `diagnostics.md`,
`dialogue-provider.md`, thirteen per-subject guides under `authoring/`
(`project`, `scene`, `scenery`, `character`, `object`, `interaction`,
`sequence`, `dialogue`, `game-state`, `save`, `hud`, `detail-view`, `testing`),
and `recipes/` as one small playable game compiled and played by the build.

No skill work has started. Nothing in `skills/` has been changed by this
conversation.
