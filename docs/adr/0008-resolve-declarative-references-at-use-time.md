# Resolve declarative references at use time

Game Projects retain registry identifiers for cross-definition references after
`defineGame` validates them; the Core resolves each identifier from the project
registries when behavior needs it. This keeps authored data declarative and
consistent across Scene destinations, Characters, Objects, Sequences, and
Hotspot Nouns; eager replacement with embedded definitions is rejected because
it would create a second internal graph shape without removing the need for
authoring validation.
