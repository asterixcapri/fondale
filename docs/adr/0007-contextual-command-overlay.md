---
status: accepted
---

# Contextual Command overlay over a full-frame Scene

Fondale keeps its declarative Command model but presents it through a
Return-style contextual overlay instead of the permanent Verb grid and lower
HUD band established by ADR-0006. Hover advertises one primary phrase and, only
when authored, one secondary phrase; left and right mouse buttons execute those
actions. Inventory is opened from a small persistent bag or `I` and appears as
a drawer over the full-frame Scene. This trades constant visibility of every
Verb for more Scene space and clearer local choices, while keeping Verb,
Command Case, fallback, Save Snapshot and Command Lexicon semantics in the
Engine rather than encoding interactions in renderer callbacks.
