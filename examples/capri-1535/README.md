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

After adding the model key to the server-owned `.env.local`, start the Game
Project in a separate terminal:

```sh
cd examples/capri-1535
npm ci
npm run dev
```

Then open <http://localhost:5173>. If the server is not reachable the game
does not start and shows an actionable connection diagnostic; the reason
stays on the server console, and no server configuration or credential ever
reaches the browser.

The Example declares only the Dialogue Server URL. Fondale owns the HTTP
adapter, Game Session identity and connection check. The suite answers the
Dialogue Provider seam with test-owned deterministic support instead, which is
why `npm run verify` needs no database, model or network.

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

## The prologue route

The prologue uses exactly four Scenes:
`cloister ↔ harbour ↔ coastal fortification ↔ drifting boat`. The harbour is
the opening Scene and the hub; the cloister and the fortification hang off it
in opposite directions, and the drifting boat is reached from the
fortification's rocks stairway.

Michele accepts one ordinary paid job at the harbour, where the winch has lost
its handle. Raffaele pays him to carry a sealed letter to the cloister and
mentions an oil flask hidden under the fishing nets. Brother Elia reads the
letter, tells Michele that the handle was lent rather than stolen, and the
oiled pulley frees the well that holds it. Back at the harbour the handle goes
onto the winch, Michele answers Raffaele about what he now knows, and the
repaired winch launches the gozzo to the coastal fortification. From the
lookout he sights a small boat adrift, climbs down to it, and finds a wounded
sailor who mistakes him for his father and hands him an oilskin bundle.

The handoff unties the bundle in the same beat and presents its contents as a
Detail View: the broken seal of the *Santa Marta* and a torn fragment of her
registry, read close and in either order. The seal names the ship Michele's
father sailed on, lost in October 1533; the fragment records her unloading
grain at Amalfi in June 1534, eight months later. The close-up is dismissed on
the completed reading, the sailor dies where the Player can watch it, Michele
answers with one line and a gesture, and the Game Session ends on a closing
Detail View. Who the sailor was, and how the ship kept sailing after she sank,
remain outside the demo.

The route exercises horizontal and vertical Camera scrolling, target-owned
Nouns, Commands, directional Passages, persistent puzzle state, Character-bound
Lines, explicit Narrations, skippable directed Sequences, collectible Objects,
Detail Views, an Ending, Reflection, and mouse- and keyboard-selected Choices
through the packaged public API. The whole prologue is completable through the
authored Conversation alternatives alone, without ever typing a free-form
question.

Raffaele and Frate Elia carry a Dialogue Profile as well. Talking to either one
opens a Conversation that presents the authored questions and the free-form
field together, from the first click: the authored half carries the prologue in
its exact wording, its branching and its Game Operations, while the free-form
half answers only from the Narrative Facts that Character actually knows. What
Michele learns either way reaches Reflection, and learning that the cloister
pulley is jammed sets a Game Variable, which is what opens one further authored
question for Frate Elia.

Raffaele's account of the handle is a Cover Story. Michele remembers it as that
Character's Testimony and never as canonical Character Knowledge, so believing
Raffaele and hearing Brother Elia's contradiction can both be true of the same
Game State.

## Verification

```sh
npm run verify   # deterministic, no browser, database, model or network
```

`npm run verify` runs the Example as a headless Core Session — the seam the
browser adapter drives itself — and asserts Game State. It covers the whole
prologue end to end, the alternative discovery order, both reading orders of the
closing Detail View, the Ending and its survival of a reload, Capri's authored
Knowledge and Disclosure, Reflection, every skippable Sequence, continuation
mid-route, both Camera edges of the panoramic quay and the vertical bands of the
fortification, and each Scene package driven on its own.

What it deliberately does not cover. Animation timing is not machine-checked: it
measures machine load more often than a defect. Asset loading is not asserted
either — every asset is a static ESM import, so a missing file fails the build in
seconds. Engine behaviour is not re-proved here: provider failure, turn
cancellation, keyboard parity and the browser startup diagnostic all belong to
Fondale's own suite, against fixtures of its own. What is left is Capri 1535.

Visual correctness is a human review, and it has no automated substitute here. A
Scene's size at actual play scale, its depth sorting and its occlusion are judged
by running the game and looking at it. The browser suite that once left
screenshots behind judged none of those either: it only proved that the frame had
been redrawn.

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

In the Example directory, run `npm run dev` in a third terminal, then open
<http://localhost:5173>. The server listens only on `127.0.0.1:4315` by
default and accepts the Example's local Vite origins.

That address is the one thing this game reads from its environment, through
`VITE_DIALOGUE_SERVER_URL`, and `.env.local.example` documents it. Leaving it
unset uses the local default, so an ordinary run needs no `.env.local` here at
all. Nothing else belongs in the
Example's environment: `DATABASE_URL`, the model key and every other provider
setting are read only by Node in the server's own process. There are no `VITE_`
credential variables, and server failures are not returned verbatim to the
browser.

The suite never reaches this server: it answers the Dialogue Provider seam in
process instead. The local server always uses its configured live model and
stores only visible Conversation and Reflection history in PostgreSQL.

Run Dialogue Server verification from its owning workspace, independently from
the Example's standard suite:

```sh
cd ../../packages/dialogue-server
DIALOGUE_ADAPTER_TEST_DATABASE_URL=postgresql://fondale:fondale@127.0.0.1:54329/fondale_dialogue \
  npm run verify:integration
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
The Game Project's `narrativeContext` supplies its fictional setting with every
request, so the server package and its environment contain no Capri-specific
presentation configuration. Fondale currently has no explicit language or
locale setting; the Example's Italian wording comes from its authored content
and Player speech.

Interpretation asks for a closed structured output restricted to the Narrative
Facts the speaking Character actually knows, and Fondale independently rejects
any ID outside that set. Verbalisation receives only the Engine-authorised
fact, Claim or Response Strategy, so the model chooses wording, never content.

With the adapter running in `live` mode you can open the Example in the browser
and talk to a Character yourself, which is how the real model is judged.

Whether a real model reads a paraphrase into the right Narrative Fact is a
question about the prompt, which `packages/dialogue-server` owns and where its
verification belongs. The Example asks nothing of a model: it proves that Capri's
authored Disclosure decides correctly, whoever puts the answer into words.
