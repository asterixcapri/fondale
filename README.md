# Fondale

Fondale is a web-native, TypeScript-first engine for small point-and-click
adventures. Fondale 0.2 is an alpha release that exposes one package root, owns
its WebGL renderer and runtime, and keeps game content in an independent Game
Project. Character, Object, and Scenery Nouns live on the definition they
describe; Hotspots retain only the declarative target identifier.

Install it with `npm install @asterixcapri/fondale`, then follow the
[quick start](docs/public/quick-start.md). The package includes the
[concept guide](docs/public/concepts.md),
[Game Project authoring guide](docs/public/game-authoring.md),
[recipes](docs/public/recipes/README.md),
[public reference](docs/public/reference.md), and exact
[Support Baseline](docs/public/support-baseline.md).

## Development

```sh
npm ci
npm run build
npm run verify
```

`npm run build` produces and type-checks the package, then runs the
documentation gate. `npm run verify` runs the deterministic and browser tests.

Fondale is distributed under the [MIT License](LICENSE).
