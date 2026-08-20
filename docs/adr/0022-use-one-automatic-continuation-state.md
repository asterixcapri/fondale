# Use one automatic continuation state

Fondale automatically persists one current Save Snapshot together with the
Dialogue Provider session identity needed to recover its external Conversation
memory. The Player may continue that state or start a new game, but does not
manage named Save Slots or restore older states. This keeps browser reloads
coherent across canonical Game State and non-canonical dialogue memory without
requiring versioned Conversation checkpoints.
