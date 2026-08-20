# Shared skill source

What the fabrication skills need but cannot share at install time. `npx skills`
copies one skill directory and nothing else, so anything more than one of
`define-scene`, `define-character` and `define-object` needs is kept here once
and carried into each of them, never referenced across directories.

## `fabrication-cycle.md`, `snippets/` and `sources/`

Anchor, Generate, Normalise, Recompose, Approve, Register is the same procedure
for a Scene, a Character and an Object, and an installed skill cannot read it out
of another skill's directory. It is therefore written once in
`fabrication-cycle.md` and rendered into each skill's `SKILL.md` by
`tools/generate-skill-documents.mjs`, from that skill's own two documents:

- `sources/<skill>.md` — the skill's own prose, with `{{ fabrication-cycle }}`
  where the six steps belong and `{{ a value }}` wherever the cycle needs a word
  from this skill;
- `sources/<skill>.values.md` — one `## a value` section per placeholder.

A paragraph shorter than the cycle but still written identically by more than
one skill is a file in `snippets/`, marked as `{{ <file name> }}` on a line of
its own wherever it belongs. A snippet reads the same in every skill that marks
it, so it carries no `{{ a value }}` of its own unless every one of them means
the same thing by it.

Steps are numbered by the generator, so a skill puts as many steps of its own
before and after the cycle as it needs, and the cycle refers to its own steps by
name rather than by number. A placeholder with no value, a value nothing uses, a
snippet no source marks, and a value that takes a snippet's name are all
errors.

After editing anything here, run:

```sh
npm run generate:skill-documents
```

`npm run build` then fails when a generated `SKILL.md` is not what the source
generates, so a hand edit to one of them is caught rather than lost at the next
generation.

## `scripts/normalise-runtime-asset.mjs`

Makes a generated image the size the game decided. It crops to the alpha
bounding box, rescales to the target height, writes the result as a Runtime
Asset, and records what it actually measured. Generation settles how a figure
looks; this settles how tall it is, so approving artwork is never a negotiation
with the generator.

Node invoking ImageMagick 7 — the `magick` command. Nothing else, so a host game
gains no npm dependency and no Python.

```sh
node normalise-runtime-asset.mjs \
  --input generated.png --output art/characters/michele/idle.png \
  --target-height 249 \
  --register docs/game/assets.md --asset michele
```

`--register` and `--asset` are given together and may both be omitted, in which
case the image is normalised and the measurements are only printed.

A fully transparent image is refused rather than measured.

## The asset register

`docs/game/assets.md` in the host game, one row per Runtime Asset:

| Asset | Declared size | Target height | Measured height | Measured width | Visual Anchor x | File |
| --- | --- | --- | --- | --- | --- | --- |
| michele | 1.75 m | 249 | 249 | 96 | 47 | ../../art/characters/michele/idle.png |

`Declared size` is the author's, in the author's own world unit, and is decided
before fabrication; `setup-game` writes it and leaves every other cell as an em
dash. All the rest are pixels the script measured from the finished image and
are never written by hand — a declared number nobody checked is the defect this
script exists to remove. `Visual Anchor x` is the centre of the asset's lowest
opaque row, in pixels from its left edge: where the asset meets its Ground
Point. `File` is the output path relative to the register itself, so a reader
resolves it from `docs/game/`.

Running the script on an asset already listed rewrites its row and preserves the
declared size. Running it on one that is not listed appends a row. The script
creates the register, with this header and a note explaining it, when the file
does not exist.
