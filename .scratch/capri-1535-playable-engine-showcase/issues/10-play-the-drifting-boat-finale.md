# 10 — Play the drifting-boat finale

**What to build:** Connect the fortification sighting to the completed
drifting-boat package and deliver the canonical end of the prologue. Michele
follows the environmental trail, meets the wounded sailor, receives the
oilskin bundle and opens it to reveal the broken ship seal and registry
fragment.

**Blocked by:** 05 — Build the drifting-boat Scene package; 09 — Integrate the boat sighting.

**Status:** resolved

- [x] The final Passage becomes available only after the boat-sighting outcome is committed.
- [x] Every environmental clue is inspectable and builds tension without blocking the sailor encounter.
- [x] The sailor remains unnamed and recognises Michele through his resemblance to his father.
- [x] Exact canonical wording and choreography use authored Lines, Narration and Sequence direction.
- [x] The sailor gives Michele one oilskin-bundle Object through an explicit valid lifecycle transition and loses consciousness.
- [x] The bundle has a distinct Inventory Appearance and stable wrapped and opened Appearances at the correct presentation scale.
- [x] Opening the bundle changes the existing Object and reveals the seal and registry fragment without spawning unused puzzle Objects.
- [x] The sailor's identity, survival and further history remain unresolved.
- [x] The final state marks the prologue complete and retains the opened bundle and committed knowledge in continuation.
- [x] Browser acceptance proves travel, clue exploration, encounter, transfer, opening and cliffhanger.

## Comments

- 2026-08-17, policy agreed with the user during ticket 09: do not run the
  obsolete test files (`test/acceptance.spec.ts`, `test/michele.spec.ts`,
  `test/harbour.spec.ts`) ticket by ticket; they are rebuilt or removed by
  tickets 11/12. Per-ticket verification runs the current specs only:
  cloister, fortification, drifting-boat, harbour-opening, boat-sighting,
  dialogue-server-unreachable, plus the ticket's own new spec.

- 2026-08-17, handoff note (agent replaced mid-ticket): WIP commit `08b56ed`
  on `ticket/capri-1535-10` contains the full finale content draft: oilskin
  bundle Object (wrapped/opened Scene Appearances, Inventory Appearance,
  procedural ImageMagick masters + provenance/scale docs under
  `art/objects/oilskin-bundle/`), bundle hotspot in the drifting-boat Scene,
  `sailorEncounter` and `bundleOpening` Sequences, wounded-sailor
  `unconscious` Appearance plus conditional talk-to/look-at cases, three new
  Narrative Facts (`sailor-sailed-with-micheles-father`,
  `oilskin-bundle-received`, `bundle-holds-broken-seal` setting
  `prologueComplete`), `sailorEncountered`/`prologueComplete` variables, game
  registration at version 13, hotspot-count updates in drifting-boat and
  boat-sighting specs, fixture registration of the bundle, and the new
  `drifting-boat-finale.spec.ts` (full-chain encounter + opening +
  continuation, plus a skip variant). Root `npm run build` and `tsc --noEmit`
  are green with this content.
- NOT verified: the finale spec stalls inside `reachRepairedHarbour`, and
  `boat-sighting.spec.ts` fails the same way on this branch although it was
  green at base `4343730` — a regression is suspected in the wiring diffs
  (game.ts / variables.ts / narrative-facts.ts / drifting-boat/index.ts).
  Debug evidence: the chain completes job, nets, oil and reaches the harbour
  exit reveal, but the "Passaggio verso il chiostro" polygon centre never
  enters the 16..1264/16..704 viewport window and left-edge pan clicks do not
  pan the Camera, so the helper loops until timeout.
- Environment notes for the next agent: `examples/capri-1535` needs its own
  `npm ci` (the root install does not cover it); run the example suite with
  `CAPRI_TEST_PORT`/`CAPRI_ORDINARY_PORT` overrides so Playwright does not
  reuse another checkout's dev servers (main now uses ephemeral ports and
  `reuseExistingServer: false`, overrides remain valid).
- 2026-08-17, handoff resolved. The suspected wiring regression did not
  exist: `boat-sighting.spec.ts` stalls identically at the base commit
  `4343730`, so the WIP content was never the cause. A Playwright trace of
  the base run located the real defect in the chain helper introduced by
  ticket 09: the letter-give recovery step clicks the Conversation's `Leave`
  button, the suite declares no default action timeout, and the click on an
  absent button therefore waits forever instead of failing. The 6s
  acknowledgement window was also shorter than Michele's walk to Elia, so
  the recovery path was entered on every run. Bounding the recovery click
  and widening the window makes both chain specs green.

- Recommended next steps (historical, superseded): (1) confirm boat-sighting green in a throwaway
  worktree of `4343730`; (2) bisect the WIP wiring diffs to find the
  regression (try reverting game.ts/variables.ts/narrative-facts.ts
  registrations first, keeping the new files unregistered); (3) if the chain
  is base-broken instead, investigate the passage-viewport/pan pattern above;
  (4) then run the finale spec and finish the acceptance checkboxes, visual
  review of the bundle at play size included. Ticket status left `claimed`.

## Verification

- 2026-08-17: root `npm run build` green (package build, dialogue-server
  build and tests, typecheck, architecture, architecture-doc,
  release-preparation and docs gates) and root `npm run verify` green with
  312 browser tests. Example `npm run typecheck` green.
- Example browser acceptance, serial run of every current spec
  (`--workers=1`): 14 passed in 20.0m — cloister, fortification,
  drifting-boat, harbour-opening (6 tests incl. winch contact and the skip
  variant), boat-sighting (both variants), dialogue-server-unreachable and
  the new `drifting-boat-finale` (full chain and skip variant). The
  obsolete specs (acceptance, michele, harbour) were not run, per the
  policy agreed during ticket 09. Running the example suite with parallel
  workers is unreliable: the specs share one dev server and one
  continuation store, so verification must stay serial until tickets 11/12
  rebuild the suite.
- Three defects surfaced by the new finale spec were fixed rather than
  worked around: the unbounded recovery click described above; the isolated
  `fortification` and `drifting-boat` fixtures failing Project validation
  because the shared sailor and bundle Nouns now reference Sequences and
  Game Variables the fixtures did not declare; and `fortification.spec.ts`
  asserting Scene-package requests in network arrival order, which shifts
  as soon as the Project declares more content.
- The finale spec reaches `talk-to` on the sailor with the secondary mouse
  button, the way a Player does when the preferred verb is `look-at`, and
  waits for the boat-arrival Sequence to finish before driving the climb.
- Visual review at actual play size confirmed the wrapped bundle beside the
  sailor, its disappearance from the deck on handoff and the opened bundle
  on the deck at the cliffhanger (`capri-1535-finale-sailor-unconscious`,
  `capri-1535-finale-opened-bundle`,
  `capri-1535-finale-skipped-encounter`).
- Known limitation carried forward: the three bundle Art Masters are still
  the procedurally drawn ones described in
  `art/objects/oilskin-bundle/provenance.md`. No image-generation tool was
  available in this environment either, so they were not redrawn. At play
  size the scale, silhouette and dusk grade read correctly, but the opened
  bundle is flatter than the illustrated neo-retro direction of the
  surrounding artwork; regenerating it is a candidate follow-up for an
  environment that has the image tooling.
