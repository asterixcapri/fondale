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

## Local Dialogue Provider adapter

The optional local adapter runs as a separate Node.js TypeScript process. It
implements Fondale's public `DialogueProvider` interface, uses Mastra Memory
with `@mastra/pg`, and keeps PostgreSQL credentials outside the Vite bundle.
The default Example still uses `FakeDialogueProvider` and needs neither the
adapter nor PostgreSQL.

Start a local PostgreSQL 16 instance (or supply any PostgreSQL 11+ database):

```sh
docker compose -f compose.dialogue-adapter.yml up -d
cp .env.local.example .env.local
npm run dev:dialogue-adapter
```

In a second terminal run `npm run dev`, then open
<http://localhost:5173/?dialogue=local>. The adapter listens only on
`127.0.0.1:4315` by default and accepts the Example's local Vite origins.
`DATABASE_URL` and all other provider configuration are read only by Node;
there are no `VITE_` credential variables and server failures are not returned
verbatim to the browser.

The deterministic adapter has no model or network cost. Its interpretation map
is intentionally empty in the runnable server for this ticket, while Reflection
uses committed Character Knowledge and its PostgreSQL-backed visible history.
The OpenRouter model and the Michele/Antonio technical fixture belong to the
separate live-spike ticket.

Run the adapter verification independently from the standard suite:

```sh
DIALOGUE_ADAPTER_TEST_DATABASE_URL=postgresql://fondale:fondale@127.0.0.1:54329/fondale_dialogue \
  npm run verify:dialogue-adapter
```

This verifies durable continuation, thread isolation, targeted reset,
cancellation, failure cleanup, structured interpretation and the HTTP seam.
Neither `npm run build` nor `npm run verify` starts PostgreSQL or reads adapter
configuration.

Stop the local database while retaining its volume with:

```sh
docker compose -f compose.dialogue-adapter.yml stop
```

To discard only this adapter's local database volume as well, run
`docker compose -f compose.dialogue-adapter.yml down --volumes`.
