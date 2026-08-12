# 03 — Cut over atomically to startGame authoring

**What to build:** Replace the public builder-based authoring flow in one
coherent cutover. An Author supplies ordinary typed Game Project data directly
to `startGame`; startup compiles an isolated snapshot, validates an optional
untrusted Save Snapshot and only then performs browser and Runtime Asset work.
Capri 1535, tests, recipes and public documentation move to this contract in
the same change, leaving no compatibility path for the old builders.

**Blocked by:** 02 — Compile an isolated Game Project snapshot.

**Status:** ready-for-human

- [x] The public `GameProject` type describes the ordinary declarative TypeScript data authored by a game rather than an opaque compiled value.
- [x] Focused public authoring types remain available from the package root so Game Definitions can be organized in separate files and checked with `satisfies`.
- [x] `startGame` accepts the declarative Game Project directly and invokes the internal compilation before any Save, environment, target, Runtime Asset or mount work.
- [x] Invalid Game Projects reject startup with `AuthoringError` containing aggregated capability-owned diagnostic and complete paths.
- [x] A semantic failure leaves the target and browser resources untouched.
- [x] A successful startup uses only the isolated compiled snapshot; later mutations of the Author-owned Game Project cannot affect the running Game Session.
- [x] Separate calls to `startGame` compile independent snapshots from the data visible at each call.
- [x] The startup snapshot option accepts untrusted data and Save validates it against the compiled Project Identity, Project Version and supported Game State before mount.
- [x] Malformed, incompatible and semantically invalid Save Snapshots reject startup with structured diagnostic and without partial restore or browser effects.
- [x] Exact Save Snapshot round trips and Engine-owned Save Slot behavior remain supported.
- [x] All public `defineX` builders, including Game Project, Character, Object, Scene, Sequence, Noun, Command Lexicon and HUD Theme builders, are removed from implementation and package exports.
- [x] The former opaque Game Project contract and its public input/result distinction are removed.
- [x] The public pre-validation function and opaque validated form for Save Snapshot restoration are removed.
- [x] No compatibility shim, alias, overload, deprecated export or parallel legacy authoring path remains.
- [x] CoreSession, Game State, Game Operation, Game Activity and Save Snapshot semantics remain unchanged beyond receiving the compiled internal representation.
- [x] Capri 1535 uses ordinary typed definitions and passes its Game Project directly to `startGame` everywhere, including restore flows and browser fixtures.
- [x] Engine tests and fixtures use the new contract; capability-local rules stay tested at their internal interfaces rather than being replicated as browser setup.
- [x] Public package tests demonstrate ordinary typed authoring, startup diagnostic, startup phase ordering, isolated sessions and untrusted Save Snapshot restore.
- [x] Quick start, authoring guide, concepts, reference, recipes and migration documentation describe only the new contract.
- [x] Documentation recipes compile against the distributable package without builder or pre-validation calls.
- [x] The architecture document and automated documentation checks reject stale references to removed builders, opaque projects or pre-validated Save Snapshot startup.
- [x] Package exports contain only the intentional final interface, while `AuthoringError`, `AuthoringDiagnostic`, `GameProject`, focused authoring types, `SaveSnapshot`, `GameSession` and `startGame` remain available as required.
- [x] Capri 1535 preserves its observable gameplay, input, Sequence, Camera, HUD, Save and restore behavior.
- [x] Full build, structural checks, documentation checks and browser verification pass together before the ticket is complete.

## Comments

- Replaced the public builder pipeline with ordinary declarative `GameProject`
  data compiled privately by `startGame`; Save validation, environment checks,
  Runtime Asset loading and mount now run in the prescribed order.
- Removed legacy builder and pre-validation exports, migrated Engine fixtures,
  public recipes and Capri 1535, and updated ADRs and public documentation.
- Added public, compilation, startup-order and documentation-gate coverage. Final
  verification: `npm run build`, Engine `npm run verify` (176 passed), Capri 1535
  `npm run build` and `npm run verify` (6 passed).
- Parallel Standards and Spec reviews completed with no residual findings.
