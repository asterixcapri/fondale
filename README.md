# Fondale

Fondale is a web-native, TypeScript-first engine for small point-and-click
adventures. Fondale 0.4 is an alpha release that exposes one package root, owns
its WebGL renderer and runtime, and keeps game content in an independent Game
Project. Character, Object, and Scenery Nouns live on the definition they
describe; Hotspots retain only the declarative target identifier.

Install it with `npm install @asterixcapri/fondale`, then follow the
[quick start](docs/public/quick-start.md) to get a Scene on screen, or
[building a game](docs/public/building-a-game.md) for the authoring pipeline
that takes an idea to a playable short adventure. The package includes the
[documentation index](docs/public/README.md), one
[authoring guide per subject](docs/public/README.md#build-a-game), the
[vocabulary](docs/public/vocabulary.md),
[recipes](docs/public/recipes/README.md),
[contract index](docs/public/contract-index.md),
[Dialogue Provider protocol](docs/public/dialogue-provider.md),
[diagnostics](docs/public/diagnostics.md), and exact
[what the Player gets](docs/public/player-experience.md).
Maintainers and new contributors can explore the complete capability-owned flow in
the self-contained Italian [Engine architecture map](docs/engine-architecture.html).

Games that route Knowledge-Driven Dialogue to a Node.js backend can install
`@asterixcapri/fondale-dialogue-server`. It is developed in this repository but
published separately so Mastra, PostgreSQL and HTTP-server dependencies never
enter browser-only Fondale installations.

## Development

```sh
npm ci
npm run build
npm run verify
```

`npm run build` produces and type-checks both packages, runs the Dialogue Server
unit tests, then runs the documentation gate. `npm run verify` runs the
deterministic and browser tests. PostgreSQL-backed server verification remains
explicit:

```sh
DIALOGUE_ADAPTER_TEST_DATABASE_URL=postgresql://fondale:fondale@127.0.0.1:54329/fondale_dialogue \
  npm run verify:dialogue-server:integration
```

Fondale is distributed under the [MIT License](LICENSE).
