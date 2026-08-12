# Keep dialogue generation provider-agnostic

Fondale defines a public Dialogue Provider contract and requires each Game
Project integration to supply its implementation rather than calling a
particular model vendor itself. The Author may route that contract to a secured
remote service, local model, or deterministic test double, keeping provider
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
