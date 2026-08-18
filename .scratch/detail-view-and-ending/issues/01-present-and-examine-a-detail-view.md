# 01 — Present and examine a Detail View

**What to build:** The tracer bullet for the whole feature. A Game Project
declares a Detail View — one image and a list of Hotspot areas, each carrying an
ordinary Noun Definition — and a Sequence presents it through a Game Operation.
While it is presented it replaces the world: no Character is drawn, the Player
hovers its areas and reads their advertised phrases, and looking at one answers
at once because there is nothing to approach. A second Game Operation dismisses
it and returns the Player to the world exactly as it was.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] A Game Project declares Detail Views, each with an image and Hotspots whose areas are polygons carrying a Noun Definition.
- [x] A Detail View accepts no Approach Point, Baseline, Perspective Scale or Walkable Region, and needs none.
- [x] One Game Operation presents a Detail View and another dismisses the presented one; a Sequence may use both.
- [x] Presenting a Detail View replaces the world visually and presents no Character.
- [x] Hovering an area advertises its Noun Label and phrase exactly as a Scene Hotspot does.
- [x] A Command against an area resolves immediately, with no movement stage.
- [x] The walking resolution path never asks whether a Detail View is presented; the immediate path is its own route through the interaction capability.
- [x] Presenting another Detail View replaces the presented one rather than stacking.
- [x] Dismissing returns the Player to the world with the Player Character in the same Scene, Ground Point and Facing.
- [x] A Sequence keeps running while a Detail View is presented.
- [x] The Inventory remains reachable while a Detail View is presented.
- [x] Authoring Diagnostics reject a malformed Detail View at start and name the offending path.
- [x] Core Session tests cover presenting, examining, replacing and dismissing.
- [x] A browser test proves the world is replaced, no Character is drawn, and hovering advertises inside a Detail View.
- [x] The domain glossary and the Engine documentation agree with the shipped behaviour.

## Comments

Implemented on branch `ticket/detail-view-and-ending/01-present-and-examine-a-detail-view`.

**Acceptance criteria, as observed**

- *Declared Detail Views with Hotspot polygons carrying a Noun Definition* —
  `GameProject.detailViews` holds `DetailViewDefinition` values (`image` plus
  ordered `hotspots`); each `DetailViewHotspotDefinition` carries `area`,
  `noun` and optional `when`. New capability `src/capabilities/detail-view/`.
- *No Approach Point, Baseline, Perspective Scale or Walkable Region* — the
  types offer none, and nothing in the Detail View path consults them.
- *One Game Operation presents, another dismisses; a Sequence may use both* —
  `present-detail-view` and `dismiss-detail-view`; exercised from a Command
  Case and from a Sequence in `test/detail-view.spec.ts`.
- *Presenting replaces the world visually and presents no Character* — the
  renderer hides the world Container and draws the image alone; proved by
  rendered-pixel assertions in `test/detail-view-browser.spec.ts`.
- *Hovering advertises Noun Label and phrase as a Scene Hotspot does* — the
  same HUD Noun path; the browser test reads "Guarda Sigillo" while presented.
- *A Command against an area resolves immediately, with no movement stage* —
  no `movement-started` effect and a Command Response in the same step.
- *The walking path never asks whether a Detail View is presented* —
  `Interaction.immediateInput` is a separate route with its own
  `detail-hotspot` target kind; `input`/`resume` are unchanged and cannot
  match a Detail View target.
- *Presenting another replaces rather than stacks* — committed state holds one
  `detailView`; asserted by presenting `registry` over `seal`.
- *Dismissing returns the Player to the world unchanged* — the whole
  `characters.player` record (Scene, Ground Point, Facing) is compared before
  and after in the browser test.
- *A Sequence keeps running while presented* — the Sequence branch precedes the
  Detail View branch in input handling; asserted with a Narration step between
  present and dismiss.
- *The Inventory remains reachable* — not suspended; an Object is selected and
  used on a detail in the Core Session test, and the trigger is asserted
  visible in the browser test.
- *Authoring Diagnostics name the offending path* —
  `definition.detail-view.image`, `definition.detail-view.bounds`,
  `reference.detail-view` and the shared polygon codes, all at
  `detailViews.<id>...` paths; `asset.detail-view.dimensions` rejects an image
  that does not match the Logical Resolution.
- *Core Session tests cover presenting, examining, replacing and dismissing* —
  `test/detail-view.spec.ts` (7 tests), plus a Save Snapshot round-trip;
  `src/capabilities/detail-view/index.spec.ts` (4 tests).
- *Browser test proves replacement, no Character, and hover* —
  `test/detail-view-browser.spec.ts` (2 tests).
- *Glossary and Engine documentation agree* — `CONTEXT.md` already defined
  Detail View and the surface-owned Hotspot; `docs/public/reference.md`,
  `docs/public/concepts.md` and `docs/engine-architecture.html` now describe
  the shipped behaviour.

**Verification**

- `npm run build` passes (type-check, library build, dialogue server,
  architecture, architecture-doc, release-preparation and documentation gates).
- `npm run verify`: 322 passed, 3 failed — all three in
  `test/multi-row-animation-sheet-browser.spec.ts`. They fail identically on
  the base commit `4ac33c8` in a full run and pass in isolation, so they are a
  pre-existing timing flake, not a regression from this ticket.

**Notes for the next tickets**

- The Ending, travel from a Detail View, nesting and Appearance-swapping stay
  out, as the spec requires.
- `samePresentedTarget` now lives in HUD, which owns the presented-target
  union; World no longer exports a target comparison.
