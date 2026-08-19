# Save

## What a Save Snapshot is

A Save Snapshot is an inspectable, JSON-safe copy of the latest committed Game
State. It carries a format version, your Project Identity, your Project
Version, and the state itself.

It contains only canonical facts — including an incomplete Command in progress,
Character Knowledge and Testimony. It never contains generated wording: what a
Dialogue Provider said is not stored, and neither is transcript, thread, model
or usage data.

Camera position, hover, pointer position and Player Preferences are not saved.

## How you use it

```ts
const snapshot = session.createSaveSnapshot();
localStorage.setItem("save", JSON.stringify(snapshot));

// later
const session = await startGame(project, {
  target,
  snapshot: JSON.parse(localStorage.getItem("save")!),
});
```

Stored data is passed back as `unknown`. `startGame` validates it against the
current project before doing any browser or asset work, so an incompatible or
tampered save fails cleanly and early.

### Continuation State

The ordinary browser adapter keeps one **Continuation State** per Project
Identity: the latest compatible Save Snapshot paired with the Dialogue Provider
session identity whose Conversation and Reflection memory lives on the server.

Continue restores both sides of that association. New Game replaces it. The
Player does not create named saves and does not restore a historical state —
there is one continuation, and it is current.

Player Preferences live in separate browser storage and never enter either the
Save Snapshot or the Continuation State.

### Compatibility

A snapshot is refused when its format version, Project Identity or Project
Version does not match, when its shape is wrong, when it carries unexpected
fields, or when it names something the current project no longer declares — a
Scene, an Object, a Detail View, an Appearance.

Changing your Project Version is therefore how you deliberately abandon
existing saves after a change that would make them meaningless.

## Values and rules

| Field | Value |
| --- | --- |
| `formatVersion` | Fondale's own snapshot format version |
| `projectIdentity` | your Game Project's `identity` |
| `projectVersion` | your Game Project's `version` |
| `state` | the committed Game State |

The presented Detail View is recorded as `detailView` in the state, beside
`ended`. Restoring into a presented Detail View is not an arrival and starts no
arrival Sequence. Restoring into an Ending resumes the finished game at its
Ending.

## Errors

| Code | Cause |
| --- | --- |
| `save.shape` | the stored value is not a Save Snapshot |
| `save.fields.unexpected` | it carries fields the format does not define |
| `save.format.version` | it was written by a different snapshot format |
| `save.project.identity`, `save.project.version` | it belongs to a different project or version |
| `save.state.invalid` | the committed state is internally inconsistent |
| `save.state.command`, `save.state.command-noun` | a stored incomplete Command no longer resolves |
| `save.state.intent-command`, `save.state.intent-command-noun` | a stored Player Intent no longer resolves |
| `save.state.detail-view` | a stored Detail View the project no longer declares |
| `save.state.ending` | a stored Ending without a presented Detail View |
| `save.validation.project`, `save.validation.required` | validation could not run against the project |

## Example

The example game saves after every committed operation and offers Continue on
its title screen.

## See also

[Game State](game-state.md) · [Project](project.md) · [Detail View](detail-view.md)
