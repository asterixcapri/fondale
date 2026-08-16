# Fondale

Fondale is a web-native, TypeScript-first engine for small point-and-click
adventures. Fondale 0.4 is an alpha release that exposes one package root, owns
its WebGL renderer and runtime, and keeps game content in an independent Game
Project. Character, Object, and Scenery Nouns live on the definition they
describe; Hotspots retain only the declarative target identifier.

Install it with `npm install @asterixcapri/fondale`, then follow the
[quick start](docs/public/quick-start.md). The package includes the
[concept guide](docs/public/concepts.md),
[Game Project authoring guide](docs/public/game-authoring.md),
[recipes](docs/public/recipes/README.md),
[public reference](docs/public/reference.md), and exact
[Support Baseline](docs/public/support-baseline.md). Authors upgrading from the
previous alpha should start with the [0.4 migration guide](docs/public/migration-0.4.md).
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
