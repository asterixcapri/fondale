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

Runtime media follow the game's domain structure:

```text
src/assets/
├── backgrounds/
├── characters/<character>/
├── objects/<object>/
└── scenery/<scenery>/
```

Object directories distinguish their Scene and Inventory Appearances. Generated
output remains under `dist/`, while the Fondale package belongs under `vendor/`.
