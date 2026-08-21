# Sequence

## What a Sequence is

A Sequence is a finite, modal flow: while one runs it is the dominant Game
Activity, and ordinary play waits. Use it for a cutscene, a scripted exchange,
a Scene Opening, or any moment where the game speaks and the Player mostly listens.

A Sequence is a list of steps. Steps run in order; some of them branch, and one
of them — the Direction Step — runs several visual things at once and waits for
all of them to finish.

A Sequence is finite by construction. It cannot recurse into itself, and
startup refuses one that can.

## How you author one

```ts
import { type SequenceDefinition } from "fondale";

export const arrival = {
  scene: "harbour",
  skippable: true,
  skipOutcome: [{ type: "set-variable", variable: "sawTheBoat", value: true }],
  steps: [
    { type: "narration", text: "The wind has dropped." },
    { type: "line", character: "raffaele", text: "You are late." },
    {
      type: "direction",
      directions: [
        { type: "motion", subject: { kind: "character", character: "michele" }, path: [{ x: 620, y: 610 }] },
        { type: "camera", mode: "move", from: { x: 0, y: 0 }, to: { x: 320, y: 0 }, duration: 1.5 },
      ],
    },
    { type: "operations", operations: [{ type: "set-variable", variable: "sawTheBoat", value: true }] },
  ],
} satisfies SequenceDefinition;
```

### The six steps

`line` is a Character speaking: `text`, `character`, optional `audio` and an
optional `animation` override. Its playback duration participates in automatic
advancement.

`narration` is narrator prose. It names no Character, and it is presented
differently from speech on purpose.

`operations` commits a group of Game Operations atomically.

`choice` presents alternatives the Player picks from — at most six eligible,
each with `text`, an optional condition, an optional `spoken` flag (default
true) and its own steps. It also requires a `fallback` for when no alternative
is eligible.

`branch` picks automatically: ordered `cases` with conditions, plus a
`fallback` list of steps.

`direction` starts concurrent visual directions and waits for every finite one
to end.

### Directions

An **animation** direction plays a named Animation on a Character, Object or
Scenery.

A **motion** direction moves a subject through a path. A Character takes a
single destination point and walks there using ordinary navigation, so it obeys
the Walkable Region. An Object or Scenery may follow several points over an
explicit `duration`, and must be returned to its authored resting position by
the end.

A **camera** direction is one of four modes: `cut` to a point, `move` from one
point to another over a duration, `hold` at a point, or `follow` a subject. It
is clamped to the owning Scene, and when the Sequence ends or is skipped the
Camera returns to following the Player Character.

**Cues** coordinate directions without callbacks. An Animation's `timing.cues`
names moments in logical seconds; another direction declares
`startAfter: { direction, cue }` and begins when that Cue occurs. This is how a
hand meets a door at the frame where it should.

### Skipping

A `skippable` Sequence must declare a `skipOutcome`: the atomic group of
operations applied when the Player interrupts it. This is what makes skipping
safe — the world ends in the same state whether the Sequence played or not.

A Sequence that is not skippable must not declare one.

## Values and rules

| Field | Value | Rules |
| --- | --- | --- |
| `steps` | ordered `SequenceStep` values | finite; no cycles |
| `scene` | Scene key | required as soon as any direction is used; every directed subject must be in it |
| `skippable` | boolean | optional |
| `skipOutcome` | Game Operations | required if skippable, refused otherwise |

A Direction Step needs at least one direction, and every direction must have a
finite boundary — a looping Animation or a `hold`/`follow` Camera needs the
step's `duration` to bound it.

Sequences may be started from a Command Case, from a Game Operation, from a
Conversation alternative or handoff, or by a Scene Opening case — at the start
of a game as well as after a Passage. An opening's Sequence takes control before
the Player does. Restoration is never a Scene Opening, so it starts no
Sequence.

## Errors

| Code | Cause |
| --- | --- |
| `definition.sequence.cycle` | a Sequence can reach itself |
| `definition.sequence.nested` | a Sequence starts another where nesting is not allowed |
| `definition.sequence.skip-outcome` | a skippable Sequence declares no skip outcome |
| `definition.sequence.skip-outcome.unused` | a non-skippable Sequence declares one |
| `definition.sequence.direction.empty` | a Direction Step has no directions |
| `definition.sequence.direction.unbounded` | a direction never finishes and the step sets no duration |
| `definition.sequence.duration`, `definition.motion.duration`, `definition.camera.duration` | a duration is not a positive finite number |
| `definition.sequence.cue-order`, `.cue-source`, `.cue-name` | a Cue start refers to a later, missing, or unnamed Cue |
| `definition.motion.character-path` | a Character motion declares more than one destination |
| `definition.motion.character-duration` | a Character motion declares a duration; walking is governed by movement speed |
| `definition.motion.walkable`, `definition.motion.bounds`, `definition.motion.path` | a path leaves the Walkable Region or the Scene |
| `definition.motion.scenery-rest` | directed Scenery does not return to its authored position |
| `definition.camera.bounds`, `definition.camera.point.finite` | a Camera point is invalid or outside the Scene |
| `definition.choice.limit` | more than six alternatives |
| `definition.choice.player-character` | a spoken alternative has no Player Character to speak it |
| `definition.line.text`, `definition.line.character`, `definition.narration.text` | empty text or a missing speaker |
| `reference.sequence`, `reference.sequence.scene`, `reference.sequence.subject`, `reference.sequence.subject-scene` | a Sequence, its Scene, or a directed subject does not resolve |
| `reference.animation`, `reference.animation.cue`, `reference.animation.line` | a directed or overridden Animation does not exist |
| `reference.camera.subject`, `reference.camera.subject-scene` | a followed subject does not exist or is elsewhere |

## Example

The first opening of the storeroom, in
[`sequences.ts`](../recipes/sequences.ts), narrates, speaks a Line, offers a
Choice, walks the Player with a Direction Step, and declares the Skip Outcome a
skip must still commit.

## See also

[Character](character.md) · [Scene](scene.md) · [Game State](game-state.md) · [Dialogue](dialogue.md)
