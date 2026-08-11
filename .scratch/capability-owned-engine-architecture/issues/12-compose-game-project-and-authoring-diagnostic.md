# 12 — Compose Game Project and Authoring Diagnostic

**What to build:** Make Game Project the clear composition boundary that accepts focused authoring builders, supplies narrow views to capabilities and returns one deterministic set of attributed diagnostics without becoming a universal data interface.

**Blocked by:** 02 — Own Animation semantics; 03 — Own Camera semantics; 05 — Own navigation, Motion and Passage transitions; 07 — Own Inventory and Object lifecycle; 08 — Own the remaining Sequence flow; 09 — Own Save validation and exact restore; 11 — Own narrative and system HUD.

**Status:** ready-for-human

- [x] Game Project owns Game Definition composition, Project Identity, Project Version and diagnostic aggregation behind its module interface.
- [x] Focused builders such as those for Character, Scene and Sequence remain available and compose into the Game Project.
- [x] Each capability validates its own definitions and relationships and returns diagnostics with stable ownership, code, path and message.
- [x] Game Project combines capability diagnostics deterministically without repeating their validation rules.
- [x] Capability consumers receive explicit narrow views rather than the complete private project representation.
- [x] The aggregate private representation cannot become a cross-module import shortcut.
- [x] The package continues to expose one root entry point and does not add capability subpath exports.
- [x] Valid Game Projects remain deeply immutable and invalid projects fail with the complete expected diagnostic set.
- [x] Public API tests cover builder composition, TypeScript contracts, diagnostic aggregation, identity and version.
- [x] Documentation, recipes, Capri 1535 and standard verification use only the coherent current public contract.
