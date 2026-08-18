---
status: accepted
---

# End a Game Session into a Detail View

A Game Project needs to say that the story is over, and Fondale had no way to
say it: a Game Session ran until whoever hosted the Engine stopped it. We give
the Game Project an Ending instead — the Game Session concludes, a Detail View
stays presented, and no further Command is accepted. The Ending carries no
picture of its own, because a Detail View is already the Engine's way of
presenting one image with optional Hotspots, so a closing card, a dedication and
a final illustration with a detail worth clicking are all the same shape.

## Consequences

A Game Project that wants to end on the frozen world must author a Detail View
depicting it; the Engine will not freeze a Scene as a substitute, because that
would make the Ending mean two different things. The Ending is committed Game
State, so the Continuation State restores a finished game to its Ending rather
than dropping the Player back into a world with nothing left to do.
