# Diagnostics

`startGame` refuses an invalid Game Project rather than running it. It throws an
`AuthoringError` carrying stably ordered `AuthoringDiagnostic` values, each with
a stable `code`, a `family`, the capability `owner` responsible for the rule, an
authoring `path`, a `message`, and optional `suggestion` and `cause`.

Codes are stable: you may match on them in tests and tooling.

## Families, in the order startup reaches them

`definition` — one definition is invalid on its own terms.
`reference` — a definition names something that does not exist.
`state` — an operation could not commit against the current state.
`save` — stored data is incompatible with the current project.
`asset` — a declared file is missing, undecodable, or the wrong size.
`environment` — the browser or a required service could not start.

Semantic validation always precedes browser work, so a definition error is
reported before any asset is fetched.

## Definition codes

**Project and viewport** — `definition.project.identity`,
`definition.project.version`,
`definition.logical-resolution.positive-integer`.

**Scene geometry** — `definition.scene-size.positive-integer`,
`definition.scene-size.viewport-minimum`, `definition.scene-space.bounds`,
`definition.point.finite`, `definition.polygon.vertices`,
`definition.polygon.degenerate`, `definition.polygon.self-intersection`,
`definition.perspective-scale.stop`, `definition.entrance.walkable`,
`definition.approach.walkable`, `definition.approach.bounds`,
`definition.scenery.baseline`.

**Characters** — `definition.character.walkable`,
`definition.character.movement-speed`.

**Appearances and Animations** — `definition.appearance.animations`,
`definition.appearance.default-role`, `definition.animation.frames`,
`definition.animation.frame-source`,
`definition.animation.directional-frame-count`,
`definition.animation.frames-per-second`, `definition.animation.loop`,
`definition.animation.cue`, `definition.animation.visual-anchor`.

**Objects and Inventory** — `definition.inventory-appearance-size`,
`definition.operation.collect-target`, `definition.operation.ground-point`.

**Nouns and Commands** — `definition.noun-label.text`,
`definition.command-case.arity`, `definition.command-case.empty`,
`definition.command-case.textual-outcome`,
`definition.command-case.object-feedback`, `definition.command-response.text`,
`definition.command-response.semantic`, `definition.command.silent`,
`definition.conditional-fallback`, `definition.command-lexicon.required`,
`definition.command-lexicon.label`, `definition.command-lexicon.pattern`,
`definition.hotspot.target-noun.required`.

**Sequences** — `definition.sequence.cycle`, `definition.sequence.nested`,
`definition.sequence.skip-outcome`, `definition.sequence.skip-outcome.unused`,
`definition.sequence.selected-object-operation`,
`definition.sequence.direction.empty`,
`definition.sequence.direction.unbounded`, `definition.sequence.duration`,
`definition.sequence.cue-order`, `definition.sequence.cue-source`,
`definition.sequence.cue-name`, `definition.line.text`,
`definition.line.character`, `definition.narration.text`,
`definition.choice.limit`, `definition.choice.player-character`.

**Motion and Camera** — `definition.motion.path`,
`definition.motion.character-path`, `definition.motion.character-duration`,
`definition.motion.duration`, `definition.motion.bounds`,
`definition.motion.walkable`, `definition.motion.scenery-rest`,
`definition.camera.duration`, `definition.camera.point.finite`,
`definition.camera.bounds`.

**Detail Views** — `definition.detail-view.image`,
`definition.detail-view.bounds`.

**HUD** — `definition.hud-theme.font`, `definition.hud-theme.color`,
`definition.hud-theme.speech-color`, `definition.hud-theme.opacity`,
`definition.hud-theme.speech-width`, `definition.hud-theme.cursor`.

**Dialogue** — `definition.narrative-context.required`,
`definition.narrative-fact.identity`, `definition.narrative-fact.proposition`,
`definition.narrative-fact.sets-variable`, `definition.claim.identity`,
`definition.claim.proposition`, `definition.character-knowledge.collection`,
`definition.character-knowledge.item`,
`definition.character-knowledge.disclosure`,
`definition.character-knowledge.duplicate`,
`definition.cover-story.collection`, `definition.cover-story.item`,
`definition.cover-story.disclosure`, `definition.cover-story.duplicate`,
`definition.relationship.collection`, `definition.relationship.trust`,
`definition.dialogue.profile`, `definition.dialogue.biography`,
`definition.dialogue.personality`, `definition.dialogue.behavior`,
`definition.dialogue.voice`, `definition.dialogue.state`,
`definition.dialogue.handoffs`, `definition.dialogue.handoff`,
`definition.conversation-alternative.collection`,
`definition.conversation-alternative.item`,
`definition.conversation-alternative.condition`,
`definition.conversation-alternative.limit`,
`definition.conversation-alternative.sequence`.

## Reference codes

**World** — `reference.scene`, `reference.scene.initial`,
`reference.passage.scene`, `reference.passage.entrance`,
`reference.character`, `reference.character.initial-scene`,
`reference.character.player`, `reference.object`,
`reference.object.initial-scene`, `reference.hotspot.target`,
`reference.detail-view`, `reference.scene-opening.entrance`,
`reference.variable`.

**Appearances and Animations** — `reference.appearance`,
`reference.appearance.initial`, `reference.appearance.target`,
`reference.animation`, `reference.animation.role`,
`reference.animation.walking-role`, `reference.animation.cue`,
`reference.animation.line`.

**Sequences and Camera** — `reference.sequence`, `reference.sequence.scene`,
`reference.sequence.subject`, `reference.sequence.subject-scene`,
`reference.camera.subject`, `reference.camera.subject-scene`.

**Dialogue** — `reference.character-knowledge.character`,
`reference.character-knowledge.fact`, `reference.cover-story.fact`,
`reference.cover-story.knowledge`, `reference.cover-story.claim`,
`reference.testimony.speaker`, `reference.testimony.listener`,
`reference.testimony.claim`, `reference.testimony.cover-story`,
`reference.relationship.character`, `reference.relationship.missing`,
`reference.narrative-fact.variable`,
`reference.conversation-alternative.index`,
`reference.dialogue-operation.character`.

## State, save, asset and environment codes

**State** — `state.operation.invalid`.

**Save** — `save.shape`, `save.fields.unexpected`, `save.format.version`,
`save.project.identity`, `save.project.version`, `save.state.command`,
`save.state.command-noun`, `save.state.intent-command`,
`save.state.intent-command-noun`, `save.state.detail-view`,
`save.state.ending`, `save.state.invalid`, `save.validation.project`,
`save.validation.required`.

**Asset** — `asset.load.failed`, `asset.audio.load.failed`,
`asset.font.load.failed`, `asset.background.dimensions`,
`asset.detail-view.dimensions`, `asset.cursor.dimensions`,
`asset.inventory-appearance.dimensions`, `asset.animation-sheet.frame-bounds`, `asset.visual-anchor.bounds`.

**Environment** — `environment.webgl.unavailable`,
`environment.target.occupied`, `environment.start.failed`,
`environment.dialogue-connection.ambiguous`,
`environment.dialogue-provider.missing`,
`environment.dialogue-server.unreachable`,
`environment.dialogue-server.connection-failed`.
