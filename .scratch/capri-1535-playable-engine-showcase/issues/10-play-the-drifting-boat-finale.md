# 10 — Play the drifting-boat finale

**What to build:** Connect the fortification sighting to the completed
drifting-boat package and deliver the canonical end of the prologue. Michele
follows the environmental trail, meets the wounded sailor, receives the
oilskin bundle and opens it to reveal the broken ship seal and registry
fragment.

**Blocked by:** 05 — Build the drifting-boat Scene package; 09 — Integrate the boat sighting.

**Status:** claimed

- [ ] The final Passage becomes available only after the boat-sighting outcome is committed.
- [ ] Every environmental clue is inspectable and builds tension without blocking the sailor encounter.
- [ ] The sailor remains unnamed and recognises Michele through his resemblance to his father.
- [ ] Exact canonical wording and choreography use authored Lines, Narration and Sequence direction.
- [ ] The sailor gives Michele one oilskin-bundle Object through an explicit valid lifecycle transition and loses consciousness.
- [ ] The bundle has a distinct Inventory Appearance and stable wrapped and opened Appearances at the correct presentation scale.
- [ ] Opening the bundle changes the existing Object and reveals the seal and registry fragment without spawning unused puzzle Objects.
- [ ] The sailor's identity, survival and further history remain unresolved.
- [ ] The final state marks the prologue complete and retains the opened bundle and committed knowledge in continuation.
- [ ] Browser acceptance proves travel, clue exploration, encounter, transfer, opening and cliffhanger.

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
- Recommended next steps: (1) confirm boat-sighting green in a throwaway
  worktree of `4343730`; (2) bisect the WIP wiring diffs to find the
  regression (try reverting game.ts/variables.ts/narrative-facts.ts
  registrations first, keeping the new files unregistered); (3) if the chain
  is base-broken instead, investigate the passage-viewport/pan pattern above;
  (4) then run the finale spec and finish the acceptance checkboxes, visual
  review of the bundle at play size included. Ticket status left `claimed`.
