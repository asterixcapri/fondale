# 04 — `setup-game`

**What to build:** the skill that settles how large the author's world is and
what it looks like, so that every asset made afterwards is generated at a size
somebody decided rather than one a generator improvised.

It interviews the author for a scale anchor — which asset it is, how many world
units it stands for, how many pixels it measures at Perspective Scale 1 — plus
the Logical Resolution, the visual direction of their game and the HUD theme. It
proposes defaults and accepts being overruled. What the world unit means is the
author's business; the skill only records it.

It then initialises the asset register from the story and the puzzles as a list
of what must be made, initialises the progress document, and writes a delimited
section into the game's own AGENTS.md so that any agent working in that
repository afterwards knows where the Engine's guides are, where the game's
documents are, that a vertical slice is one playable puzzle, that Runtime Assets
are made by invoking the fabrication skills and never by hand, and that the first
visual asset is the Player Character.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The interview yields a scale anchor and a pixels-per-world-unit factor from which any asset's target is arithmetic
- [ ] A game with no visible Player Character can still name an anchor
- [ ] Defaults are proposed and can be overridden
- [ ] Re-running the skill leaves existing AGENTS.md content untouched
- [ ] The AGENTS.md section points at the Engine documentation in the installed package, not at a copy
- [ ] The asset register is initialised with declared sizes for assets not yet made
- [ ] The skill contains no visual style of its own
- [ ] The skill ends by naming the next command to run
