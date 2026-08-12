# Offer authored alternatives and free-form input together

A Conversation presents authored alternatives and free-form input at the same
time, for its whole duration, instead of alternating between them: selecting an
authored alternative yields exact authored language without reaching a Dialogue
Provider, while typed speech opens an ordinary Dialogue Turn. The Player needs
no unlock to reach either, and both remain available at every point of the
Conversation.

This supersedes the assumption in ADR-0014 that play moves between authored and
Knowledge-Driven Dialogue one at a time through an authored handoff. The two
paths remain complementary in authority — authored conditions and Engine
decisions still govern Game State, and generated speech still decides nothing —
but they are no longer mutually exclusive in presentation.

## Considered options

Gating free-form input behind an authored condition was rejected. It would have
made a Character's Dialogue Profile conditional, and it presented the free-form
field first to a Player who had learned no Narrative Fact yet and therefore had
nothing to ask about: the feature would introduce itself at its weakest moment,
as a Character that appears not to understand.

Authored alternatives solve that problem without a gate. They show the Player
what is worth asking, so the free-form field is discovered as an extension of a
conversation already under way rather than as an empty prompt.

## Consequences

Authored alternatives keep their existing eligibility conditions, their exact
wording, and their ability to hand control to a Sequence; nothing about
authored dialogue changes except that it is now presented alongside an input
field. Puzzle-critical wording therefore stays authored and free of model cost.

A Player may reach a topic through either path, so an authored line can go
unheard when the same question is typed instead. The Engine does not reconcile
the two: authoring is expected to keep puzzle-critical and well-crafted
material in authored alternatives.
