# 07 — The recipes and the Example open their game

**What to build:** An author reading the documentation can copy an opening
rather than infer it. One recipe opens its game on a staged Scene, and
`capri-1535` opens on its initial Scene — until now nothing in the repository
plays the capability this work added, only tests of it.

Both are played by suites that start from the beginning, so those suites now
begin under a Sequence where the Player used to be free immediately. They are
updated to pass through the opening — settling or skipping it before addressing
the Scene — because that is exactly what an author adopting this has to do, and
these suites are the worked example of it. Moving the opening to a later Scene
to keep the tests unchanged is not acceptable: the capability being shown is the
start of a game.

**Blocked by:** 02, 04, 05, 06.

**Status:** ready-for-agent

- [ ] One recipe opens its game on a staged Scene, and its README explains the
      opening beside the arrival it already shows.
- [ ] `capri-1535` opens on its initial Scene with a staged Sequence.
- [ ] The recipes' headless and browser suites pass through the opening rather
      than around it.
- [ ] The Example's suite does the same, from its shared session helper.
- [ ] The Example's tests that drive a Scene by starting the Player at its
      Entrance state that starting at an Entrance is not arriving through it.
- [ ] No page of the documentation still describes the old mechanism.
- [ ] `npm run build` and `npm run verify` pass.
