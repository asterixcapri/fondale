# Capri 1535 Example

This is a self-contained consumer of the packaged `@asterixcapri/fondale`
library.

Running the game needs the separately run Dialogue Server and PostgreSQL:
Raffaele and Frate Elia offer authored questions and a free-form field
together, and the free-form half is answered by the server. Set both up as
described under [Local Dialogue Server](#local-dialogue-server) first. From the
repository root:

```sh
cd packages/dialogue-server
cp .env.local.example .env.local
docker compose up -d
npm run dev
```

After adding the model key to the server-owned `.env.local`, start the game in
a separate terminal:

```sh
cd examples/capri-1535
npm ci
npm run dev
```

Then open <http://localhost:5173>. If the server is not reachable the game
does not start and says, in the page, which two commands to run; the reason
stays on the server console, and no server configuration or credential ever
reaches the browser.

The Dialogue Provider is chosen when the Example is built, never by the Player:
the ordinary build talks to the adapter, and `npm run dev:acceptance` builds
the same entry point against a fake in-browser provider. That is the
build the acceptance suite drives, which is why `npm run verify` needs no
database, model or network.

The committed tarball under `vendor/` stands in for the npm registry while the
library is developed in the same repository. It contains the same installable
artifact an external project consumes. To refresh it from the Fondale project:

```sh
npm pack --pack-destination examples/capri-1535/vendor
npm pack --workspace @asterixcapri/fondale-dialogue-server \
  --pack-destination examples/capri-1535/vendor
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

Raffaele and Frate Elia carry a Dialogue Profile as well. Talking to either one
opens a Conversation that presents the authored questions and the free-form
field together, from the first click: the authored half carries the prologue in
its exact wording, its branching and its Game Operations, while the free-form
half answers only from the Narrative Facts that Character actually knows. The
prologue is completable end to end through the authored questions alone. What
Michele learns either way reaches Reflection, and learning that the cloister
pulley is jammed sets a Game Variable, which is what opens one further authored
question for Frate Elia.

## Local Dialogue Server

The Dialogue Server runs as a separate Node.js process and is part of what it takes to
run the game. The installable `@asterixcapri/fondale-dialogue-server` package
implements Fondale's public `DialogueProvider` interface, uses Mastra Memory
with `@mastra/pg`, and keeps PostgreSQL credentials outside the Vite bundle.

The server workspace owns both its private environment template and its local
PostgreSQL Compose definition. From `packages/dialogue-server`, start a local
PostgreSQL instance (or supply a compatible database), then start Node as a
separate operation:

```sh
docker compose up -d
cp .env.local.example .env.local
npm run dev
```

In the Example directory, `npm run dev:dialogue-adapter` remains a temporary
compatibility alias for the same package-owned development command while the
Capri migration lands. In another terminal run `npm run dev`, then open
<http://localhost:5173>. The server listens only on `127.0.0.1:4315` by default and accepts the Example's
local Vite origins. `DATABASE_URL` and all other provider configuration are
read only by Node; there are no `VITE_` credential variables and server
failures are not returned verbatim to the browser.

The acceptance build still uses the Example's deterministic in-browser fake,
so its standard verification has no model or network cost. The local server
always uses its configured live model and stores only visible Conversation and
Reflection history in PostgreSQL.

Run the adapter verification independently from the standard suite:

```sh
DIALOGUE_ADAPTER_TEST_DATABASE_URL=postgresql://fondale:fondale@127.0.0.1:54329/fondale_dialogue \
  npm run verify:dialogue-adapter
```

This verifies durable continuation, thread isolation, targeted reset,
cancellation, failure cleanup, structured interpretation and the HTTP seam.
Neither `npm run build` nor `npm run verify` starts PostgreSQL or reads adapter
configuration.

From `packages/dialogue-server`, stop the local database while retaining its volume with:

```sh
docker compose stop
```

To discard only this adapter's local database volume as well, run
`docker compose down --volumes`.

## Live model spike

The adapter always answers through a real model, so it needs a
`DIALOGUE_MODEL_API_KEY` in `.env.local`, which Git ignores. The initial model is `deepseek/deepseek-v4-flash-0731` reached through
OpenRouter; a different compatible model needs only `DIALOGUE_MODEL_ID`, and a
different Mastra-supported vendor is selected by the vendor prefix in that
same model identifier. Which vendor hosts the model is configuration, so
changing it changes no code and no file name. The key is read by Node alone: it never
reaches the browser, a diagnostic, an error message or the repository.
`DIALOGUE_LANGUAGE` and `DIALOGUE_SETTING` provide the Game Project's
presentation context without hardcoding Capri-specific material in the server
package.

Interpretation asks for a closed structured output restricted to the Narrative
Facts the speaking Character actually knows, and Fondale independently rejects
any ID outside that set. Verbalisation receives only the Engine-authorised
fact, Claim or Response Strategy, so the model chooses wording, never content.

The technical Michele/Antonio fixture lives at
`test/fixtures/live-dialogue.html` and shares nothing with the Example's
canonical story. With the adapter running in `live` mode you can open it
in the browser and talk to Antonio yourself.

The live verification is opt-in and stays outside `npm run build`,
`npm run verify` and `npm run verify:dialogue-adapter`. It needs local
PostgreSQL, a model API key with credit, and the network:

```sh
cd ../../packages/dialogue-server
docker compose up -d
cd ../../examples/capri-1535
DIALOGUE_ADAPTER_TEST_DATABASE_URL=postgresql://fondale:fondale@127.0.0.1:54329/fondale_dialogue \
  npm run verify:dialogue-live
```

It starts its own dev server and adapter, then observes paraphrased questions,
a communicated `open` fact, a protected `secret`, the declared Cover Story and
its remembered Testimony, durable multi-turn continuity, Load resetting every
provider thread, and Reflection separating uncertain Hypothesis. It asserts
canonical Game State and provider memory only; the generated Lines are printed
for a human to read, never compared with an expected sentence. The adapter
console reports model ID, latency and token cost, all outside Game State.
