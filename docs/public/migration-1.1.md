# Migrating a Fondale 1.0 project to 1.1

Fondale 1.1 replaces Primary Action, Inventory Use and Game Behavior callbacks
with one declarative Command model. The old properties and types are removed;
there is no compatibility mode.

For every interactive Hotspot, create a `NounDefinition` with `defineNoun` and
assign it to `noun`. Move the former visible label into the final unconditional
`labels` entry and the old default action into `preferredVerbs`. Add optional
`secondaryVerbs` only when right click should expose another meaningful action,
and `objectVerbs` when a selected Object should use Give instead of Use. Convert each
Primary Action branch to an ordered `CommandCase`. Convert Inventory Use cases
to binary `use` cases on the target Noun, naming the Inventory Object in
`firstNoun`. Game Behavior writes become declarative `operations`; condition
reads become `when` clauses.

Objects used from Inventory need their own Noun Definition. Every Scene Passage
also needs a Noun, a `direction`, and its existing destination and Approach
Point. Add a complete `CommandLexicon`, including localized Inventory
`select`/`deselect` phrases, and either local Noun fallbacks or
response-only `commandFallbacks` for all semantic Command verbs. A complete Command
must never resolve silently.

Migrate every Sequence phrase to its explicit meaning: use `line` with a
required `character` for speech and `narration` for narrator prose. A Command
Case may declare one direct `line`, one neutral `response`, or one `sequence`,
never more than one of them. Remove the former `speaker` and `presentation`
fields from Command Responses.

Finally, define an optional local `HUDTheme`. Scene geometry may use the entire
Logical Resolution because the contextual overlay reserves no lower band.
Increment the Project Version so old Save Snapshots remain visible but
incompatible, and verify real mouse and keyboard input in desktop Chrome.

See the compiled [Interaction](recipes/interaction.ts),
[Inventory](recipes/inventory.ts), [Command Case](recipes/command-case.ts), and
[first Scene](recipes/first-scene.ts) recipes.
