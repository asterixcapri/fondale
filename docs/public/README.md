# Fondale documentation

Fondale is a point-and-click adventure Engine. A game is ordinary declarative
TypeScript data that you hand to `startGame`.

Start with the [quick start](quick-start.md) to get a Scene on screen, then
read the authoring guides in the order you build.

To build a whole game rather than look a contract up, follow
[building a game](building-a-game.md): the authoring pipeline in order, what it
needs installed, and how long a short adventure really takes.

## Build a game

1. [Project](authoring/project.md) — what a Game Project is, startup, and what
   `startGame` validates.
2. [Scene](authoring/scene.md) — Scene Space, Scene Size, the Walkable Region,
   Perspective Scale, Entrances and Passages.
3. [Scenery](authoring/scenery.md) — depth-sorted visuals with their own states.
4. [Character](authoring/character.md) — Facings, Appearances, Animation Roles,
   the Visual Anchor.
5. [Object](authoring/object.md) — the Scene, Inventory and consumption
   lifecycle.
6. [Interaction](authoring/interaction.md) — Nouns, Verbs, Hotspots, Command
   Cases and the Lexicon.
7. [Sequence](authoring/sequence.md) — modal flows, Choices, Motion, Camera and
   Cues.
8. [Dialogue](authoring/dialogue.md) — Narrative Facts, Disclosure, Cover
   Stories, Conversations and Reflection.
9. [Detail View](authoring/detail-view.md) — close-ups and Endings.
10. [HUD](authoring/hud.md) — the theme you supply for the interface the Engine
    owns.
11. [Game State](authoring/game-state.md) — Game Operations, Variables and
    atomic commits.
12. [Save](authoring/save.md) — Save Snapshots and Continuation State.
13. [Testing](authoring/testing.md) — driving the real game with no renderer.

## Look something up

[Vocabulary](vocabulary.md) — every term, defined once.

[Contract index](contract-index.md) — one row per exported structure: allowed
values, invariants, diagnostics, compiled example.

[Diagnostics](diagnostics.md) — every stable diagnostic code, by family.

[Dialogue Provider protocol](dialogue-provider.md) — for implementing or
hosting a provider, not for authoring a game.

[Recipes](recipes/README.md) — compiled, executed TypeScript examples.

[What the Player gets](player-experience.md) — the controls, presentation and
limits the Engine gives every game, and what they constrain.
