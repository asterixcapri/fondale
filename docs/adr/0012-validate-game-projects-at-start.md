# Validate declarative Game Projects at start

Fondale accepts a Game Project as ordinary declarative TypeScript data and no
longer requires public `defineX` builders, including `defineGame`. `startGame`
is the single public operation that initiates validation and compilation: the
owning capability modules report their Authoring Diagnostic, Game Project
aggregates them, and a successful compilation applies defaults and creates a
deeply frozen defensive copy before Save, browser, asset, or Game Session work
begins. This keeps modular authoring available through focused exported types
and `satisfies`, while avoiding partially validated public values, import-time
failures, and accidental freezing or later observation of Author-owned data.

An optional Save Snapshot is accepted by `startGame` as untrusted data and is
validated during the same startup flow. The compiled representation and its
validators remain internal; Fondale will expose a separate headless validation
interface only when a concrete tooling or CI consumer demonstrates that need.
