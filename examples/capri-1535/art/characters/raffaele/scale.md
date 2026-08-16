# Raffaele Runtime scale

The Runtime Asset is `96×288` RGBA with a Visual Anchor at `(48, 288)`.
The harbour uses the following representative scale table:

| Depth | Ground Point y | Perspective Scale | Displayed height | Enlargement |
| --- | ---: | ---: | ---: | ---: |
| Far | 410 | 0.70 | 202 px | 1.00× |
| Initial / middle | 535 | 1.00 | 288 px | 1.00× |
| Near | 645 | 1.00 | 288 px | 1.00× |

The Engine therefore either reduces the Runtime Asset or displays it at 1:1.
The actual-size Engine diagnostic is `engine-scale-check.png` in this directory.
