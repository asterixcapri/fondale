# Capri 1535 Example

This is a self-contained consumer of the packaged `@asterixcapri/fondale`
library.

Running the game needs the local Dialogue Provider adapter and PostgreSQL:
Raffaele and Frate Elia offer authored questions and a free-form field
together, and the free-form half is answered by the adapter. Set both up as
described under [Local Dialogue Provider adapter](#local-dialogue-provider-adapter)
first. From this directory:

```sh
npm ci
docker compose -f compose.dialogue-adapter.yml up -d
cp .env.local.example .env.local
npm run dev:dialogue-adapter
```

In a second terminal:

```sh
npm run dev
```

Then open <http://localhost:5173>. If the adapter is not reachable the game
does not start and says, in the page, which two commands to run; the reason
stays on the adapter console, and no server configuration or credential ever
reaches the browser.

The Dialogue Provider is chosen when the Example is built, never by the Player:
the ordinary build talks to the adapter, and `npm run dev:acceptance` builds
the same entry point against a deterministic in-browser provider. That is the
build the acceptance suite drives, which is why `npm run verify` needs no
database, model or network.

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

Raffaele and Frate Elia carry a Dialogue Profile as well. Talking to either one
opens a Conversation that presents the authored questions and the free-form
field together, from the first click: the authored half carries the prologue in
its exact wording, its branching and its Game Operations, while the free-form
half answers only from the Narrative Facts that Character actually knows. The
prologue is completable end to end through the authored questions alone. What
Michele learns either way reaches Reflection, and learning that the cloister
pulley is jammed sets a Game Variable, which is what opens one further authored
question for Frate Elia.

## Local Dialogue Provider adapter

The adapter runs as a separate Node.js TypeScript process and is part of what
it takes to run the game. It implements Fondale's public `DialogueProvider`
interface, uses Mastra Memory with `@mastra/pg`, and keeps PostgreSQL
credentials outside the Vite bundle.

Start a local PostgreSQL 16 instance (or supply any PostgreSQL 11+ database):

```sh
docker compose -f compose.dialogue-adapter.yml up -d
cp .env.local.example .env.local
npm run dev:dialogue-adapter
```

In a second terminal run `npm run dev`, then open <http://localhost:5173>. The
adapter listens only on `127.0.0.1:4315` by default and accepts the Example's
local Vite origins. `DATABASE_URL` and all other provider configuration are
read only by Node; there are no `VITE_` credential variables and server
failures are not returned verbatim to the browser.

The default adapter has no model or network cost: it reads and speaks through
the Example's own prologue tables in `src/prologue-knowledge.ts`, the same ones
the acceptance build uses in the browser. It never returns a Narrative Fact
outside the ones the Engine offered for that turn, and Reflection is composed
from committed Character Knowledge over its PostgreSQL-backed visible history.

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

## Live model spike

The same adapter can answer through a real model. Set `DIALOGUE_ADAPTER_MODEL`
to `live` and put a `DIALOGUE_MODEL_API_KEY` in `.env.local`, which Git
ignores. The initial model is `deepseek/deepseek-v4-flash-0731` reached through
OpenRouter; a different compatible model needs only `DIALOGUE_MODEL_ID`, and a
different vendor only `DIALOGUE_MODEL_PROVIDER_ID` and `DIALOGUE_MODEL_BASE_URL`
on the server. Which vendor hosts the model is configuration, so changing it
changes no code and no file name. The key is read by Node alone: it never
reaches the browser, a diagnostic, an error message or the repository.

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
docker compose -f compose.dialogue-adapter.yml up -d
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
