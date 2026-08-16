# Michele V3 Runtime scale

The Capri 1535 Game Project uses a `1280×720` Logical Resolution and maps one
Runtime Asset pixel to one Scene Space unit. Michele's native Runtime cell is
`256×256`; the stable local Ground Point and Visual Anchor are both `(128, 252)`.
The approved idle figure is approximately 249 pixels high, with four pixels of
intentional transparent room below the anchor inside the cell.

The planned project depth bands are conservative scale gates for later Scene
packages. Individual Scene geometry may interpolate within them, but no
reachable Perspective Scale may exceed `1.00`.

| Depth band | Perspective Scale | Native cell | Displayed cell height | Displayed figure height | Enlargement factor |
| --- | ---: | ---: | ---: | ---: | ---: |
| Far | 0.58 | 256×256 px | 148.48 px | ≈144.42 px | 1.00× |
| Middle | 0.80 | 256×256 px | 204.80 px | ≈199.20 px | 1.00× |
| Near | 1.00 | 256×256 px | 256.00 px | ≈249.00 px | 1.00× |

The currently reachable harbour confirms both ends of the contract:

| Harbour Ground Point y | Perspective Scale | Displayed cell height | Displayed figure height | Enlargement factor |
| ---: | ---: | ---: | ---: | ---: |
| 410 | 0.70 | 179.20 px | ≈174.30 px | 1.00× |
| 535 | 1.00 | 256.00 px | ≈249.00 px | 1.00× |
| 645 | 1.00 | 256.00 px | ≈249.00 px | 1.00× |

At Michele's initial Ground Point `(330, 625)`, the harbour displays the
Runtime artwork at its native size. This table and `scale-sheet.svg` form the
canonical scale sheet; the SVG references the approved production PNG directly
and introduces no derived raster pixels. Actual-size browser captures for all
four Facings are produced by `test/michele.spec.ts`.
