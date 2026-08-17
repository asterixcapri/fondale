# 05 — Build the drifting-boat Scene package

**What to build:** Deliver the dusk drifting boat as an independently playable,
production-ready Scene package. A small isolated Game Project can board the
damaged vessel, follow its environmental trail and approach the wounded sailor
before the canonical final encounter and bundle transfer are integrated.

**Blocked by:** 01 — Lock the project scale and reference Michele.

**Status:** resolved

- [x] The drifting boat has an accepted dusk Composition Art Master, clean Background Art Master, Runtime Background and exact-size geometry diagnostic.
- [x] The intended Scene Size is `1280×720` and changes only if final blocking proves another exact size necessary.
- [x] The cramped vessel supports a clear connected route, valid approaches and native-resolution Michele without implausible deck scale.
- [x] Cut rigging, a forced chest, an abraded vessel name and blood form a readable environmental trail.
- [x] Every clue has a valid Hotspot and remains environmental storytelling rather than a blocking mechanical puzzle.
- [x] The wounded sailor is a stationary Character represented by exactly one newly produced scale-correct static Runtime image, with no presentation variants.
- [x] Foreground hull, rigging and shelter elements occlude Michele intentionally without navigation clipping.
- [x] The composition reserves the exact handoff position and framing required by the later bundle Sequence.
- [x] Dusk lighting remains part of the shared illustrated neo-retro language established by the other Scenes.
- [x] An isolated browser fixture boards, explores and reaches the sailor through the public packaged API.
- [x] The package builds without depending on the harbour, cloister or fortification Scene packages.

## Comments

- 2026-08-17 — Completed the independent `1280×720` Scene package with clean
  and assembled Art Masters, four separated depth overlays, an exact geometry
  diagnostic, one static wounded-sailor Runtime image and actual-size Character
  diagnostic. The isolated browser fixture boards from a stub, exercises all
  four environmental clues, checks far/middle/near Michele scale and reaches
  the sailor through the packaged public API.
- 2026-08-17 — Root and Example builds pass. The isolated boat verification
  passes. The root browser suite is load-sensitive in unrelated pre-existing
  animation/Camera/HUD tests (308/311 parallel; targeted retries pass), and the
  Example's five canonical acceptance cases remain stale against this
  harbour-only base; all independent Scene package fixtures pass.
- 2026-08-17 — Required gate remains blocked outside ticket scope. With no
  other Playwright, Vite, build or verify process running, two complete
  `npm run build && npm run verify` executions both built successfully and
  reached `310/311`; one missed an intermediate frame in the pre-existing
  non-looping multi-row Scenery timing test, while the next failed the
  pre-existing multi-row Character phase sample. The ticket diff from base
  changes neither `test/multi-row-animation-sheet-browser.spec.ts` nor Engine
  animation/browser code. Satisfying this nondeterministic repository gate
  requires an out-of-scope correction to that test or its Engine timing seam,
  so the completed Scene package is handed to a human rather than represented
  as fully verified.
- 2026-08-17 — Human override confirmed the complete root gate on an isolated
  port: `FONDALE_TEST_PORT=5373 npm run verify -- --workers=4` passed `311/311`
  in `50.0s`, including the full multi-row Animation suite. Earlier failures
  reused a Capri dev server occupying port `5173` instead of the root fixtures.
