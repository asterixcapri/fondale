# Test strategy: put every check on the cheapest plane that can hold it

**Status:** ready-for-agent

This records decisions taken on 2026-08-18/19 about how this repository tests
itself, and what follows from them. It is a handoff: the decisions are settled,
the implementation is not.

## Why this came up

The Example's acceptance suite takes **33.9 minutes** for 34 tests. During the
`detail-view-and-ending` effort it was run three times as an integration gate,
which cost more wall-clock than most of the implementation work. Measurements
taken while investigating:

- `examples/capri-1535` runs `workers: 1` and `fullyParallel: false`,
  deliberately: an earlier attempt at Playwright's default (one worker per two
  cores, so eleven here) starved the CPU and made a dozen cases a lottery.
- Half the suite is two files: `harbour-opening.spec.ts` (10.2 min, 7 tests,
  one of them 4.9 min on its own) and `acceptance.spec.ts` (6.8 min).
- Fixed `waitForTimeout` sleeps across the whole suite total **48.5 s** — 2% of
  the runtime. The cost is real simulated time (walks, Lines advancing at
  reading speed, Camera scrolling), not careless sleeps.
- The Engine's own suite runs **350 tests in about 50 seconds** at the root.
- **The Example has no Core-level test layer at all**: all thirteen of its spec
  files drive a browser.

That last point is the finding the decisions below rest on. Facts the Engine can
state headlessly in milliseconds — which Nouns exist, which Hotspots appear as
Game State changes, what a Command answers, whether skipping commits what
playing commits — are being paid for at browser prices in the Example.

## Decisions

**1. The full Example suite is never a local gate.** While working on a Scene,
run that Scene's spec (`npx playwright test drifting-boat.spec.ts` is ~40 s).
The fast gates stay local: `npm run build` at the root (typecheck, architecture,
documentation) and the Engine suite.

**2. If the full Example suite runs anywhere unattended, it runs in CI.** There
is no CI in this repository today: `.github/workflows/` does not exist, and only
Dependency Graph and Pages are active on GitHub. Waiting half an hour locally
per branch and again per merge is not an acceptable cost.

**3. The Example does not test animation.** Animation timing is the worst thing
to assert automatically: it depends on machine load, and when it fails it has
usually found a busy CPU rather than a defect. The Engine's own
`multi-row-animation-sheet-browser.spec.ts` is the only chronically flaky spec
in the repository, which is the evidence for this rule rather than an exception
to it.

**4. The Example does not test that Scenes or assets load.** Every asset is a
static ESM import (`import backgroundUrl from "./background.png"`), and no path
is built as a string at runtime, so a missing or renamed file **fails the
build** in seconds. A runtime load assertion re-checks at the highest possible
cost what the compiler already guarantees. The one case the build cannot catch —
a valid reference to the wrong image — is also the one a load assertion cannot
catch, and a human sees it immediately.

**5. The Example tests the game as puzzles.** State-level truths, asserted where
they are cheap: a Fact learned, a Variable committed, a Hotspot withdrawn, an
Ending reached, ordinary playback and skipping converging on the same canonical
Game State.

**6. Visual correctness is a human review, not a suite.** The project already
carries the convention for it: the `actual-size-diagnostic.png` each art package
keeps, showing the Runtime cell at 1:1 inside the Logical Resolution with its
cell bounds and Visual Anchor drawn, as the record of a size review that a
person passed. Scale errors — the kind that leave Game State perfectly correct
while the Character is drawn at the wrong deck scale — are caught there.

## What has to be built for these to hold

- **A Core-level test layer for the Example.** It does not exist. Decision 5 has
  nowhere to land until `createTestSession` is driven against the Example's own
  `project`, the way the Engine's `test/*.spec.ts` already do. This is the
  enabling piece; everything else is subtraction.
- **A spec-by-spec pass** over the thirteen Example specs, deciding for each
  whether it migrates to Core, shrinks, or goes. Do not do this from the titles
  alone — see the correction below.
- **A CI workflow**, if decision 2 is taken up, running the full Example suite
  on push. Note it would not block anything: the project commits directly to
  `main` with no pull requests, so a failing workflow notifies rather than
  gates. Scoping it to pushes touching `src/` and `examples/` keeps the cost
  down on a private repository.

## Open questions

- **`page.clock`.** Playwright 1.62 is installed, which has the virtual-clock
  API. If it intercepts `requestAnimationFrame` and `performance.now()` the way
  Pixi's ticker consumes them, the browser tests that survive stop waiting for
  game time altogether and become deterministic — advance ten seconds instantly,
  render a numbered frame rather than sampling after a sleep. Worth a half-hour
  spike on a single test before anything is built on it. **This supersedes an
  earlier proposal** to add a simulation-rate option to `StartGameOptions`: no
  public Engine API change is needed if the harness can fake the clock.
- **The flaky `multi-row-animation-sheet-browser.spec.ts`.** Three tests that
  fail intermittently under the root suite's multi-worker run and pass in
  isolation, reconfirmed several times during the last effort. Either quarantine
  them, make them deterministic with `page.clock`, or accept under decision 3
  that animation phase is not a machine-checked property. Not decided.
- **`harbour-opening.spec.ts:244`**, "Michele installs the handle at contact and
  every response to Raffaele opens the fortification", takes 4.9 minutes alone —
  15% of the whole suite. It reads as three tests wearing one name.

## A correction worth carrying forward

While surveying, `harbour.spec.ts` was first judged to duplicate the Engine's
`camera-scrolling.spec.ts`. Reading it, it does not: the Engine verifies the
clamping algorithm, while the Example verifies that *this* 1920-point quay seen
through a 1280-point Camera leaves the winch reachable at one edge and Raffaele's
boat at the other. That is content, not mechanics. The suspected duplication in
the other files (`michele.spec.ts` against `character-facing-browser.spec.ts`,
`knowledge-dialogue.spec.ts` against `knowledge-driven-dialogue-browser.spec.ts`,
`dialogue-resilience.spec.ts` and `dialogue-server-unreachable.spec.ts` against
`dialogue-server-url-browser.spec.ts`) was also read from titles only and has
not been verified.

## How real engines do this

For reference, since it shaped the decisions above. Web engines drive simulation
on an injected clock and assert state — never wall-clock waits; this repository
already does that with `CoreSession.steps(n)`. Visual correctness, where it is
automated at all, is done as reference-image comparison at a deterministic
frame, with the environment pinned (fixed browser and GPU, usually a container)
and a per-pixel tolerance, run nightly or on demand rather than per commit, and
kept in its own quarantined tier. The separation of planes — thousands of logic
tests in milliseconds, a few slow visual ones — is the standard shape.
