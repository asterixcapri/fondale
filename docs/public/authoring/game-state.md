# Game State

## What Game State is

Game State is every committed fact about one Game Session: where each Character
stands, what each wears, where each Object is, which Variables hold, what each
Character knows, which Detail View is presented, whether the game has ended.

Nothing becomes Game State by being drawn. Rendering, loaded textures, screen
coordinates, animation frames and Camera position are derived, never committed,
and never saved.

Game State changes only through **Game Operations**: validated, atomic,
authored transitions. There is no other way to change the world.

## How you author change

```ts
operations: [
  { type: "set-variable", variable: "wellFreed", value: true },
  { type: "set-appearance", target: { kind: "scenery", scene: "cloister", scenery: "well" }, appearance: "freed" },
  { type: "consume-selected-object" },
]
```

Operations in one group see each other's earlier writes, and they either commit
together or not at all. There is no partial commit. Conditions always read the
latest committed state, never a half-applied one.

Declare every Game Variable in the Game Project's `variables` registry with its
initial value. An operation or condition naming an undeclared Variable is
refused at startup.

### The operations

**World and flow.** `set-variable` sets a boolean. `set-appearance` changes the
persistent Appearance of a Character, Object or Scenery. `start-sequence` makes
a Sequence the dominant activity. `present-detail-view` and
`dismiss-detail-view` control the close-up. `end-game` presents a Detail View
and ends the session.

**Inventory and Object lifecycle.** `collect-target-object` collects the Object
the Command was aimed at. `give-object-to-player` hands over a named Object
present in the current Scene. `place-selected-object` puts the selected Object
down at a Ground Point. `place-object` puts a named Object into a Scene.
`consume-selected-object` removes it from play for good.

**Dialogue.** `learn-narrative-fact` adds a declared fact to a Character's
Knowledge and only ever adds — Knowledge is monotonic. `record-testimony`
remembers a Claim that was communicated, validating the authored Cover Story
first. `set-trust` changes directional Trust. `set-dialogue-state` changes the
qualitative Dialogue State. `consume-conversation-alternative` withdraws one
authored alternative.

### Conditions

An `InteractionCondition` reads a boolean Variable or whether the Player holds
an Object. That is the entire predicate language. Anything richer is a Variable
you compute yourself with operations — which keeps state inspectable and
savable.

## Values and rules

Operations are validated when the project is compiled, not when they run: an
operation that could name a missing Object, Appearance, Scene or Variable is a
startup failure. At play time an operation either commits or reports
`state.operation.invalid`.

A Narrative Fact may declare `setsVariable`. When a Character learns that Fact
the Engine sets the Variable in the same commit — both or neither. The Variable
is set only after Disclosure authorised the Fact and before anything is spoken,
so a Fact answered with a Cover Story, withheld, or belonging to a failed turn
leaves it untouched. The result is an ordinary Variable that Hotspots,
Passages, Sequences and conditions read with no special casing.

## Errors

| Code | Cause |
| --- | --- |
| `state.operation.invalid` | an operation could not commit against the current state |
| `reference.variable` | an operation or condition names an undeclared Variable |
| `reference.appearance.target` | an Appearance change names something the target does not declare |
| `reference.object`, `reference.character`, `reference.scene`, `reference.sequence`, `reference.detail-view` | an operation names something that does not exist |
| `definition.operation.collect-target` | a collect-target operation is used where no Command target exists |
| `definition.operation.ground-point` | a placement Ground Point is invalid in some reachable Scene |

## Example

The example game frees a seized winch with one atomic group: the Variable, the
Scenery Appearance, and the consumption of the oil.

## See also

[Interaction](interaction.md) · [Object](object.md) · [Save](save.md) · [Dialogue](dialogue.md)
