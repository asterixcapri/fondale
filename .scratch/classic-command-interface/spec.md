# Fondale 1.1 — Contextual Command interface

Status: ready-for-human

## Problem Statement

The persistent nine-Verb grid and 4×2 Inventory band consume too much of the
426×240 Logical Resolution. Although transparent, the controls still compete
with Scene art, force Authors to reserve the lower 60 logical pixels, and make
speech hard to read against three visually different Capri backgrounds.

The Command domain remains useful: Verb, Noun, Command Case, fallback, Player
Intent and Command State describe the adventure consistently. The problem is
their permanent presentation, not the logical model.

## Solution

Fondale presents Commands through an Engine-owned contextual overlay inspired
by the interaction rhythm of Return to Monkey Island. The Scene occupies the
entire Logical Resolution without a reserved HUD band. Hovering an active Noun
shows one complete primary Command phrase and, only when authored, one complete
secondary phrase. The phrases use mixed case, opaque dark backings, strong text
edges and a leader line; they remain clamped inside the frame.

Left mouse executes the primary Contextual Action. Right mouse executes the
secondary action only when the prompt shows one. A Noun's Preferred Verb is the
primary action at rest; `secondaryVerbs` declares the optional alternative.
Passages normally expose only their Preferred Verb, Walk To.

A small persistent bag in the lower-left opens Inventory. `I` performs the
same toggle. Inventory is a drawer over the Scene, closes through its close
button, click outside, `I`, or Escape, and retains eight paginated slots. An
Object click selects or deselects that Object and closes the drawer. With a
selected Object, the target's Selected Object Verb becomes primary, defaulting
to Use and optionally authored as Give through `objectVerbs`; the target's
normal Preferred Verb becomes secondary.

Speech and narration stay anchored to the world but gain a near-opaque backing,
border and strong text edge. They wrap to the HUD Theme maximum width and are
clamped to the full Logical Resolution rather than a safe area above a band.
Choices temporarily own world input and hide the Inventory trigger.

The Engine continues to own semantic structure, input, focus, Command
resolution and persistence. Game Projects provide Noun Definitions, Command
Lexicon, HUD Theme and local assets; they do not provide DOM, CSS or renderer
callbacks.

## Interaction contract

- Background, Walkable Regions, Hotspots, Approaches and Passages may use the
  entire Logical Resolution.
- Ground click walks; double-click requests Fast Walk.
- Hovering a Noun shows the full primary phrase and zero or one secondary
  phrase beside the pointer.
- Left click executes the advertised primary action.
- Right click executes the advertised secondary action and otherwise does
  nothing.
- A Noun declares one conditional Preferred Verb with a final fallback.
- A Noun may declare conditional Secondary Verbs and Selected Object Verbs;
  each declared set requires a final unconditional fallback.
- The contextual input is resolved by the core when processed, so selecting an
  Object and immediately clicking a target cannot observe stale renderer state.
- Give remains binary, Use remains unary or binary, and other Command Verbs
  remain unary.
- Specific Command Cases, local fallbacks and global response-only fallbacks
  retain their existing order and guarantees.
- Command State and the selected Object remain part of Game State and Save
  Snapshot; hover, prompt placement and drawer state remain transient.
- Tab reveals active Nouns and Passage directions while held.
- `.` or middle click advances a Line; keys 1–6 choose visible alternatives.
- F5 opens Options; Ctrl+S and Ctrl+L open Save and Load.
- Options retain text speed, speech visibility and audio volume when available.
  The obsolete HUD backing/opacity and Sentence Line preferences are removed.
- Help documents contextual mouse buttons, bag/`I`, Tab, Choices, Line advance,
  Options and Save/Load. QWE/ASD/ZXC Verb shortcuts are removed.

## Capri 1535 authoring

- People such as Raffaele, the Traveller and the Host prefer Talk To, expose
  Look At as a secondary action, and use Give when an Object is selected.
- Collectible Objects prefer Pick Up and may expose Look At secondarily.
- The winch prefers Look At and exposes Push secondarily.
- Scene Passages expose one Walk To phrase and their directional cursor.
- Selected puzzle Objects use Use against world targets unless the target
  explicitly declares Give.
- The original Capri font, palette, cursors and Inventory Appearances remain;
  the renderer applies them to the new prompt and drawer structure.

## Verification

- Public helper tests cover conditional Preferred, Secondary and Selected
  Object Verb definitions and immutable output.
- Core tests cover deterministic contextual resolution, including an Object
  selection queued immediately before a target action.
- Browser tests cover one/two-action prompts, absent secondary actions, left
  and right execution, bag and `I`, outside/Escape close, Object selection,
  Use/Give, pagination, Tab reveal, Passage direction, speech readability,
  Choices, Save/Load and Help.
- The packaged public consumer and Capri Example are built and tested against
  the vendored package, not only against Engine source.
- Visual review uses real screenshots at Support Baseline viewports and checks
  the Porto, Aiano and Boffe scene families before promotion.

## Out of scope

- A permanent Verb grid or lower reserved HUD band.
- Verb coin or radial menu.
- Automatic inference of Secondary or Selected Object Verbs from target type.
- Custom DOM, CSS, renderer callbacks or HUD plugins supplied by a Game Project.
- Touch, gamepad and keyboard-only world navigation.
