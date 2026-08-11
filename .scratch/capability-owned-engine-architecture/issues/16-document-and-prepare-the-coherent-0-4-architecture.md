# 16 — Document and prepare the coherent 0.4 architecture

**What to build:** Make the completed Engine understandable and releasable as one coherent alpha contract through an offline visual explanation, migration guidance, final acceptance and 0.4.0 version preparation without automatically publishing npm.

**Blocked by:** 15 — Retire horizontal ownership and enforce boundaries.

**Status:** ready-for-human

- [x] A tracked, self-contained HTML document explains the final Engine architecture in Italian while preserving canonical English domain terms.
- [x] The visual flow covers Authoring, validation and start, browser input, Game Session ticks, Game State commits, Interaction, World, Sequence, Animation, Camera, HUD, browser presentation, Save and restore.
- [x] The document explains CoreSession in plain language and shows that it remains the deterministic Game Session coordinator.
- [x] The document distinguishes capability policy, coordination and technical adapters and shows the allowed communication paths.
- [x] A visual glossary explains the principal terms needed to follow the diagram without prior architecture knowledge.
- [x] The document describes only the final architecture and contains no remote scripts, fonts, stylesheets, images or other network dependencies.
- [x] The HTML document is opened and inspected locally in a browser at representative viewport sizes.
- [x] Public migration guidance covers renamed or changed alpha contracts, incompatible Save Snapshots and the absence of compatibility shims.
- [x] Package metadata and public documentation identify the coherent target as version 0.4.0, without performing an npm publication.
- [x] Final acceptance passes at the public package, CoreSession and browser seams, including structural checks, Capri 1535 and offline documentation.
