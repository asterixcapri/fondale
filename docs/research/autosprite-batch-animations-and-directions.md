# AutoSprite batch generation, directions, and frame exports

Research date: 14 August 2026
Question: can one AutoSprite request generate every animation frame and all
directional Facings together, or must animations and directions be generated
separately?

## Result in brief

**One API call can batch several animation entries, but AutoSprite still runs
and bills each entry as an independent animation workflow.** The REST endpoint
accepts 1–10 entries in `animations[]`; its response contains one `jobId` and
one `videoId` per successful entry. Each animation produces its own video and
spritesheet. A batch request is therefore a convenience, not a single shared
generation and not a credit-saving operation
([Spritesheets API](https://www.autosprite.io/docs/api-spritesheets)).

For directions:

- A **sidescroller** `walk`, `idle`, `run`, `jump`, `attack`, or `custom`
  generates one right-facing side-view animation. Left is created by the game
  at render time through horizontal mirroring. It does not generate independent
  front and back Facings
  ([Animation Types](https://www.autosprite.io/docs/reference-animation-types)).
- **Isometric** generation supplies the directional kinds `up`, `right`,
  `down`, `northeast`, and `southeast`. Each selected direction is a separate
  animation entry, video, spritesheet, and charge. Left, northwest, and
  southwest do not exist as generation kinds; the game mirrors their east-side
  counterparts. `up` and `down` provide back/front movement only in
  AutoSprite's top-down/three-quarter isometric projection, not the eye-level,
  elevation-zero Facings Michele needs
  ([Spritesheets API](https://www.autosprite.io/docs/api-spritesheets),
  [Animation Types](https://www.autosprite.io/docs/reference-animation-types)).
- There is **no API `all directions` kind, flag, shortcut, or implicit default**.
  “Generate all five directions” means submitting five explicit
  `iso_<action>_<direction>` entries, usually in one batch call. At the default
  turbo tier, five entries cost five times the per-animation price
  ([MCP integration](https://www.autosprite.io/docs/mcp),
  [Credits](https://www.autosprite.io/docs/reference-credits)).

Consequently, AutoSprite cannot produce Michele's four independent,
eye-level `left`, `right`, `front`, and `back` walk cycles through one native
directional mode. Four separately prepared images require separate character
records/calls or separate Advanced Mode rows unless they already exist as
reusable poses on one character. In every case they remain four independent
generations; the API offers no cross-direction consistency contract.

## What a single generation request actually does

The character endpoint is:

```text
POST /api/v1/characters/:characterId/spritesheets
```

Its current REST documentation defines `animations` as a required array of
1–10 animation entries. The official sidescroller example submits `idle`,
`walk`, `attack`, and `custom` together. The response does not return one
combined video or one combined sheet; it returns four workflow records, each
with its own `jobId`, `kind`, and `videoId`, and reports the summed credit use
([Spritesheets API](https://www.autosprite.io/docs/api-spritesheets)).

The character ID occurs once in the endpoint path, so every entry in that call
belongs to the same AutoSprite character. An entry may select a saved pose as
its first/last frame, but it cannot supply another character's base image. This
matters for Michele: uploading front, back, left, and right as four AutoSprite
characters means four generation calls even though Advanced Mode can present
and execute those calls as one matrix batch.

That gives three distinct meanings which should not be conflated:

| Operation | Can be done together? | Actual unit of work |
|---|---|---|
| Submit several animations | Yes, up to 10 entries in one REST call | One workflow/video/sheet and charge per entry |
| Run several UI rows | Yes, Advanced Mode has `Run All` | One pipeline row per character × animation |
| Download existing results | Yes, `Download All` can package outputs | Packaging only; it creates no missing directions |

Advanced Mode makes the same separation visible as a matrix: every
character × animation pair has its own first frame, optional last frame, video,
and spritesheet stages. `Run All` executes all rows, rather than merging them
into one generative operation
([Advanced Mode](https://www.autosprite.io/docs/guide-advanced-mode)).

## Direction behavior

### Sidescroller

The non-isometric kinds are `idle`, `walk`, `run`, `attack`, `jump`, and
`custom`. They are explicitly defined as 2D side-view animations. AutoSprite
generates only the right-facing artwork; the game flips that same artwork for
left movement, so only one animation is billed
([Animation Types](https://www.autosprite.io/docs/reference-animation-types)).

This means:

- `walk` is not a four-Facing walk request;
- `left` is not a second generated view and cannot contain asymmetric left-side
  details independently;
- there are no sidescroller `walk_front` or `walk_back` enum values;
- a direction written inside a `custom` prompt is prompt guidance, not a native
  directional linkage to other custom entries.

### Isometric

The API enumerates these five generated directions for each supported
isometric action:

```text
up, northeast, right, southeast, down
```

For example, a full isometric run is one request whose `animations[]` contains
five explicit entries: `iso_run_up`, `iso_run_northeast`, `iso_run_right`,
`iso_run_southeast`, and `iso_run_down`. The response still creates five
workflows. West, northwest, and southwest are produced only by runtime
horizontal flipping
([Spritesheets API](https://www.autosprite.io/docs/api-spritesheets)).

For a four-way top-down game the smallest native set is `up`, `right`, and
`down`, with `right` mirrored for left. For full eight-way playback it is five
generated directions plus three mirrored ones. Each generated isometric
direction is independently billed at the selected video-tier price
([Animation Types](https://www.autosprite.io/docs/reference-animation-types),
[MCP integration](https://www.autosprite.io/docs/mcp)).

These are top-down/three-quarter sprites. They should not be interpreted as a
hidden mechanism for four elevation-zero character portraits.

## Frames, maximum export, and regeneration

Animation generation and frame extraction are separate stages:

1. AutoSprite generates one video for each animation entry.
2. It samples frames from that video and builds that animation's PNG sheet and
   JSON atlas.

The current REST endpoint accepts `frameCount` from 2–64 when first generating
an animation, with 25 as the default. Its documented regeneration endpoints
re-extract either all existing character sheets or one selected sheet from
their existing videos. REST regeneration accepts 4–64 frames and is free,
because it does not create new videos
([Spritesheets API](https://www.autosprite.io/docs/api-spritesheets),
[API Quick Start](https://www.autosprite.io/docs/api-quickstart)).

The live AutoSprite MCP tool schema exposed to Codex on 14 August 2026 is newer
and broader than that public REST page:

- `generate_spritesheet`: 2–64 extracted frames; `frameSize: 0` means native
  resolution;
- `regenerate_single_spritesheet`: 4–120 frames, with `maxFrames: 0` meaning
  all available video frames and `frameSize: 0` meaning native resolution;
- `regenerate_spritesheet`: the same 4–120/zero-for-all convention, applied as
  a batch to existing character animations.

This MCP-only `0 = all frames` behavior should be feature-detected rather than
assumed for the REST API, whose published request table still caps regeneration
at 64 and does not document zero. Both surfaces agree on the important
semantics: regeneration is a **free re-extraction from existing videos**. It
cannot improve motion, change a Facing, create a missing direction, or recover
temporal information that was not present in the original video
([MCP integration](https://www.autosprite.io/docs/mcp),
[Spritesheets API](https://www.autosprite.io/docs/api-spritesheets)).

“All frames” therefore means all extractable frames from **one existing
animation video**, or batch re-extraction across several existing videos. It
does not mean all animations or all directions are generated in one video or
one spritesheet.

## Billing and retries

Credits are consumed during video generation, not during export. The published
API currently charges by animation entry and sums the batch: for example, four
turbo animation entries report 20 credits, while a five-direction isometric
action reports 25 credits. Partial batch failures receive proportional refunds
([Spritesheets API](https://www.autosprite.io/docs/api-spritesheets),
[Credits](https://www.autosprite.io/docs/reference-credits)).

The two similarly named retry operations have different consequences:

- **Redo/regenerate the animation** creates a new AI video and sheet, so it
  consumes a plan redo or the selected tier's animation price.
- **Regenerate the spritesheet** keeps the video and only changes extraction
  settings such as frame count, size, compression, and background removal, so
  it is free.

The official endpoint reference makes this distinction explicitly
([Spritesheets API](https://www.autosprite.io/docs/api-spritesheets)).

## Documentation ambiguity

Some broad marketing/export pages say AutoSprite “automatically generates all
4 directions” or lets the user download “all 4 directions together”
([Introduction](https://www.autosprite.io/docs/introduction),
[Export Formats](https://www.autosprite.io/docs/reference-export-formats)).
Those statements do not match the more specific current generation contract:
the API enum has one mirrored sidescroller direction or five independently
billed isometric directions. The export page also recommends separate files per
animation. The defensible interpretation is that “all directions together”
describes UI/export packaging of results that already exist, not a free
all-direction generation primitive.

For automation and credit decisions, follow the current Spritesheets API and
live MCP schemas, not the broader marketing wording.

## Consequence for Michele v3

AutoSprite can batch four prepared, elevation-zero source workflows at the UI
or orchestration level, but it cannot natively treat them as one coherent
four-Facing animation. If the images were uploaded as separate characters,
each also needs its own API generation call. Every direction will have its own
video generation, charge, stochastic motion, sheet, and review decision. The
safest workflow is therefore:

1. validate one direction with one animation entry;
2. keep that prompt and extraction settings fixed;
3. run the remaining prepared directions as explicit separate entries;
4. inspect each generated video before accepting its frames;
5. use free spritesheet regeneration only to change sampling/export settings,
   never as a substitute for a bad motion redo.
