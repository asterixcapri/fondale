# Interaction

## What interaction is

A Player never types. They point at something and pick an action, and the
Engine builds a **Command**: one semantic Verb with one or two Nouns.

The nine visible Verbs are `open`, `pick-up`, `push`, `close`, `look-at`,
`pull`, `give`, `talk-to`, `use` — exported as `commandVerbs`. `walk-to` exists
too but is implicit: it is what a click on empty floor means, and it is never
authored as a Command Case.

`give` always takes two Nouns, except in the one case that is a Verb's default.
`use` takes one or two. Every other visible Verb takes exactly one.

Three pieces make this work. A **Noun** is what a thing is called and how it
answers. A **Hotspot** is the surface on screen that points at a Noun. A
**Command Lexicon** supplies the words, because the Engine never invents
grammar.

## How you author it

```ts
import { type NounDefinition } from "fondale";

export const doorNoun = {
  labels: [
    { text: "Open door", when: { variable: "doorOpen", equals: true } },
    { text: "Door" },
  ],
  preferredVerbs: [
    { verb: "walk-to", when: { variable: "doorOpen", equals: true } },
    { verb: "open" },
  ],
  cases: [
    {
      verb: "open",
      when: { hasObject: "key" },
      line: { character: "michele", text: "It gives." },
      operations: [{ type: "set-variable", variable: "doorOpen", value: true }],
    },
    { verb: "open", response: { text: "It is locked." } },
    { verb: "push", response: { text: "It does not move." } },
  ],
} satisfies NounDefinition;
```

Conditional lists are ordered and the first match wins, so the last entry must
be unconditional — it is the one that always answers.

Everything the door does is in one list. The last `open` case carries no
condition, so it is what `open` answers when the Player has no key; the single
`push` case is unconditional, so it is what `push` always answers. There is no
separate fallback map: **a Verb's default is its final case, carrying neither a
condition nor a first Noun.**

### Who owns the Noun

A Hotspot declares a `target`, and the target decides where its Noun comes
from. A `character`, `object`, or `scenery` target resolves the owner's own
Noun at use time, and the Hotspot must not declare one. A `background` target
has no owner, so the Hotspot carries its Noun locally. A Scene Passage always
carries its own.

This is why the same crate answers identically wherever you click it, and why
an Object keeps its answers when you pick it up.

### How a Command resolves

Ordered `cases` are read from the top: the first whose Verb, first Noun and
condition all match wins. If none does, the Verb's default answers — the Noun's
case for that Verb with no first Noun and no condition. If the Noun declares no
default either, the Game Project's global `commandFallbacks` answers. Something
always answers — a Command that could resolve to nothing is refused at startup,
not at play time.

Within one selector — a Verb against a given first Noun — the unconditional case
must come last, and there can be only one: an unconditional case above a
conditional one would hide it, and is refused.

Selecting `use` and clicking an Inventory Object holds that Object as a first
Noun rather than using it alone, unless a *conditional* bare `use` case applies
to it. The Verb's default is the answer of last resort, not a reason to stop the
Player from using the Object on something else.

A case may carry at most one textual outcome: a Character `line`, a neutral
`response`, or a `sequence`. It may carry `operations` alongside, committed
atomically with the outcome.

### What the mouse does

`preferredVerbs` supplies the primary action, shown as the contextual action
following the pointer. `secondaryVerbs` supplies the right-button action.
`objectVerbs` supplies the action when the Player is holding a selected
Inventory Object, and defaults to `use`.

### Conditions

An `InteractionCondition` reads either a boolean Game Variable
(`{ variable, equals }`) or whether the Player holds an Object
(`{ hasObject }`). There is no expression language: conditions are flat, and
anything more complex is a Variable you set yourself.

## Values and rules

| Field | Value | Rules |
| --- | --- | --- |
| `labels` | ordered `NounLabel` values | the last must be unconditional; text non-empty |
| `preferredVerbs` | ordered `PreferredVerbCase` values | the last must be unconditional |
| `secondaryVerbs` | ordered `PreferredVerbCase` values | optional; same contract |
| `objectVerbs` | ordered `give` or `use` cases | optional; defaults to `use` |
| `cases` | ordered `CommandCase` values | at most one textual outcome each; arity must match the Verb; a Verb's unconditional case comes last and is its default |

A Hotspot declares a polygon `area`, an `approach`, an optional `when`, and its
`target`. Where areas overlap, the later Hotspot wins the hit test. A Hotspot
whose `when` stops holding withdraws: it is not shown greyed out, it is gone.

An Approach Point is where the Player Character walks before the Command
resolves. It must be inside the Walkable Region and inside Scene Space.

The Command Lexicon declares all nine Verb labels, the Inventory `select` and
`deselect` phrases, and three sentence patterns — `unary`, `give`, `use` —
using the placeholders `{verb}`, `{noun}`, `{first}`, `{second}`.

## Errors

| Code | Cause |
| --- | --- |
| `definition.command-case.arity` | the case's Noun count does not match the Verb |
| `definition.command-case.textual-outcome` | more than one of `line`, `response`, `sequence` |
| `definition.command-case.empty` | the case resolves to nothing at all |
| `definition.command-case.object-feedback` | an Object-first case gives the Player no feedback |
| `definition.conditional-fallback` | a conditional list has no unconditional final entry |
| `definition.command.silent` | a Verb has neither an unconditional case on the Noun nor a global Command Fallback |
| `definition.noun-label.text` | a label's text is empty |
| `definition.command-response.text`, `definition.command-response.semantic` | an invalid neutral response |
| `definition.command-lexicon.required`, `.label`, `.pattern` | the lexicon is incomplete or a pattern lacks a required placeholder |
| `definition.hotspot.target-noun.required` | a Hotspot targets an owner that declares no Noun |
| `reference.hotspot.target` | a Hotspot targets something that does not exist |
| `definition.approach.walkable`, `definition.approach.bounds` | the Approach Point is unreachable or outside the Scene |
| `reference.variable` | a condition or operation names an undeclared Game Variable |

## Example

The brazier in [`world.ts`](../recipes/world.ts) answers `use` only when the
lantern is the selected first Noun and is not already lit, and the lantern in
[`lantern.ts`](../recipes/lantern.ts) changes its own Label once it burns.

## See also

[Object](object.md) · [Scene](scene.md) · [Game State](game-state.md) · [Sequence](sequence.md)
