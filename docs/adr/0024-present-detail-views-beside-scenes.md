---
status: accepted
---

# Present Detail Views beside Scenes, not as a kind of Scene

Adventure games routinely need a close-up: a map, a document, a mechanism with
several active points. Fondale could only present the world through a Scene, and
a Scene always carries Scene Space, a Walkable Region, Perspective Scale, a
Camera and a presented Player Character. We introduce the Detail View as its own
entity instead: a single presented image with its own Hotspots, shown in place of
the world, whose Commands execute immediately because there is no Character to
approach.

## Considered Options

We first tried to widen Scene — making the Approach Point and the Walkable
Region optional, and letting the presented Scene differ from the one the Player
Character stands in. It needed no new concept, but it relaxed three invariants
that the Engine validates today, so an Author could silently author a Hotspot no
one can reach and a Scene no one can enter. Three loosened constraints for two
screens was the wrong trade.

We then tried to avoid the Engine entirely, staging the close-up as full-frame
Scenery inside the boat Scene, hidden behind a transparent Appearance. That
works once. It does not survive being wanted a dozen times across a game, and it
leaves the Player free to walk away behind the picture.

## Consequences

A Hotspot is no longer Scene-local: it belongs to whatever presents it. Detail
Views deliberately ship without travel — a Hotspot that carries the Player to
another Scene would reintroduce the presented-Scene divergence we rejected — so
a map that moves the Player waits for a later decision.

Only one Detail View is presented at a time: nesting one inside another would
add a stack to save and restore for a case no game has yet needed. A Sequence
runs unimpeded while one is presented, directing a world the Player cannot
currently see, and closes the Detail View when the world must be watched again.
