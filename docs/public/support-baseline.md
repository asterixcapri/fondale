# Support Baseline

Fondale 0.2 alpha is verified against the latest stable Google Chrome desktop with
WebGL. A regression there is a Fondale bug.

- The mouse controls world Nouns, Inventory, Lines, Narrations, Command
  Responses, Choices, Options and Save/Load.
- Hover presents one primary Command phrase and, when authored, one secondary
  phrase in a readable pointer-following callout.
- Left click executes the primary action; right click executes the visible
  secondary action and otherwise does nothing.
- Holding `Tab` reveals active Nouns and directional Scene Passages only.
- `.` or middle click advances a Line or Narration and dismisses a Command
  Response. Keys 1–6 choose a visible alternative.
- A persistent bag or `I` opens the Inventory drawer. It exposes eight slots;
  arrows and the wheel paginate it, while Escape and outside click close it.
- F5 opens Options; Ctrl+S and Ctrl+L open named Save and Load slots.
- Keyboard focus uses the browser indicator; the selected first Noun also uses
  an outline, check mark, and pressed-state label, not colour alone.
- Character speech uses a strong text edge above its speaker. Narration uses a
  backed lower lane. Both stay inside the Logical Resolution. Speech follows
  its projected Character while narration remains fixed in the viewport.
- Oversized Scenes follow the Player Character horizontally and vertically,
  clamp at Scene edges, draw the translated world on whole logical pixels, and
  project mouse actions and revealed world geometry through the same Camera.
  Inventory, Choices, Command Responses, Narrations, Options, Help, Save and
  Load remain fixed in the Logical Resolution.
- The logical frame is uniformly fitted and letterboxed. Pixel scaling uses
  the largest fitting integer factor, or a uniform nearest-neighbour reduction
  when the target is smaller than the Logical Resolution.

Alpha versions make no compatibility promise for earlier internal Game Project
authoring contracts, old Chrome versions, other
browsers, touch, gamepads, keyboard-only world navigation, screen readers, or
general WCAG conformance. Those exclusions are boundaries, not claims that the
product cannot work in an unverified environment.
