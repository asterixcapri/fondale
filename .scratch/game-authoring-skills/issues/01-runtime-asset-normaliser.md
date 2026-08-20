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

**Status:** ready-for-agent

- [ ] Running the command on a PNG produces a Runtime Asset at exactly the target height
- [ ] The reported measurements are the alpha bounding box, not the canvas dimensions
- [ ] The register gains one row per asset, with the declared size and the measured height distinguishable
- [ ] Re-running on an asset already registered updates its row rather than appending a second one
- [ ] A fully transparent image fails with a clear message instead of reporting a degenerate box
- [ ] Node invoking ImageMagick; no Python and no npm dependency added to a host game
- [ ] Tests drive the command line only, on synthetic PNGs the tests generate: symmetric padding, figure touching all four edges, asymmetric padding, target larger than source, fully transparent
- [ ] The tests run under `node --test` from `npm run build`, beside the script as the existing `tools/verify-*` pairs do
