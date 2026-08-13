# Michele Runtime scale

Runtime cells are `192×288` RGBA with a Visual Anchor at `(96, 288)`. The
upright figure is approximately 276 pixels high inside the cell.

The currently reachable harbour Walkable Region uses this native-resolution
table:

| Depth | Ground Point y | Perspective Scale | Cell height | Displayed cell height | Displayed figure height | Enlargement |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Far | 410 | 0.70 | 288 px | 202 px | 193 px | 1.00× |
| Initial / middle | 535 | 1.00 | 288 px | 288 px | 276 px | 1.00× |
| Near | 645 | 1.00 | 288 px | 288 px | 276 px | 1.00× |

The Engine therefore reduces the Runtime Asset or displays it at 1:1. It never
enlarges it. The actual-size diagnostic is `engine-scale-check.png`.

At his initial Ground Point `(330, 625)`, Michele uses Perspective Scale 1 and
is displayed at native resolution. His visible height is slightly below the
288-pixel project reference Character cell while retaining the shared world
scale.
