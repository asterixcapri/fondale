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
artifact an external project consumes. To refresh it from the Fondale project:

```sh
npm pack --pack-destination examples/capri-1535/vendor
node examples/capri-1535/tools/sync-package-lock.mjs
```

This project owns its source, runtime media, production art, tools, tests,
dependencies, and generated output. Runtime media live beside the source module
that owns them; `src/assets/` is reserved for media genuinely shared by multiple
modules. The `art/` directory contains only source masters and their prompt or
provenance notes; tools write processed game assets directly beside their owning
modules under `src/`.

The prologue uses exactly four panoramic Scenes:
`town square ↔ cloister` and `town square ↔ harbour ↔ coastal fortification`.
Michele accepts one ordinary paid job, retrieves the harbour winch handle from
the cloister well, and climbs to the lookout. The drifting boat seen from the
tower is the inciting incident; the larger mystery remains outside the demo.

The route exercises horizontal and vertical Camera scrolling, target-owned
Nouns, Commands, directional Passages, persistent puzzle state, Character-bound
Lines, explicit Narrations, and mouse- and keyboard-selected Choices through
the packaged public API.
