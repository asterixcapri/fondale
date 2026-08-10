# Fondale 0.2 — Target-owned Nouns

Status: ready-for-agent

## Problem Statement

Authors currently attach a complete Noun Definition to every Hotspot even when
the Hotspot already targets an Object, Character, or Scenery that can own that
same definition. The interface therefore permits two competing definitions for
one player-facing Noun: one on the target and one on each place where the target
is exposed. Object definitions can consequently describe Inventory behavior
separately from their world Hotspots, while Character and Scenery definitions
may carry a Noun that runtime interaction ignores.

Capri 1535 avoids divergence by placing all Noun Definitions in one global
`nouns` module and passing the same values into target definitions and Hotspots.
That workaround sacrifices locality: most definitions are used by only one
Scene, while the few shared definitions live away from the Object or Character
that owns them. The module also contains shallow helpers that hide ordinary
authoring rather than encapsulating meaningful behavior.

The redundant Hotspot field conflicts with the wider declarative-reference
model. A Hotspot target already names a registry entry, `defineGame` validates
that reference, and the Core resolves other Game Project references when it
uses them. Nouns should follow the same rule instead of being copied into a
second location or embedded into an eagerly normalized project graph.

Fondale is still alpha despite the current `1.1.0` package label. No package has
been published to npm and no Git release tag constrains the numbering, so the
public artifacts also need a coherent `0.x` baseline before this incompatible
authoring change is distributed.

## Solution

Each Character, Object, and Scenery owns at most one Noun Definition. Every
Hotspot targeting that owner uses the owner's definition automatically and
cannot declare an override. The same Object Noun governs both world and
Inventory availability; its Command Cases describe all supported interactions,
while Game State conditions express persistent changes such as a dirty key
becoming clean.

A background region has no registry owner, so a background Hotspot continues
to own and require its Noun Definition directly. A Scene Passage remains its
own semantic target and continues to own and require its Noun Definition.

The public Hotspot interface becomes a discriminated union. Background targets
require a Noun, while Object, Character, and Scenery targets reject the field at
compile time. Nouns remain optional on owner definitions so purely visual or
otherwise non-interactive definitions remain valid. During Game Project
composition, `defineGame` rejects any referenced owner without a Noun and
reports the problem once at the owner's Noun path, even when several Hotspots
target it.

The Game Project retains the declarative target identifier after validation.
The Core resolves the owner and its Noun from the project registries when it
lists or activates an available Hotspot, following ADR-0008. It does not copy
the Noun into the Hotspot during composition and does not expose a new public
resolution interface.

Capri 1535 deletes the global Noun library. Object and Character Nouns are
defined directly beside their owner definitions; Scenery Nouns are defined in
their owning Scene; background-region and Passage Nouns remain directly beside
their geometry and destination. The example uses `defineNoun` explicitly and
removes the global unary-Noun and Passage helper wrappers.

The existing alpha baseline is reidentified as Fondale 0.1 and this change is
released as Fondale 0.2.0. All current product-facing version references,
package metadata, vendored artifacts, verification tools, and normative docs
adopt the `0.x` numbering. A migration guide explains the incompatible 0.1 to
0.2 authoring change. The future Fondale 1.0 release remains governed by the
separate readiness roadmap described by ADR-0005.

## User Stories

1. As an Author, I want an Object's Noun Definition beside that Object, so that its interaction language and behavior have one obvious home.
2. As an Author, I want a Character's Noun Definition beside that Character, so that dialogue and contextual actions remain local to the Character.
3. As an Author, I want a Scenery Noun Definition beside that Scenery, so that its state, Appearance, and interactions can be understood together.
4. As an Author, I want a background-region Noun beside its Hotspot, so that an interaction without a registry owner remains self-contained.
5. As an Author, I want a Scene Passage to retain its own Noun, so that its label, direction, and destination remain local to one declaration.
6. As an Author, I want Object, Character, and Scenery Hotspots to identify only their target, so that I do not repeat information the Engine can resolve.
7. As an Author, I want every Hotspot for the same target to use the same Noun Definition, so that behavior cannot diverge between interaction areas.
8. As an Author, I want one Object Noun Definition to apply in the world and Inventory, so that the Object does not acquire two competing identities.
9. As an Author, I want one Object Noun to contain Pick Up, Look At, Use, Give, and other relevant Command Cases, so that behavior is organized by the Object rather than its current location.
10. As an Author, I want conditional Noun Labels to depend on declared Game State, so that persistent facts such as `keyCleaned` change the label everywhere consistently.
11. As an Author, I want conditional Preferred, Secondary, and Selected Object Verbs to continue working on target-owned Nouns, so that state-dependent contextual actions remain declarative.
12. As an Author, I want target-relative Game Operations to retain the correct Object, Character, or Scenery target, so that moving the Noun does not change Command outcomes.
13. As an Author, I want TypeScript to require a Noun on a background Hotspot, so that a background region cannot become silently interactive.
14. As an Author, I want TypeScript to reject a Noun on an Object Hotspot, so that an Object cannot be overridden at one interaction site.
15. As an Author, I want TypeScript to reject a Noun on a Character Hotspot, so that a Character cannot be overridden at one interaction site.
16. As an Author, I want TypeScript to reject a Noun on a Scenery Hotspot, so that Scenery cannot be overridden at one interaction site.
17. As an Author, I want a non-interactive Object, Character, or Scenery definition to omit its Noun, so that purely visual definitions remain lightweight.
18. As an Author, I want `defineGame` to reject an interactive target whose owner lacks a Noun, so that the Core never discovers malformed authoring during play.
19. As an Author, I want a missing owner Noun diagnostic to point to the owner's Noun field, so that the correction is made at the single source of truth.
20. As an Author, I want repeated Hotspots for one owner to produce one missing-Noun diagnostic, so that the same defect is not reported many times.
21. As an Author, I want independent missing-Noun failures to aggregate with other Authoring Diagnostics, so that I can correct several problems in one cycle.
22. As an Author, I want a missing target and a target missing its Noun to remain distinguishable failures, so that diagnostics identify the actual prerequisite that failed.
23. As an Author, I want existing Noun Definition validation to run at the owner path, so that invalid labels, conditions, cases, fallbacks, references, and operations remain actionable.
24. As an Author, I want `defineScene` to keep validating local background Nouns without needing global registries, so that local Scene authoring remains independently checkable.
25. As a Player, I want an Object to show the same state-appropriate Noun Label in the Scene and Inventory, so that its identity remains coherent.
26. As a Player, I want a Noun Label to update after a Command changes its Game Variable, so that the interface reflects persistent world state immediately.
27. As a Player, I want collecting an Object through its target-owned Noun to behave exactly as before, so that authoring simplification does not change gameplay.
28. As a Player, I want selecting and examining an Inventory Object to use that Object's Noun, so that Inventory interactions remain available.
29. As a Player, I want Character Commands to resolve through the Character's Noun, so that dialogue and responses remain unchanged.
30. As a Player, I want Scenery Commands to resolve through the Scenery's Noun, so that stateful world interactions remain unchanged.
31. As a Player, I want background-region Commands to continue using their locally authored Noun, so that painted or non-entity targets remain interactive.
32. As a Player, I want Scene Passages to retain their authored labels and contextual actions, so that navigation remains recognizable.
33. As a Player, I want Capri 1535's key, gate, harbour repair, conversations, Inventory, and navigation to keep working, so that the migration introduces no gameplay regression.
34. As a Player, I want Save and Load to preserve the same Game State and pending Commands, so that the authoring refactor does not invalidate snapshots by itself.
35. As a Maintainer, I want the Core to resolve Hotspot Nouns from declarative target identifiers at use time, so that Nouns follow the same reference rule as Scenes, Characters, Objects, Sequences, and Passages.
36. As a Maintainer, I want `defineGame` to validate references without replacing them with embedded definitions, so that the Game Project retains one declarative graph shape.
37. As a Maintainer, I want one internal Hotspot-Noun resolution implementation to serve listing and Command execution, so that fixes apply consistently across runtime paths.
38. As a Maintainer, I want tests to cross the public Game Project interface rather than test the internal resolver directly, so that implementation can change without rewriting behavior tests.
39. As a Maintainer, I want Capri 1535 to have no global Noun data library, so that deleting the old module improves locality instead of spreading hidden dependencies.
40. As a Maintainer, I want the example to avoid shallow Noun factory wrappers, so that it teaches the actual public authoring interface.
41. As an Author upgrading from Fondale 0.1, I want a focused migration guide, so that I can move each Noun to its owner and delete redundant Hotspot fields safely.
42. As an Author reading the public recipes, I want every recipe to compile against the 0.2 interface, so that copied examples use the supported model.
43. As a Maintainer, I want package metadata and vendored example artifacts to agree on version 0.2.0, so that local verification exercises the intended release.
44. As a prospective user, I want Fondale releases to use `0.x` while the Engine remains alpha, so that the version communicates that incompatible authoring changes remain possible.
45. As a future Fondale 1.0 user, I want stable-release readiness handled separately from this Noun change, so that animation, Camera, Puzzle, and example-completeness work is not hidden inside Fondale 0.2.

## Implementation Decisions

- The public Hotspot definition becomes a discriminated union sharing area,
  approach, and optional availability condition fields.
- The background-target variant requires a Noun Definition.
- Object-, Character-, and Scenery-target variants do not accept a Noun field.
- Object, Character, and Scenery definitions retain an optional Noun field.
  Optionality represents non-interactive ownership, not an alternate place to
  author the Noun.
- A Character, Object, or Scenery referenced by at least one Hotspot must own a
  Noun. Game Project composition enforces this cross-registry invariant.
- A missing owner Noun is reported once at the owner definition's Noun path,
  regardless of the number of referring Hotspots. Missing targets continue to
  use the existing target-reference diagnostic rather than generating a
  dependent missing-Noun failure.
- Owner Nouns are validated once using their semantic target, preserving the
  validity rules for target-relative Game Operations and Command Cases.
- Background Hotspot Nouns and Scene Passage Nouns retain local validation and
  ownership.
- One Object Noun Definition contains both world and Inventory Command Cases.
  Fondale does not add a world/Inventory override, contextual Noun subtype, or
  second location-specific definition.
- Persistent Noun variation continues to use ordered conditions over declared
  Game State. The Engine does not infer labels from target kind, location, or
  rendering context.
- After composition-time validation, Hotspots retain their authored target
  identifiers. The Core resolves the target owner and Noun when it needs to
  list or execute an available Hotspot.
- Noun resolution follows the existing runtime reference model and ADR-0008.
  Game Project composition does not inject resolved Nouns, cache owner objects
  on Hotspots, or construct a second eager graph representation.
- The Core has one internal resolution path used by both available-Hotspot
  projection and Hotspot Command execution. This implementation is not added
  to the public interface.
- Runtime behavior for background Hotspots and Scene Passages remains direct
  because their Nouns already belong to those declarations.
- The Noun Definition interface itself does not change. Labels, Preferred
  Verbs, Secondary Verbs, Selected Object Verbs, Command Cases, fallbacks,
  conditions, responses, Lines, Sequences, and Game Operations retain their
  current semantics.
- Save Snapshot shape and format do not change. Noun Definitions are immutable
  authoring data rather than serialized Game State; conditional values continue
  to derive from the restored variables and Inventory.
- Capri 1535 colocates every Noun with its owner and deletes the global Noun
  module. Object and Character modules define their Nouns directly; each Scene
  directly defines Scenery, background-region, and Passage Nouns.
- Capri 1535 removes the global unary-Noun and Passage helper wrappers. The
  example favors explicit `defineNoun` authoring over a second example-specific
  abstraction.
- Public documentation defines target-owned Nouns as the normative 0.2 model
  and includes migration examples for Object, Character, Scenery, background
  region, and Scene Passage authoring.
- The previously named 1.1 alpha baseline is reidentified as Fondale 0.1 in
  current product-facing documentation. Git history may retain its historical
  wording, but shipped and normative artifacts use the coherent 0.x line.
- The package release produced by this work is 0.2.0. Package locks, generated
  declarations, vendored tarballs, example dependencies, verification tools,
  support-baseline text, and public reference text agree on that version.
- Fondale remains alpha design/pre-production. Fondale 1.0 readiness is a
  separate effort covering a representative Capri 1535 slice, working Puzzles,
  Character Animation, Camera movement, and stable-release quality.

## Testing Decisions

- The primary test seam is the public Game Project interface. Tests author
  definitions through the package root, compose them with `defineGame`, and
  observe diagnostics or gameplay behavior rather than calling the internal
  Noun resolver.
- Type checking proves that background Hotspots require a Noun and that Object,
  Character, and Scenery Hotspots reject one. Compile-time assertions also
  prove that owner Nouns remain optional when no Hotspot references them.
- Public authoring tests verify that `defineGame` accepts all four valid target
  shapes and rejects referenced owners without a Noun.
- Diagnostic tests cover Object, Character, and Scenery owner paths; one owner
  referenced by multiple Hotspots; several independent owners missing Nouns;
  aggregation with unrelated diagnostics; and suppression of a dependent
  missing-Noun diagnostic when the target itself does not exist.
- Existing public-interface tests are prior art for immutable definitions,
  aggregated diagnostics, reference validation, and package-root authoring.
- Deterministic gameplay tests compose a Game Project and exercise the existing
  Game Session seam. They verify labels, Preferred Verbs, Secondary Verbs,
  Selected Object Verbs, Command Cases, responses, operations, and Sequences
  resolved from Object, Character, and Scenery owners.
- Gameplay coverage includes one Object before and after collection, ensuring
  the same owner Noun drives both world and Inventory behavior without a
  location-specific override.
- Gameplay coverage includes a state-changing interaction analogous to
  `keyCleaned`, proving that ordered conditional labels and cases are
  reevaluated from Game State everywhere the Noun is available.
- Gameplay coverage retains background Hotspot and Scene Passage scenarios to
  prove their local Nouns are unchanged.
- Existing gameplay tests are prior art for Command resolution, Inventory
  selection, conditional cases, target-relative operations, Character Lines,
  Scene Passage traversal, and Save Snapshot restoration.
- Browser acceptance tests exercise Capri 1535 through the rendered Engine.
  Existing key/gate and harbour-repair paths must remain playable after the
  example migration, including Inventory, Character interaction, Scenery,
  conditional labels, and Passage navigation.
- The example verification must prove that the global Noun module and its
  shallow helper wrappers are absent rather than merely unused.
- Public recipes and documentation examples participate in TypeScript and docs
  verification so stale Hotspot Noun declarations fail the build.
- Package build verification confirms the 0.2.0 declarations expose the
  intended Hotspot union and no internal resolver.
- Example-package verification rebuilds and installs the 0.2.0 vendored
  tarball, refreshes its lockfile references, and runs the example acceptance
  suite against that artifact.
- Full build and browser verification remain the release gate. No new direct
  unit-test seam is introduced for the resolver or internal Game Project data.

## Out of Scope

- Fondale 1.0 readiness planning, including the final number and completeness
  of production Scenes and Puzzles.
- Idle, Walk, Talk, or one-shot Character Animation capabilities.
- Camera movement, following, clamping, coordinate conversion, or Save/Load of
  Camera state.
- A world-specific or Inventory-specific Noun override.
- More than one Noun Definition for the same Character, Object, or Scenery.
- Engine inference of Noun labels, Verbs, or behavior from target kind,
  location, Appearance, or rendering context.
- Eagerly replacing declarative registry identifiers with embedded definition
  objects during Game Project composition.
- Changing the Noun Definition schema, Command vocabulary, Command resolution
  precedence, HUD interaction model, or Scene Passage ownership.
- Changing the Save Snapshot schema or format version solely because of the
  authoring refactor.
- Introducing global Noun registries, example-specific Noun libraries, or
  shared wrappers around simple `defineNoun` calls.
- Publishing Fondale to npm as part of this work.
- Promising compatibility across alpha `0.x` releases beyond the documented
  0.1 to 0.2 migration.

## Further Notes

- The domain glossary states that one Noun Definition belongs to its Character,
  Object, Scenery, background region, or Scene Passage.
- ADR-0002 keeps Capri 1535 and the Engine in one repository so public
  capabilities are validated against a real game.
- ADR-0003 establishes declarative TypeScript authoring as the stable direction
  even while individual alpha interfaces evolve.
- ADR-0005 now records the `0.x` alpha line and reserves 1.0 for capabilities
  demonstrated together by Capri 1535.
- ADR-0007 owns the current Contextual Command overlay behavior; this work
  changes where its Noun data comes from, not how the overlay behaves.
- ADR-0008 requires Game Projects to retain declarative identifiers and the Core
  to resolve them when behavior needs them.
- The current worktree contains unrelated user-owned changes. Implementation
  must preserve them and limit edits to this feature's scope.
