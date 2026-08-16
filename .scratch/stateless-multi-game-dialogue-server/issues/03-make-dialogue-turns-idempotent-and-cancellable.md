# 03 — Make Dialogue Turns idempotent and cancellable

**What to build:** Use the session identity, Dialogue Turn identity and provider
operation to make transport retries safe while preserving current cancellation
semantics. A completed retry must not generate or store a second visible
exchange, and a failed, cancelled or abandoned operation must leave no
half-turn in PostgreSQL.

**Blocked by:** 02 — Execute dialogue without resident session Providers.

**Status:** ready-for-agent

- [ ] Repeating one completed provider operation with the same session identity, turn identity and operation returns its completed outcome without storing a duplicate exchange.
- [ ] Interpretation and verbalisation belonging to the same Dialogue Turn remain distinct idempotent operations.
- [ ] Concurrent retries cannot both commit a visible exchange.
- [ ] The database enforces the idempotency invariant rather than relying on one Node.js process.
- [ ] A failed model call stores neither a Player Line nor a Character Line.
- [ ] A cancellation before persistence stores neither side of the exchange.
- [ ] A cancellation racing persistence either commits the complete accepted exchange once or removes it completely; it never leaves a half-turn.
- [ ] Reset racing an active turn cannot allow a late result to recreate memory that the reset invalidated.
- [ ] Leaving a Conversation, stopping a Game Session or losing the browser request continues to invalidate late provider results.
- [ ] Conversation and Reflection retain their separate cancellation and memory identities.
- [ ] Unit tests exercise transport retries without PostgreSQL, and explicit PostgreSQL integration tests prove the database-level concurrency behavior.
- [ ] Existing Dialogue Turn failure guarantees remain observable through the public Dialogue Provider interface.
