# Fondale Dialogue Server

`@asterixcapri/fondale-dialogue-server` is the Node.js implementation of
Fondale's public `DialogueProvider` seam. It owns HTTP transport, Mastra-backed
Conversation memory, PostgreSQL storage and live model calls; Narrative Facts
and Game State remain under the browser Engine's authority.

Start the deep server module with `createDialogueServer(...)`, supplying only
deployment configuration and a `DialogueModel`, or run the packaged executable
with server-side environment variables:

```sh
DATABASE_URL=postgresql://fondale:fondale@127.0.0.1:5432/fondale \
DIALOGUE_MODEL_API_KEY=... \
DIALOGUE_LANGUAGE=Italian \
DIALOGUE_SETTING="a 1535 Capri adventure" \
fondale-dialogue-server
```

`DIALOGUE_MODEL_ID` defaults to
`openrouter/deepseek/deepseek-v4-flash-0731`; `DIALOGUE_ADAPTER_HOST` and
`DIALOGUE_ADAPTER_PORT` default to `127.0.0.1:4315`. Credentials and model
diagnostics stay in the Node.js process and never enter Game State. A
comma-separated `DIALOGUE_ALLOWED_ORIGINS` overrides the two local Vite
origins accepted by default.
