# 01 — Runtime Asset normaliser and the asset register format

**What to build:** a command an author can run on a generated PNG to make it the
size the game decided. It crops to the alpha bounding box, rescales to the target
height, writes the result as a Runtime Asset, and records the true measurement —
resulting height, width and ground contact — as a row in the game's asset
register. Generation decides how a figure looks; this command decides how tall it
is, so approving artwork is never a negotiation with the generator.

It also establishes the register's format, because it is the thing that writes
measured values into it.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Running the command on a PNG produces a Runtime Asset at exactly the target height
- [x] The reported measurements are the alpha bounding box, not the canvas dimensions
- [x] The register gains one row per asset, with the declared size and the measured height distinguishable
- [x] Re-running on an asset already registered updates its row rather than appending a second one
- [x] A fully transparent image fails with a clear message instead of reporting a degenerate box
- [x] Node invoking ImageMagick; no Python and no npm dependency added to a host game
- [x] Tests drive the command line only, on synthetic PNGs the tests generate: symmetric padding, figure touching all four edges, asymmetric padding, target larger than source, fully transparent
- [x] The tests run under `node --test` from `npm run build`, beside the script as the existing `tools/verify-*` pairs do

## Comments

Built as `skills/shared/scripts/normalise-runtime-asset.mjs` with its tests
beside it, wired into `npm run build` as `verify:runtime-asset-normaliser`.
Every checkbox above was ticked against an observed run: `npm run build` (8/8
normaliser tests, whole build green) and `npm run verify` (351 Playwright tests
green).

**Where the script lives.** `skills/shared/` rather than `tools/`, because
`tools/` never reaches a host game while this command is something the author
runs. The spec names `skills/define-character/scripts/audit-walk-strip.py` as
the precedent for a script shipped inside a skill directory, and 06 moves the
fabrication cycle into one source from which the three visual SKILL.md files are
generated; `skills/shared/` is that source, and the script is carried into each
skill directory by the same generation, never cross-referenced between them.
`skills/shared/README.md` records this and the register format, so 04 and 05 can
write a conforming table without reading the script.

**Ground contact is recorded as `Visual Anchor x`.** `CONTEXT.md` already owns
both halves of the idea — the Ground Point is where the asset meets the walkable
surface, the Visual Anchor is the point within the asset that aligns to it — and
what the script measures is the second. It is the centre of the asset's lowest
opaque row, which is not the centre of its bounding box for a figure that leans.

**Opacity is strict.** Any alpha above zero is part of the figure, so a
generator's faint halo would widen the box. Adding a fuzz threshold was
considered and rejected: it is a decision about generated artwork that belongs
to whoever calls the script, not a default hidden inside it.

**ImageMagick 7 only.** An ImageMagick 6 `convert` fallback was written and then
removed: nothing exercised it, and the tests draw their fixtures with `magick`,
so it claimed support for hosts on which the suite could not run. The
prerequisite is now stated in `AGENTS.md` beside the Chrome one.

**Not done here, by design.** The register is created by the script when it is
absent, but populating it with declared sizes for assets not yet made is 04's
work, and the generation of the three SKILL.md files from `skills/shared/` is
06's.
