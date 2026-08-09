# Support Baseline

Fondale 1.1 is verified against the latest stable Google Chrome desktop with
WebGL. A regression there is a Fondale bug.

- The mouse controls world Nouns, Inventory, Lines, Choices, Options and Save/Load.
- Nine Verb controls remain visible in a stable 3×3 grid; QWE/ASD/ZXC select them.
- Left click walks or completes the selected Command; right click executes the
  Noun's Preferred Verb; Escape cancels an incomplete Command.
- Holding `Tab` reveals active Nouns and directional Scene Passages only.
- `.` or middle click advances a Line. Keys 1–6 choose a visible alternative.
- Inventory always exposes eight 4×2 slots; arrows and the wheel paginate it.
- F5 opens Options; Ctrl+S and Ctrl+L open named Save and Load slots.
- Keyboard focus uses the browser indicator; the selected first Noun also uses
  an outline, check mark, and pressed-state label, not colour alone.
- The logical frame is uniformly fitted and letterboxed. Pixel scaling uses
  the largest fitting integer factor, or a uniform nearest-neighbour reduction
  when the target is smaller than the Logical Resolution.

Version 1.1 makes no compatibility promise for old Chrome versions, other
browsers, touch, gamepads, keyboard-only world navigation, screen readers, or
general WCAG conformance. Those exclusions are boundaries, not claims that the
product cannot work in an unverified environment.
