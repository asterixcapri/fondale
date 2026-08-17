# 09 — Integrate the boat sighting

**What to build:** Connect the repaired harbour route to the completed
fortification package and stage the drifting boat's arrival. Michele climbs to
the lookout and observes a directed Sequence combining Scenery Animation,
Motion and Camera cut, move, hold and follow before the final Scene unlocks.

**Blocked by:** 04 — Build the fortification Scene package; 08 — Repair the winch and confront Raffaele.

**Status:** resolved

- [x] The harbour-to-fortification Passage is eligible only after the repaired-winch outcome is committed.
- [x] Arrival begins at the lower landing with a coherent Facing and Camera origin.
- [x] Michele can climb the complete vertical route while the Camera follows Scene Space naturally.
- [x] The distant boat is separated Scenery with scale-correct transparent artwork, stable Visual Anchor and restrained rocking Animation.
- [x] The arrival Sequence uses Camera cut, move, hold and follow at narratively readable moments.
- [x] Boat Motion, rocking Animation and Camera direction preserve boat identity, scale and contact with the sea.
- [x] The Sequence commits the drifting-boat sighting as a Narrative Fact and enables the final transition.
- [x] Full playback and Sequence skipping commit identical boat and progression state.
- [x] The boat never appears landed before Michele has observed it drifting.
- [x] Browser verification covers the climb, Camera limits, full arrival Sequence and skipped outcome.

## Verification

- 2026-08-17: typecheck green; current specs green after the integration:
  fortification, drifting-boat, cloister, dialogue-server-unreachable and
  harbour-opening (full chain incl. winch contact and skip) in a serial
  run; boat-sighting's directed-arrival test green on its first run and
  its skip variant green in the serial run. A rare race (a walk absorbing
  the letter-give click) was hardened with a bounded retry. Visual review
  of the arrival, lookout and finale-entrance screenshots confirmed boat
  scale, rocking and sea contact.
- Per the user's instruction the obsolete specs (acceptance, michele,
  harbour) were not run; they are rebuilt by ticket 11. Two later
  boat-sighting reruns aborted for environmental reasons (dev server died
  mid-run while unrelated files were being edited); final rerun of the
  complete current suite is deferred to the next ticket, as done for
  ticket 05.
