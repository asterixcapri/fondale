# 02 — Execute dialogue without resident session Providers

**What to build:** Make each Dialogue Server request recover the provider-owned
Conversation or Reflection context it needs from PostgreSQL and execute through
the shared Dialogue Model, without retaining a Game Session-to-Provider map in
the Node.js process. A restarted or independently constructed handler must be
able to continue the same session from its external memory.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Interpretation, verbalisation, Reflection and reset are executable from the session identity carried by the current HTTP request.
- [ ] The server retains no map of Game Session identities to Dialogue Provider instances between requests.
- [ ] PostgreSQL remains the sole durable owner of provider transcripts and context-window memory.
- [ ] One configured Dialogue Model and its credentials can be shared across requests from different Game Projects and Game Sessions.
- [ ] Conversation memory is isolated by session identity and speaking Character.
- [ ] Reflection memory is isolated by session identity and reflecting Character and never shares a Conversation thread.
- [ ] Different Characters in one session never receive each other's visible history.
- [ ] Different sessions using identical Character identities never receive each other's visible history.
- [ ] A new request handler recovers the visible history written by an earlier handler for the same session.
- [ ] Restarting the Node.js server does not erase PostgreSQL-backed Conversation or Reflection memory.
- [ ] Reset removes only the provider memory belonging to the identified session.
- [ ] Request-lifetime cancellation state may remain in process but cannot become conversational memory or a session cache.
- [ ] PostgreSQL-backed verification remains explicit, while standard unit verification requires neither PostgreSQL nor a live model.
