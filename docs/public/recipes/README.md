# Recipes

These files are one small playable game, not eight disconnected fragments. A
lantern under a crate on a quay, a brazier to light it with, a storeroom that
stays shut until it burns, and a ledger that ends the game.

They compile against the distributable package and are played by
`test/recipes.spec.ts` and `test/recipes-browser.spec.ts` on every build, so an
example that stops working stops the build.

- [The Game Project, assembled](game.ts) — every part, and `startGame`
- [Two Scenes](world.ts) — a panoramic quay and a storeroom, with their
  geometry, Hotspots, Entrances and a conditional Passage
- [Two Characters](characters.ts) — four-Facing Appearances and Animation Roles
- [One Object](lantern.ts) — the Scene and Inventory lifecycle of the lantern
- [Two Sequences](sequences.ts) — an arrival with a Choice and a Skip Outcome
- [A Detail View and the Ending](notice.ts)
- [Commands and HUD](commands.ts) — the Lexicon, the fallbacks, the theme
- [Save and restore](save.ts)

The artwork is deliberately schematic: flat shapes at exactly the dimensions
the Engine validates. It shows the contract, not the craft — for that, see the
[authoring guides](../README.md#build-a-game).
