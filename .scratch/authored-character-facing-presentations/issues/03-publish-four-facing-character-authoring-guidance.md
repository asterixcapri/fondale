# 03 — Publish four-Facing Character authoring guidance

**What to build:** Give Authors and visual-content agents one accurate workflow
for producing, integrating, and verifying the four authored presentations owned
by every Character Animation.

**Blocked by:** 01 — Cut over to authored Character Facing presentations; 02 — Prove exact Facing selection in the browser.

**Status:** ready-for-human

- [x] Public Character authoring documentation describes the required left, right, front, and back presentations for every Character Animation.
- [x] Documentation states that the Engine selects authored artwork by Facing and never mirrors or falls back between presentations.
- [x] The Character workflow requires distinct Art Masters and Runtime strips for all four Facing presentations while remaining neutral about the artist's production technique.
- [x] Guidance requires synchronized frame count, timing, loop behavior, duration, and Animation Cues across the four presentations.
- [x] Guidance requires common Runtime cell dimensions and one stable Visual Anchor across every Facing and Animation in an Appearance.
- [x] Visual acceptance checks cover anatomy, costume, carried items, handed actions, asymmetry, and Ground Point stability in all four presentations.
- [x] Lighting guidance keeps illumination coherent with the Scene rather than allowing a Character turn to reverse the light source.
- [x] Every directional loop is inspected at 1:1 Runtime pixels and actual play size, including its first-to-last transition.
- [x] Public examples and recipes use the same canonical vocabulary and interface as the verified Engine behavior.
- [x] The glossary and ADR remain consistent with the published authoring guidance.
- [x] Documentation verification and the full build pass.

## Answer

The public Game Project guide now documents the complete four-Facing Character
artwork workflow and acceptance criteria, and the Character content skill
requires separate authored Art Masters and Runtime strips with synchronized
presentation and stable anchoring. The verified Character recipe demonstrates
distinct looping Default and Walking Animations across all four Facing values,
while the documentation gate protects the central workflow requirements.
`CONTEXT.md`, ADR-0018, and the public reference already describe the same
Engine contract. The focused recipe test, documentation verification,
typecheck, and complete build pass.
