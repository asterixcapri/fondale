# 02 — Detail View Hotspots do everything a Command Case does

**What to build:** Make a Detail View a place where the game can actually
happen, not just talk. Examining an area may teach a Narrative Fact, set a Game
Variable, start a Sequence or open a Conversation; areas appear and disappear
with Game State; and the Player may use a selected Inventory Object on an area —
a key in a lock, a tessera in a mechanism. Because every Game Operation travels
one shared path, presenting a Detail View must also work from a Command Case and
from a Skip Outcome without any dedicated code.

**Blocked by:** 01 — Present and examine a Detail View.

**Status:** ready-for-agent

- [ ] An area's Command Case may answer with a Line or a Command Response.
- [ ] An area's Command Case may run Game Operations, and they commit exactly once.
- [ ] An area's Command Case may start a Sequence, including one that opens a Conversation.
- [ ] Area Hotspots honour conditions on Game State, appearing and withdrawing as it changes.
- [ ] A selected Inventory Object may be used on an area, with the same first-Noun semantics used in a Scene.
- [ ] Unsupported combinations answer with authored feedback and mutate no Game State.
- [ ] Presenting a Detail View works from a Command Case in the world, after its Approach Point walk, with no code specific to that route.
- [ ] Presenting a Detail View works from a Sequence's Skip Outcome and commits the same state as ordinary playback.
- [ ] Core Session tests cover each of these paths.
