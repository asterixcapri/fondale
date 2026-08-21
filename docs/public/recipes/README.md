# Recipes

These files are one small playable game, not eight disconnected fragments. A
lantern under a crate on a quay, a brazier to light it with, a storeroom that
stays shut until it burns, and a ledger that ends the game.

They compile against the distributable package and are played by
`test/recipes.spec.ts` and `test/recipes-browser.spec.ts` on every build, so an
example that stops working stops the build.

## Playing it

From a checkout of the Engine:

```sh
npm run dev
# then open http://localhost:5170/test/fixtures/recipes.html
```

The whole game is four steps:

1. **Click the pale shape at the foot of the crate.** That is the lantern. The
   Player walks to it and picks it up: `Heavier than it looks.`
2. **Open the Inventory** — the bag, or `I` — and click the lantern to hold it.
3. **Click the brazier**, the patch to the right of centre. The wick catches,
   the lantern changes Appearance, and the storeroom door appears on the right
   of the quay.
4. **Click the lantern in the drawer again to put it back**, then click the
   storeroom door. The Scene changes, the opening Sequence plays, and a Choice
   waits. Inside, look at the ledger, then take it: the game ends on the notice.

Hold `Tab` at any point to see what is reachable.

- [The Game Project, assembled](game.ts) — every part, and `startGame`
- [Two Scenes](world.ts) — a panoramic quay and a storeroom, with their
  geometry, Hotspots, Entrances and a conditional Passage
- [Two Characters](characters.ts) — four-Facing Appearances and Animation Roles
- [One Object](lantern.ts) — the Scene and Inventory lifecycle of the lantern
- [Two Sequences](sequences.ts) — a Scene Opening with a Choice and a Skip Outcome
- [A Detail View and the Ending](notice.ts)
- [Commands and HUD](commands.ts) — the Lexicon, the fallbacks, the theme
- [Save and restore](save.ts)

The artwork is deliberately schematic: flat shapes at exactly the dimensions
the Engine validates. It shows the contract, not the craft — for that, see the
[authoring guides](../README.md#build-a-game).
