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
├── project.ts
├── geometry.ts
├── scenes/
├── characters/
├── objects/
└── sequences/
```

Runtime media follow the same domain structure:

```text
src/assets/
├── backgrounds/
├── characters/<character>/
├── objects/<object>/
└── scenery/<scenery>/
```

Object directories distinguish their Scene and Inventory Appearances. Generated
output remains under `dist/`, while the Fondale package belongs under `vendor/`.
