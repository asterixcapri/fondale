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

The game opens on a staged Sequence rather than on a static tableau: the quay
is the initial Scene and declares a Scene Opening case that names no Entrance,
so it applies at the start of the game as well as on every arrival. Read it
through with `.`, or press `Escape` to skip it — either way the Sequence raises
`cameAshore`, so the second time you walk onto the quay it does not play again.
Coming back out of the storeroom is the other case on the same list, and that
one names its Entrance.

Then the game is four steps:

1. **Click the pale shape at the foot of the crate.** That is the lantern. The
   Player walks to it and picks it up: `Heavier than it looks.`
2. **Open the Inventory** — the bag, or `I` — and click the lantern to hold it.
3. **Click the brazier**, the patch to the right of centre. The wick catches,
   the lantern changes Appearance, and the storeroom door appears on the right
   of the quay.
4. **Click the lantern in the drawer again to put it back**, then click the
   storeroom door. The Scene changes, the storeroom's own opening plays, and a
   Choice waits. Inside, look at the ledger, then take it: the game ends on
   the notice.

Hold `Tab` at any point to see what is reachable.

- [The Game Project, assembled](game.ts) — every part, and `startGame`
- [Two Scenes](world.ts) — a panoramic quay and a storeroom, with their
  geometry, Hotspots, Entrances, a conditional Passage and the cases each
  Scene opens on
- [Two Characters](characters.ts) — four-Facing Appearances and Animation Roles
- [One Object](lantern.ts) — the Scene and Inventory lifecycle of the lantern
- [Three Sequences](sequences.ts) — the opening the game starts on, a Scene
  Opening with a Choice and a Skip Outcome, and one line on the way back
- [A Detail View and the Ending](notice.ts)
- [Commands and HUD](commands.ts) — the Lexicon, the fallbacks, the theme
- [Save and restore](save.ts)

The artwork is deliberately schematic: flat shapes at exactly the dimensions
the Engine validates. It shows the contract, not the craft — for that, see the
[authoring guides](../README.md#build-a-game).
