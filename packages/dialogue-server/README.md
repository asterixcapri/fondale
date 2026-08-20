# Fondale Dialogue Server

`@fondale/dialogue-server` is the separately run Node.js implementation of
Fondale's public `DialogueProvider` seam. It owns HTTP transport, Mastra-backed
Conversation memory, PostgreSQL storage and live model calls. The browser Engine
sends only the material authorised for the current Dialogue Turn; this server
never loads a Game Project or its files.

HTTP compute is stateless. Every operation creates a request-scoped Dialogue
Provider from the request's Game Session identity, reads its Conversation or
Reflection thread from PostgreSQL, and closes the Provider after the response.
The Node.js process retains no Game Session-to-Provider map; PostgreSQL is the
sole durable owner of provider transcripts and context-window memory. One
configured Dialogue Model and its credentials are shared by all requests.

## Local development

Database, server and browser Engine are three independent processes. From this
directory, create the server's private local configuration once:

```sh
cp .env.local.example .env.local
```

Add a real `DIALOGUE_MODEL_API_KEY`, then start PostgreSQL explicitly:

```sh
docker compose up -d
```

Start only the Node.js server in a second terminal:

```sh
npm run dev
```

Start one or more browser Game Projects from their own directories in further
terminals. Every Game Project points at the same Dialogue Server URL and sends
its own Narrative Context; no registration or per-Game-Project Dialogue Server
process is needed. The development command above loads `.env.local` inside Node and runs
`src/main.ts`; it never starts, stops or inspects Docker Compose. Startup validates
`DATABASE_URL` and reaches PostgreSQL before opening the HTTP port, so a missing
or unavailable database fails on the server console.

The provided Compose service listens on `127.0.0.1:54329`. Stop it while
retaining local data with `docker compose stop`, or remove its volume with
`docker compose down --volumes`.

## Configuration

`DATABASE_URL`, `DIALOGUE_MODEL_API_KEY`, `DIALOGUE_MODEL_ID`,
`DIALOGUE_ADAPTER_HOST`, `DIALOGUE_ADAPTER_PORT` and
`DIALOGUE_ALLOWED_ORIGINS` are private server
configuration. None uses a `VITE_` prefix or enters a browser bundle.

`DIALOGUE_MODEL_ID` defaults to
`openrouter/deepseek/deepseek-v4-flash-0731`; host and port default to
`127.0.0.1:4315`. A comma-separated `DIALOGUE_ALLOWED_ORIGINS` overrides the
two local Vite origins accepted by default. Credentials and model diagnostics
stay in the Node.js process and never enter Game State.

Fictional setting is not deployment configuration. Each Game Project declares
its own non-empty Narrative Context, and every dialogue request carries it to
the shared model as presentation guidance only. Explicit language and locale
configuration are outside the current Support Baseline.

## Deployment boundary

This package currently supports local development with multiple Game Projects.
It is not a secure public multi-tenant service. Authentication, tenant registration and
isolation, quotas, billing, hostile-client protection, distributed
cancellation and production retention are deployment work outside the current
Support Baseline. Multiple languages and localisation are also out of scope.

## Production startup

Build the package, then run its installed executable with deployment-provided
server environment variables:

```sh
npm run build
fondale-dialogue-server
```

The executable remains the built `dist/main.js`; it does not load `.env.local`
or manage PostgreSQL.

## Verification

Unit verification requires neither Docker nor PostgreSQL:

```sh
npm run verify
```

PostgreSQL-backed verification is explicit. Start the Compose service first,
then run:

```sh
DIALOGUE_ADAPTER_TEST_DATABASE_URL=postgresql://fondale:fondale@127.0.0.1:54329/fondale_dialogue \
  npm run verify:integration
```

Advanced hosts may start the deep server module with
`createDialogueServer(...)`, supplying deployment configuration and a
`DialogueModel` directly.
