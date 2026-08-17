# 06 — Play the harbour job and oil reveal

**What to build:** Turn the completed harbour package into the playable opening
of the prologue. Michele accepts Raffaele's job, receives the sealed letter,
hears the false theft account, pulls the fishing nets aside and can collect the
oil flask before or after learning why it matters.

**Blocked by:** 02 — Build the harbour Scene package.

**Status:** resolved

- [x] Talking to Raffaele opens a Conversation with authored alternatives and optional free-form input.
- [x] Accepting the work gives Michele exactly one sealed-letter Object through an explicit Game Operation.
- [x] Raffaele communicates the alleged theft as a Claim and Cover Story, and Michele may remember it as Testimony without learning it as truth.
- [x] The critical opening remains completable through authored alternatives alone.
- [x] The nets have stable `covering` and `moved` Art Masters and Runtime Appearances that recompose cleanly over the harbour.
- [x] In the covering state the net artwork genuinely conceals the already positioned oil flask and presents a readable visual clue.
- [x] Pulling the nets runs Michele's correct directed Animation and changes the persistent Scenery Appearance at a visible Cue.
- [x] The moved state exposes the same oil-flask Object and makes its Hotspot eligible without materialising a replacement.
- [x] The oil flask has scale-correct Scene artwork, a separately designed Inventory Appearance and a complete collectible lifecycle.
- [x] The oil can be discovered before or after Raffaele or Brother Elia supplies a hint.
- [x] Unsupported uses cannot consume the oil or create an unrecoverable state.
- [x] Browser continuation preserves accepted job, letter, Testimony, net Appearance and oil location.
- [x] Browser acceptance proves the complete harbour opening and both valid oil-discovery orders.

## Comments

- 2026-08-17 — Completed the playable harbour opening: authored and free-form
  Conversation coexist; accepting Raffaele's job records his Claim as
  Testimony, transfers one sealed letter through the explicit
  `give-object-to-player` operation and leaves the concealed truth unknown.
- 2026-08-17 — Added the persistent net-cover reveal with Michele's directed
  pick-up performance, stable covering/moved artwork, the pre-positioned oil
  flask and its complete non-consuming fallback lifecycle. Actual-play-size
  Engine diagnostics cover both changed Object packages.
- 2026-08-17 — Review findings were resolved: source/Runtime terminology and
  operation naming were clarified; browser acceptance now observes Continue
  exclusively through public presentation, proves discover-first/learn-later,
  and rejects unsupported Give and Use attempts without losing the oil.
- 2026-08-17 — Required verification passes exactly:
  `npm run build && FONDALE_TEST_PORT=5373 npm run verify -- --workers=4`;
  the root Engine suite passed `312/312` in `50.3s`.
