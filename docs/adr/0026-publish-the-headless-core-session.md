---
status: accepted
---

# Publish the headless Core Session as the interaction seam

A Game Project needs to assert its own puzzles — a Fact learned, a Variable
committed, a Hotspot withdrawn, an Ending reached — and Fondale offered no way
to do it: the public `GameSession` exposes lifecycle and saving only, so the
sole route to Game State was to render the game in a browser and read it back
through drawn pixels. We publish the headless Core Session from the package root
instead, as `startCoreSession`. It is not a testing convenience: it is already
the only way into the running game. The browser adapter translates pointer and
keyboard events into these same inputs, advances this same simulated time, and
paints these same presentations, so a test is one more client of the seam — the
one with no renderer.

## Considered options

The Example could have imported the Engine's internals through a relative path,
or its state-level specs could have moved into the Engine's own suite, which
already sees those internals. Both were rejected against ADR 0002: the Example
consumes the packaged artifact an external project installs, precisely to prove
that artifact works, and Capri content does not belong in the Engine's internals.
Neither alternative would have given the capability to anybody outside this
repository, and the need is not ours alone — every author writing an adventure
with Fondale has to verify puzzles without a browser.

A second entry point (`fondale/testing`) was tried and abandoned:
the architecture verification requires exactly one public root entry, and the
seam is a capability of the Engine rather than a separate testing product.

## Consequences

`CoreSession`, `GameState` and the presentations they carry become a public
compatibility surface, which is the real cost: their shapes can no longer follow
the Engine's internals freely. The renderer stays internal as ADR 0004 requires —
a Core Session presents state, HUD, world and camera, never pixels — so the
browser plane remains the only place where drawn output is verified.

No adapter interface is defined. A formal contract for front ends would be
designed against a single implementation, which is how abstractions are got
wrong; the seam is what makes extracting one cheap once a second adapter exists.
