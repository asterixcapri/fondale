# Keep the Dialogue Server free of game-specific state

A Dialogue Server holds nothing particular to a game: neither the conversation
it is continuing nor the fiction it is speaking within. Both arrive per
request, so one deployment serves every Character and every Game Session across
different Game Projects without ever loading their files.

Server instances keep no Game Session or Conversation memory in process. Each
HTTP operation identifies its session and Character, reads the corresponding
provider-owned context from PostgreSQL, and persists an accepted exchange
there. PostgreSQL remains the stateful boundary, and the browser-held session
identity isolates one running game from every other one, so any instance can
serve any Dialogue Turn.

Each Game Project declares one Narrative Context, and the browser sends it with
every Dialogue Provider operation. No project-specific fictional setting
therefore appears in the server's deployment configuration. Explicit language
configuration remains outside the current Support Baseline.
