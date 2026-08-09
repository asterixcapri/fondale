# Fondale

Fondale is a web-native, TypeScript-first engine for small point-and-click
adventures. Version 1.0 exposes one package root, owns its WebGL renderer and
runtime, and keeps game content in an independent Game Project.

Install it with `npm install @asterixcapri/fondale`, then follow the
[quick start](docs/public/quick-start.md). The package includes the
[concept guide](docs/public/concepts.md), [recipes](docs/public/recipes/README.md),
[public reference](docs/public/reference.md), and exact
[Support Baseline](docs/public/support-baseline.md).

The complete [Capri 1535 Example](examples/capri-1535) installs the packed
artifact and demonstrates every Engine Capability promised by Fondale 1.0.

## Development

```sh
npm ci
npm run build
npm run verify
```

`npm run build` produces the package, installs its tarball into the independent
Example, compiles both, and runs the documentation gate. `npm run verify` runs
the deterministic and current-Chrome acceptance tests.

Fondale is distributed under the [MIT License](LICENSE).
