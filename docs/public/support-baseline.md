# Support Baseline

Fondale 1.0 is verified against the latest stable Google Chrome desktop with
WebGL. A regression there is a Fondale bug.

- Mouse controls the world, Hotspots, Inventory, Lines, and Choices.
- The Engine-owned `Reveal hotspots` HUD control outlines every currently
  active Hotspot and never advertises an inactive or absent target.
- `Tab` and `Shift+Tab` traverse visible HUD controls; `Enter` or `Space`
  activates the focused control.
- `Enter` or `Space` advances a Line. A Choice takes focus automatically;
  arrow keys change its focused alternative and `Enter` or `Space` confirms it.
- `Escape` clears an Inventory selection outside a Sequence.
- Keyboard focus uses the browser indicator; Inventory selection also uses a
  double outline, check mark, and pressed-state label, not colour alone.
- A selected Object replaces the world pointer with its Inventory Appearance;
  failure preserves both the selection and this cursor, while success clears it.
- The logical frame is uniformly fitted and letterboxed. Pixel scaling uses
  the largest fitting integer factor, or a uniform nearest-neighbour reduction
  when the target is smaller than the Logical Resolution.

Version 1.0 makes no compatibility promise for old Chrome versions, other
browsers, touch, gamepads, keyboard-only world navigation, screen readers, or
general WCAG conformance. Those exclusions are boundaries, not claims that the
product cannot work in an unverified environment.
