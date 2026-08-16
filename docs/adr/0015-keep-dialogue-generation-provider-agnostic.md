# Keep dialogue generation provider-agnostic

Fondale defines a public Dialogue Provider contract and requires each Game
Project integration to select its implementation rather than calling a
particular model vendor itself. Ordinary browser startup selects a separately
run Dialogue Server by URL, from which Fondale constructs the HTTP adapter and
transient Game Session identity; tests and advanced hosts may instead inject a
low-level Provider. These forms may route the contract to a secured remote
service, local model, or deterministic test double, keeping provider
credentials and costs outside the browser Engine while preserving one stable
Knowledge-Driven Dialogue capability across providers.

A Dialogue Turn separates interpretation from verbalisation at its authority
boundary: the provider first relates free-form input to the Conversation and
authored propositions, Fondale applies knowledge and disclosure policy, then
the provider verbalises only the authorised semantic outcome. This is a logical
contract rather than a requirement for exactly two HTTP requests.

A Dialogue Provider failure aborts only its Dialogue Turn without changing
Game State. The Player may retry or leave the conversation while authored
interactions and the rest of the Game Session remain available.
