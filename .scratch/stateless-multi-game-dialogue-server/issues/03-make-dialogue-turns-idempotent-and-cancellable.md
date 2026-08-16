# 03 — Make Dialogue Turns idempotent and cancellable

**What to build:** Use the session identity, Dialogue Turn identity and provider
operation to make transport retries safe while preserving current cancellation
semantics. A completed retry must not generate or store a second visible
exchange, and a failed, cancelled or abandoned operation must leave no
half-turn in PostgreSQL.

**Blocked by:** 02 — Execute dialogue without resident session Providers.

**Status:** ready-for-human

- [x] Repeating one completed provider operation with the same session identity, turn identity and operation returns its completed outcome without storing a duplicate exchange.
- [x] Interpretation and verbalisation belonging to the same Dialogue Turn remain distinct idempotent operations.
- [x] Concurrent retries cannot both commit a visible exchange.
- [x] The database enforces the idempotency invariant rather than relying on one Node.js process.
- [x] A failed model call stores neither a Player Line nor a Character Line.
- [x] A cancellation before persistence stores neither side of the exchange.
- [x] A cancellation racing persistence either commits the complete accepted exchange once or removes it completely; it never leaves a half-turn.
- [x] Reset racing an active turn cannot allow a late result to recreate memory that the reset invalidated.
- [x] Leaving a Conversation, stopping a Game Session or losing the browser request continues to invalidate late provider results.
- [x] Conversation and Reflection retain their separate cancellation and memory identities.
- [x] Unit tests exercise transport retries without PostgreSQL, and explicit PostgreSQL integration tests prove the database-level concurrency behavior.
- [x] Existing Dialogue Turn failure guarantees remain observable through the public Dialogue Provider interface.

## Answer

Dialogue Provider operations now use the durable session identity, Dialogue
Turn identity and operation as a PostgreSQL-backed idempotency key. Database
advisory locks serialize concurrent retries across request handlers, completed
outcomes are reused, and one database transaction commits the completed outcome
with both visible Lines so a failed persistence step leaves no half-turn.
Session-level shared/exclusive locks coordinate active turns with reset, while
the HTTP transport cancels every matching in-process operation before reset is
acknowledged. Unit and explicit PostgreSQL integration verification cover
retry reuse, concurrent handlers, failure, cancellation and reset races.
