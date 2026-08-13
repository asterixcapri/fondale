# Harbour Boat rocking Animation

Created on 13 August 2026 from the accepted `harbour-boat.png` Runtime Asset.
The built-in `imagegen` edit established the six-pose motion reference, but its
redrawn output was rejected because it changed structural details and scale.
The production strip therefore derives all eight frames from the accepted
cutout with measured transforms around the waterline, preserving the artwork
exactly between frames.

## Contract

- eight aligned frames in one horizontal strip;
- each frame is 520×241 RGBA;
- cycle duration: 5.33 seconds at 1.5 frames per second;
- vertical displacement: at most 2 px;
- rotation: at most 0.3 degrees;
- Visual Anchor: `(260, 238)`;
- Scene position and Baseline remain `(480, 390)` and `390`;
- Background, Hotspot, Approach Point, Walkable Region, Perspective Scale,
  lighting, colour, and interaction remain unchanged.

The 3 px transparent padding prevents the reflection from clipping at either
extreme. The outward mooring-line endpoints move by less than the approved
ambient amplitude, so the boat remains visibly secured to the quay.

## Deliverables

- Art Master: `harbour-boat-rocking.png`, 4160×241 lossless RGBA;
- Runtime Asset: `src/scenes/harbour/harbour-boat-rocking.png`, 4160×241 RGBA.
