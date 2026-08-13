# 02 — Prove exact Facing selection in the browser

**What to build:** Demonstrate through the public browser entry point that each
Character Facing displays its own authored artwork, with no hidden mirroring,
fallback, or spatial jump.

**Blocked by:** 01 — Cut over to authored Character Facing presentations.

**Status:** ready-for-human

- [x] A deterministic browser fixture supplies visibly distinguishable authored artwork for left, right, front, and back.
- [x] The fixture uses asymmetric lateral markers that make mirroring, substitution, or reuse of the wrong strip externally observable.
- [x] Browser verification drives the Game Project through `startGame` and observes all four Facing presentations through supported Engine behavior.
- [x] Left selects only the authored left presentation and right selects only the authored right presentation.
- [x] Front and back select their corresponding authored presentations.
- [x] Every Facing renders with positive horizontal scale and without a reflected texture.
- [x] Movement-driven and directed Facing changes preserve the Character's Ground Point and Visual Anchor.
- [x] Switching Facing during an Animation preserves logical phase, duration, looping, and Animation Cue behavior.
- [x] Missing or invalid Facing artwork fails during startup with an Authoring Diagnostic rather than during presentation.
- [x] The browser tests require no network, model, database, or other external service.
- [x] The full browser verification suite passes in Chrome.

## Answer

A deterministic `startGame` fixture now supplies four pixel-distinct authored
Facing presentations, including asymmetric lateral markers. Browser coverage
drives movement and a Cue-directed turn through supported Engine behavior,
then inspects the rendered pixels and saved Game State to prove exact Facing
selection, positive orientation, stable Ground Point and Visual Anchor, and
continuous Animation phase. Existing startup browser coverage supplies the
required missing-Facing, invalid-asset, and Visual Anchor diagnostics. The
complete Chrome verification suite passes without external services.
