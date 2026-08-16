# 04 — Build the fortification Scene package

**What to build:** Deliver the golden-hour coastal fortification as an
independently playable vertical Scene package. A small isolated Game Project
can place Michele at the landing, let him climb to the lookout and verify the
full Camera and Perspective Scale range before the boat sighting is integrated.

**Blocked by:** 01 — Lock the project scale and reference Michele.

**Status:** resolved

- [x] The fortification has an accepted portrait Composition Art Master, clean Background Art Master, Runtime Background and exact-size geometry diagnostic.
- [x] The Scene is `1280×1440` unless final blocking proves another exact height necessary while preserving genuine vertical travel.
- [x] Stairs and landings form one broad connected route whose apparent clearances fit Michele at every depth.
- [x] Perspective Scale makes Michele compatible with the painted architecture without Runtime enlargement.
- [x] Foreground architecture produces intentional occlusion without forcing invalid or corner-grazing navigation.
- [x] The lower landing and upper lookout provide valid entrances, approaches and Camera-safe focal areas.
- [x] The sea composition reserves the exact placement and motion corridor needed by the later arriving-boat Scenery.
- [x] Horizontal Camera drift is controlled while the vertical climb remains clearly observable.
- [x] An isolated browser fixture enters at the landing, reaches the lookout and exercises every Camera edge.
- [x] Actual-size visual inspection covers Michele at the lower, middle and upper depth bands.
- [x] The package builds without depending on the harbour, cloister or drifting-boat Scene packages.

## Comments

- 2026-08-17: Delivered the isolated `1280×1440` Scene package with accepted
  composition, clean Background, separated foreground Scenery, diagnostic
  geometry, broad connected navigation, Camera-safe entrances and a browser
  fixture covering every vertical band. The root build and browser verification
  pass on an isolated test port.
- 2026-08-17: Lifecycle finalized as `resolved` after the independent Standards
  and Spec reviews reported no remaining findings and the root browser suite
  passed `311/311`.
