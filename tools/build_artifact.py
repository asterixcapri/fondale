#!/usr/bin/env python3
"""Repackage the single-file build as a publishable page.

`npm run build` emits a complete HTML document. A published artifact is wrapped
in its own doctype/head/body skeleton, so what gets handed over has to be the
document's *contents* — its style and its script — not another document nested
inside the first.

Run after `npm run build`:
    tools/build_artifact.py
"""

import re
import sys
from pathlib import Path

BUILD = Path("dist/index.html")
OUT = Path("dist/artifact.html")

# The page is a frame around a game screen, so it commits to one visual world
# rather than following the viewer's theme: the dusk violet the paintings are
# lit by, and the warm stone the sun catches. Every colour is painted
# explicitly — a transparent body would borrow the host's ground and put a
# white margin around a nocturne.
CHROME = """
<style>
  :root {
    --dusk: #0b0a10;
    --stone: #c9a26b;
    --shadow: #6b6275;
  }
  html, body {
    margin: 0;
    height: 100%;
    background: var(--dusk);
    overflow: hidden;
  }
  canvas { display: block; image-rendering: pixelated; }

  .hint {
    position: fixed;
    left: 50%;
    bottom: 1.1rem;
    transform: translateX(-50%);
    display: flex;
    gap: 0.9rem;
    align-items: baseline;
    font: 400 0.72rem/1 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--shadow);
    pointer-events: none;
    animation: surface 900ms ease-out both;
  }
  .hint b { color: var(--stone); font-weight: 400; }

  @keyframes surface { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .hint { animation: none; } }
</style>

<div class="hint">
  <span>Capri, 1535 &mdash; vicolo</span>
  <span><b>D</b> mostra le aree</span>
</div>
"""


def main() -> int:
    if not BUILD.exists():
        print("manca dist/index.html — esegui prima `npm run build`", file=sys.stderr)
        return 1

    html = BUILD.read_text()

    style = re.search(r"<style>(.*?)</style>", html, re.S)
    script = re.search(r'<script type="module"[^>]*>(.*?)</script>', html, re.S)
    if not style or not script:
        print("build inattesa: style o script non trovati", file=sys.stderr)
        return 1

    OUT.write_text(
        f"<title>Capri 1535</title>\n"
        f"{CHROME}\n"
        f"<style>{style.group(1)}</style>\n"
        f'<script type="module">{script.group(1)}</script>\n'
    )
    print(f"{OUT}  ({OUT.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
