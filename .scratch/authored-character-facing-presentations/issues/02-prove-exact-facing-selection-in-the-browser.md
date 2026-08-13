# 02 — Prove exact Facing selection in the browser

**What to build:** Demonstrate through the public browser entry point that each
Character Facing displays its own authored artwork, with no hidden mirroring,
fallback, or spatial jump.

**Blocked by:** 01 — Cut over to authored Character Facing presentations.

**Status:** ready-for-agent

- [ ] A deterministic browser fixture supplies visibly distinguishable authored artwork for left, right, front, and back.
- [ ] The fixture uses asymmetric lateral markers that make mirroring, substitution, or reuse of the wrong strip externally observable.
- [ ] Browser verification drives the Game Project through `startGame` and observes all four Facing presentations through supported Engine behavior.
- [ ] Left selects only the authored left presentation and right selects only the authored right presentation.
- [ ] Front and back select their corresponding authored presentations.
- [ ] Every Facing renders with positive horizontal scale and without a reflected texture.
- [ ] Movement-driven and directed Facing changes preserve the Character's Ground Point and Visual Anchor.
- [ ] Switching Facing during an Animation preserves logical phase, duration, looping, and Animation Cue behavior.
- [ ] Missing or invalid Facing artwork fails during startup with an Authoring Diagnostic rather than during presentation.
- [ ] The browser tests require no network, model, database, or other external service.
- [ ] The full browser verification suite passes in Chrome.
