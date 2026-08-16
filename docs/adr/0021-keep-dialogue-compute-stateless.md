# Keep Dialogue Server compute stateless

Dialogue Server instances keep no Game Session or Conversation memory in
process: each HTTP operation identifies its session and Character, reads the
corresponding provider-owned context from PostgreSQL, and persists an accepted
exchange there. This lets any instance serve any Dialogue Turn for any Game
Project while retaining conversational continuity; PostgreSQL remains the
stateful boundary, and the browser-held session identity isolates one running
game from every other one.
