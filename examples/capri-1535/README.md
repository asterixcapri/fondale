# Capri 1535 Example

This is a self-contained consumer of the packaged `@asterixcapri/fondale`
library. From this directory:

```sh
npm ci
npm run dev
```

Then open <http://localhost:5173>.

The committed tarball under `vendor/` stands in for the npm registry while the
library is developed in the same repository. It contains the same installable
artifact an external project consumes. Fondale maintainers refresh it from the
repository root with `npm run package:example`.

Source files follow Fondale's authored concepts, while `main.ts` owns only the
browser lifecycle:

```text
src/
├── main.ts
├── game.ts
├── geometry.ts
├── scenes/
│   ├── alley/
│   │   ├── index.ts
│   │   ├── background.png
│   │   └── gate-unlocked.png
│   └── harbour/
│       ├── index.ts
│       └── background.png
├── characters/
│   └── michele/
│       ├── index.ts
│       └── walk-*.png
├── objects/
│   └── key/
│       ├── index.ts
│       ├── scene.png
│       └── inventory.png
└── sequences/
    └── conversation.ts
```

Runtime media live beside the module that owns them. A top-level `src/assets/`
directory is reserved for media genuinely shared by multiple modules. Object
directories distinguish their Scene and Inventory Appearances. Generated output
remains under `dist/`, while the Fondale package belongs under `vendor/`.
