# Spec — Declarative connection to a separately run Dialogue Server

**Status:** ready-for-agent

## Problem Statement

Fondale now develops the Node.js Dialogue Server as the separate
`@asterixcapri/fondale-dialogue-server` package, but the Capri Game Project
still owns parts of its implementation and lifecycle. Its browser entry point
imports and creates `HttpDialogueProvider`, chooses a fake provider for the
acceptance build, generates a Game Session identity, checks server reachability
and explains how to start the backend. The Example also owns the PostgreSQL
Compose file and the server's private environment template.

This makes the package seam misleading. An Author still has to understand a
Dialogue Provider implementation to connect a game, test-only provider code
lives beside authored game content, and the game directory appears responsible
for starting infrastructure that is deliberately deployed separately.

## Solution

The three runtime responsibilities are explicit and independently started:

1. PostgreSQL is started with `docker compose up -d` from the Dialogue Server's
   infrastructure location.
2. The Node.js Dialogue Server is started with `npm run dev` in the
   `@asterixcapri/fondale-dialogue-server` workspace.
3. The browser game is started with `npm run dev` in the game directory.

The Dialogue Server's `npm run dev` starts Node only. It never starts, stops or
recreates PostgreSQL, and it fails clearly when its configured database is not
available.

For dialogue infrastructure, a game declares only the Dialogue Server URL. A
Fondale-owned browser module creates the HTTP Dialogue Provider, creates the
transient Game Session identity, follows Dialogue Turn cancellation and checks
the connection. The Capri browser entry point contains no Dialogue Provider
import, implementation, factory or protocol handling.

The Dialogue Server never loads a Game Project or reads game files. The Engine
compiles the Game Project in the browser, decides which Narrative Facts and
Claims are authorised for the current Game State, and sends only that turn's
authorised material across the HTTP seam. PostgreSQL stores provider-owned
visible Conversation and Reflection history; canonical Narrative Facts,
Character Knowledge, Disclosure and Game State remain in the game.

## User Stories

1. As an Author, I want to declare only a Dialogue Server URL, so that I do not need to understand or instantiate a Dialogue Provider.
2. As an Author, I want Narrative Facts, Character Knowledge, Disclosure, Cover Stories and portrayal to remain in my Game Project, so that narrative authority remains local and declarative.
3. As an Author, I want no server, model, database or fake-provider implementation in my game source, so that game files describe the game rather than its infrastructure.
4. As a server developer, I want `npm run dev` in the Dialogue Server package to start the Node process, so that the package can be developed independently of any example game.
5. As a server developer, I want PostgreSQL started explicitly with Docker Compose, so that an npm lifecycle command never mutates infrastructure implicitly.
6. As a server developer, I want server credentials and model configuration beside the server deployment, so that they never enter a Vite bundle or game repository surface.
7. As a contributor, I want the standard acceptance build to use a deterministic HTTP stand-in owned by tests, so that browser verification needs no database, network or model.
8. As a contributor, I want the low-level Dialogue Provider seam to remain injectable in Engine tests, so that cancellation, failure and state behavior remain deterministic.
9. As a Player, I want an unreachable Dialogue Server to produce an actionable public message without revealing configuration or credentials.
10. As an operator, I want the game and Dialogue Server deployable on different hosts, so that their lifecycles and scaling remain independent.
11. As an operator, I want one Dialogue Server process to isolate provider memory by Game Session, so that concurrent Players never share visible dialogue history.
12. As a maintainer, I want documentation to show the three explicit commands, so that no one infers that the browser starts Node or PostgreSQL.

## Implementation Decisions

**Three explicit owners.** Docker Compose owns PostgreSQL, the
`fondale-dialogue-server` workspace owns the Node process, and the Game Project
owns authored content. No command silently crosses these ownership lines.

**URL instead of Provider construction.** The high-level browser startup
interface accepts a Dialogue Server URL. It owns construction of the HTTP
adapter, a cryptographically random Game Session identity, the initial
reset/reachability check and the adapter passed to the existing Game Session
implementation. A caller must not supply both a server URL and a low-level
Dialogue Provider; that is an environment diagnostic.

The low-level Dialogue Provider injection remains available for Engine tests,
technical fixtures and custom hosts. The HTTP adapter may remain public for
advanced use, but ordinary Game Project startup and the Capri Example do not
construct it.

**The server does not load the game.** There is no project path, YAML loader,
dynamic import or game registry in the Dialogue Server. Each Dialogue Turn
request carries only the Player input and the Engine-authorised candidates or
payload needed for that phase. This preserves the existing Dialogue Provider
seam and ADR-0013's narrative-authority rule.

**Server-owned development configuration.** The PostgreSQL Compose definition
and the server environment template move out of the Capri Example and beside
the Dialogue Server package or its repository-level deployment directory. The
template covers database connection, host, port, allowed origins, model key,
model identifier and the current presentation settings. No secret uses a
`VITE_` prefix.

**Node-only `dev`.** The server workspace gains `npm run dev`, running its
TypeScript entry point with server-side environment loading. Its production
entry remains the built `fondale-dialogue-server` executable. Neither command
invokes Docker Compose.

**Test behavior belongs to tests.** Capri's local fake Dialogue Provider and
scripted prologue interpretation/verbalisation move out of game runtime source.
The acceptance harness intercepts the Dialogue HTTP seam or starts a
deterministic test-only transport. It answers the same protocol the real
browser client uses, so the acceptance build exercises the production
connection path without PostgreSQL or an LLM.

**No central multi-game tenancy yet.** A separately run server is not yet a
multi-tenant hosted platform. Per-game authentication, quotas, registered
presentation configuration and hostile-client protection require a later
design. This work establishes the package and deployment seam without claiming
those properties.

**Architecture record.** ADR-0020 is updated to record the independently run
database, server and browser game, and to clarify that the game sends
authorised turn material rather than the server loading a Game Project.

## Testing Decisions

**Primary seam — browser startup.** Browser tests prove that a Game Project
which requires generated dialogue starts from a declared server URL, reaches
the HTTP protocol, uses an isolated session identity, follows cancellation and
resets provider memory on restore. Supplying both a URL and a provider produces
a precise environment diagnostic. A Game Project without a Dialogue Profile
still starts without either. This is the highest seam that observes the
Author-facing declaration, browser transport and Engine behavior together.

**Secondary seam — Dialogue Server package.** Existing unit and PostgreSQL
integration tests continue to exercise the public server interface. Add a
configuration/startup test where useful, but never make the standard build
start Docker or require PostgreSQL. PostgreSQL-backed verification remains an
explicit integration command. The existing public-server integration test is
the prior art for this seam.

**Separation seam — Capri Example.** The existing separation gate proves that
Capri runtime source contains no Dialogue Provider, HTTP adapter, server
implementation, database client or model dependency. Standard browser
acceptance intercepts HTTP and remains deterministic. The opt-in live suite
continues to exercise the real server, PostgreSQL and model.

**Repository gates.** `npm run build`, isolated-port `npm run verify`, Dialogue
Server unit tests, explicit PostgreSQL integration tests, Capri production
build and the relevant Capri browser tests must pass. Existing acceptance
expectations already invalidated by unrelated in-progress game-content changes
are reported separately and are not rewritten by this effort.

## Out of Scope

- Starting PostgreSQL from `npm run dev` or any npm lifecycle command.
- Starting the Dialogue Server from browser JavaScript.
- Combining all three processes into one development command.
- Converting TypeScript Game Project declarations to YAML.
- Making the Dialogue Server a multi-tenant public platform.
- Production authentication, rate limiting, billing or quota enforcement.
- Dockerising the Node.js Dialogue Server.
- Changing Narrative Fact, Character Knowledge, Disclosure, Cover Story,
  Conversation, Reflection or Save semantics.
- Changing the selected LLM or model-provider SDK.

## Further Notes

The browser cannot start a Node.js process or PostgreSQL and must never receive
their credentials. A future developer convenience command may coordinate the
three explicit owners, but it must remain orchestration over separate
processes, not a change in architectural ownership.
