# Point-and-Click Adventure Engines — 2026 Landscape

Research date: **2026-08-07**

**Target project:** 2D LucasArts-style point-and-click. 320x200 logical resolution, nearest-neighbour
integer upscale, hand-painted (AI-generated, downscaled to 64-colour VGA) static backgrounds, animated
sprites, walkable areas + pathfinding, depth scaling 55%–100%, walk-behind masks, hotspots, inventory,
dialogue trees. 20–40 scenes. Solo dev / very small team.

**Critical constraint (added mid-research):** the bulk of the code will be written by an **LLM coding
agent (Claude Code) running in a Linux container**. The human is a PHP/JS web developer who directs,
reviews and reads diffs but will not hand-write most of the implementation. This makes
*agent-authorability* — plain-text project artifacts, Linux tooling, headless verification, corpus size
of the scripting language — as important as genre feature coverage.

---

## ⚠️ Research limitations — read this first

The research environment's egress policy **blocked most vendor websites**. I could reach
`github.com` (HTML) and the web-search index, but the following were blocked outright:

`visionaire-studio.net`, `wiki.visionaire-tracker.net`, `visionairestudio.itch.io`,
`store.steampowered.com`, `adventuregamestudio.co.uk`, `adventuregamestudio.github.io` (the AGS manual),
`adventurecreator.org`, `docs.escoria-framework.org`, `carenalgas.github.io` (Popochiu docs),
`godotengine.org`, `docs.godotengine.org`, `phaser.io`, `pixijs.com`, `excaliburjs.com`,
`assetstore.unity.com`, `unity.com`, `en.wikipedia.org`, `dead-code.org`, `moddb.com`.

Consequences, stated honestly:

- Facts sourced from **GitHub pages I fetched directly** are high-confidence.
- Facts sourced from **search-engine summaries of blocked pages** are medium-confidence. I mark these
  as such and give the URL so the developer can verify in a browser.
- **Visionaire pricing is genuinely unresolved.** Three different sources gave three different numbers
  (see the Visionaire section). The Visionaire wiki itself states that wiki prices and shop prices
  disagree and that the shop is authoritative — and I could not reach the shop. **Do not act on the
  pricing in this document without checking the shop.**
- Anything I could not verify at all is written as "could not verify", never guessed.

---

## Summary table

### Genre fit and viability

| Engine | Maintained (2026) | Scripting | Genre features OOTB | 320x200 + NN | Visual editor | Desktop / Web / Mobile | Cost & royalties |
|---|---|---|---|---|---|---|---|
| **AGS 3.6 / 4.0α** | ✅ Very active (3.6.2.21, 2026-08-01) | AGS Script (C-like) | ★★★★★ everything, purpose-built | ✅ Native, it *is* the target | ✅ Best-in-class room editor | ✅ / ⚠️ Emscripten port / ⚠️ Android, iOS | Free, Artistic 2.0, no royalties |
| **Visionaire Studio** | ✅ Active (5.3.x; Steam release 2026-07-04) | Lua 5.4 + visual actions | ★★★★★ purpose-built | ✅ 320x200 is the floor; "pixel effect" = NN | ✅ Strong | ✅ / ⚠️ HTML5 (feature-reduced) / ✅ | ⚠️ Paid, price unverified (see below) |
| **Godot + Popochiu** | ✅ Active (2.1.1, 2026-05-23; Godot 4.6) | GDScript | ★★★★ most of it | ✅ Fully configurable | ✅ In-editor gizmos | ✅ / ✅ WebGL2 / ✅ | Free, MIT, no royalties |
| **Godot + Escoria** | ⚠️ **Stagnant** — core last commit 2025-04-12 | GDScript + ASHES DSL | ★★★★ (on paper) | ✅ | ✅ | ✅ / ✅ / ✅ | Free, MIT |
| **Plain Godot** | ✅ Very active (4.6.3, 2026-05-20) | GDScript / C# | ★☆ you build it | ✅ | Generic scene editor | ✅ / ✅ / ✅ | Free, MIT, no royalties |
| **Unity + Adventure Creator** | ✅ Active (1.86.0, 2026-03-02) | C# / visual ActionLists | ★★★★★ | ✅ (Unity pixel-perfect) | ✅ Strong | ✅ / ⚠️ WebGL / ✅ | $80 asset + Unity terms |
| **Unity + PowerQuest** | ✅ Active (v0.20, 2026-01-30) | C# | ★★★★★ AGS-like | ✅ Designed for it | ✅ | ✅ / ⚠️ / ⚠️ | Name-your-price (free) + Unity terms |
| **Wintermute / WME Lite** | ❌ **Abandoned** (1.9.1 in 2010) | WME Script | ★★★★ | ✅ | ✅ | ⚠️ legacy | Free |
| **SLUDGE** | ❌ **Dormant** (2.2.2 in 2018; last commit 2023-07-20) | SLUDGE DSL | ★★★★ | ✅ | ⚠️ dated | ⚠️ legacy | LGPL 2.1 |
| **JS: Phaser 4 / PixiJS 8** | ✅ Very active | TS/JS | ☆ **nothing** — you build all of it | ✅ Trivially | ❌ you build it | ⚠️ via Electron / ✅ native / ⚠️ | Free, MIT |
| **JS: JSGAM** | ❌ **Abandoned** (last commit 2021-05-02) | JS + JSON | ★★★ | ✅ | ❌ | ✅ web | MIT |
| **GDevelop** | ✅ Active | Visual events + JS | ★★ generic (has pathfinding) | ✅ | ✅ | ✅ / ✅ / ✅ | Free, MIT runtime |

### Agent-authorability (the new axis)

| Engine | Project format = plain text? | Language corpus mass for an LLM | Headless build/test on CLI | Linux toolchain | Docs / how well-known |
|---|---|---|---|---|---|
| **AGS 4.0α** | ⚠️ **Mixed — much better than AGS 3.** Rooms are `Rooms/N/` folders with **PNG background + indexed-palette PNG masks** + `.asc` script; `.crm` generated at compile time. `Game.agf` is XML. | ⚠️ Low. AGS Script is C-like but a tiny corpus. | ✅ `AGSEditor.exe /compile`, exit code 0/non-zero | ❌ **Editor is Windows-only** (.NET/WinForms); Wine only | ⚠️ Good manual, small corpus |
| **AGS 3.6 (stable)** | ❌ **`.crm` rooms are binary.** Hard gate. | ⚠️ Low | ✅ `/compile` | ❌ Windows-only editor | ⚠️ |
| **Visionaire** | ⚠️ `.ved` is **XML** (`.veb` is the binary variant) — but a single monolithic table-structured file, GUI-authored | ✅ Lua is high-corpus | ❓ could not verify a headless CLI build | ✅ Linux editor exists (since 2020) | ⚠️ Wiki + forum; closed source |
| **Godot + Popochiu** | ✅ **`.tscn` / `.tres` / `.gd` are all text**, diffable, "100% pure Godot resources, no lock-in" | ⚠️ GDScript is medium corpus (Python-ish, LLMs do it reasonably) | ✅ `godot --headless`, GUT → JUnit XML | ✅ Fully native Linux | ✅ Godot docs excellent; Popochiu docs decent, plugin less known |
| **Plain Godot** | ✅ Same | ⚠️ Medium (GDScript) / ✅ high (C#, but no web export) | ✅ Same | ✅ | ✅ Excellent |
| **Unity + AC / PowerQuest** | ⚠️ YAML **but** dominated by opaque `fileID`/`guid` refs; "a text merge can succeed mechanically and still fail semantically" | ✅ C# is very high corpus | ✅ `-batchmode -nographics` | ⚠️ Linux editor exists but is the least-tested target | ✅ Huge corpus |
| **JS (Phaser/Pixi + own code)** | ✅ **100% text.** Rooms/hotspots/dialogue = JSON/TS you design | ✅ **Highest corpus of any option, by a wide margin** | ✅ `npm test`, vitest, Playwright screenshots | ✅ Native | ✅ Enormous |
| **GDevelop** | ✅ Project is JSON | ✅ JS extensions | ⚠️ partial CLI | ✅ | ✅ |

---

## Adventure Game Studio (AGS)

**Status: very actively developed. The strongest genre feature set of anything here.**

- Latest stable **3.6.2.21, released 2026-08-01**; release candidate 3.6.3.12 on 2026-07-09;
  AGS 4 alpha **4.0.0.29 (Alpha 33), 2026-06-23**. Verified directly from the releases page.
  Source: <https://github.com/adventuregamestudio/ags/releases>
- **AGS 4 is still alpha as of August 2026** — no stable release. Shipping a commercial title on an
  alpha branch is a real risk, and this matters because AGS 4 is the version with the agent-friendly
  room format (below).

**Scripting.** AGS Script, a C-family language. "If you have experience with C/C++, Java, or C#, then
learning the AGS scripting syntax will be a piece of cake." For a JS developer the *syntax* is easy —
braces, semicolons, `if`/`while`, dot access. The friction is that it is statically typed, has no
closures/first-class functions in the JS sense, and has an engine-specific object model.
Source: <https://ensadi.github.io/AGSBook/part1/chapter0/about.html>

**Genre features — this is what AGS exists for.** Everything on the requirement list is native:

- Walkable areas, hotspots, walk-behind areas and regions, all painted as **bitmap masks** in the room
  editor, or imported from external BMP/PNG.
- **Character scaling tied to walkable areas**: each walkable area carries a zoom level, adjustable
  **10%–200%**, with continuous scaling supported across an area. The 55%–100% requirement is a
  first-class, one-field feature.
- Walk-behinds give true depth sorting against the background.
- Verb-coin / 9-verb / contextual GUIs, inventory, dialogue trees, save/load, translations — all built in.
- Supported resolutions explicitly include **320x200**. It is the engine's native heritage; a 320x200
  LucasArts game is the single best-supported thing AGS can do.

Source: <https://adventuregamestudio.github.io/ags-manual/AdvancedRoomFeatures.html> (page blocked to me;
content via search index — medium confidence, but corroborated across several results)

**Export targets.** From the repo README (high confidence): engine supports **Android, iOS, Linux,
macOS, Windows and Emscripten (web)**. Desktop is first-class. The Emscripten/web port is real and
maintained (it benefited from the 3.6.0 SDL backend migration) but is a build-it-yourself target rather
than a one-click export. Android has an official "AGS Player" runtime. iOS is the least-trodden path.
Source: <https://github.com/adventuregamestudio/ags/blob/master/README.md>

**Licensing / commercial.** Editor and engine are **Artistic License 2.0**. Free, no royalties, no
subscription; commercial games are explicitly fine.

**Verified commercial titles.** Wadjet Eye Games is the flagship user: **Unavowed** (2018),
**Technobabylon**, **Old Skies** (2025, PC/Mac/Linux on Steam and GOG). **Rosewater** (Grundislav Games,
2025-03-27). **Beyond Shadowgate** (2024). These are well-documented AGS titles.
Sources: <https://en.wikipedia.org/wiki/Unavowed>, <https://en.wikipedia.org/wiki/Rosewater_(video_game)>,
<https://en.wikipedia.org/wiki/Category:Adventure_Game_Studio_games>

**Editor.** Outstanding for this genre — you paint walkable areas and walk-behinds with line/freehand/
rectangle/fill tools directly over the background, place hotspots, set per-area scaling. Nothing else
here is faster for a *human* iterating on room geometry.

### AGS under the agent constraint — the decisive detail

Two facts pull in opposite directions.

**Against:** the **AGS Editor is Windows-only**, a .NET/WinForms application. Linux/macOS use is via
Wine. An agent in a Linux container would need Wine to run `AGSEditor.exe /compile`. This is the single
biggest practical obstacle.
Source: <https://github.com/adventuregamestudio/ags/blob/master/README.md>

**For:** AGS **does** have a headless build path — `AGSEditor.exe /compile <project>/Game.agf` loads,
compiles and exits, printing to console with exit code 0 on success and non-zero on failure,
"explicitly intended for CI pipelines."
Source: <https://adventuregamestudio.github.io/ags-manual/EditorCommandLineOptions.html> (via search index)

**And, importantly:** AGS 3's `.crm` room files are **binary** — an absolute blocker for agent
authoring. But **AGS 4 changed this**. In AGS 4's "open room format":

- All room files live in **`Rooms/N/` folders**; `.crm` is **generated at compile time only**.
- Backgrounds and masks are **PNG files placed directly in `Rooms/n/`**.
- Mask images use a **16-colour (4-bit) or 256-colour (8-bit) indexed palette, where colour 0 is
  transparency and colours 1–15 are the respective hotspot / walk-behind / walkable-area numbers.**
- Room scripts are plain `.asc` text. `Game.agf` is XML (auto-generated; it warns that manual edits can
  break the game).

Sources: <https://github.com/adventuregamestudio/ags/issues/2071> (fetched directly — confirms background
and mask PNGs sit in room folders and are git-tracked),
<https://github.com/adventuregamestudio/ags/issues/1624>, <https://github.com/adventuregamestudio/ags/issues/2562>,
<https://www.adventuregamestudio.co.uk/wiki/Source_Control> (via search index)

This is a big deal: an agent could **generate walkable-area and hotspot masks programmatically** as
indexed PNGs (colour index = area number) with a few lines of Python/Pillow, and write room scripts as
text. That converts the "you must click in a GUI" gate into a solvable problem.

**What I could not verify:** the exact name and schema of the per-room metadata file in `Rooms/N/`
(whether there is a `Room.xml` and what it contains — hotspot names, walkable-area zoom levels, object
placements). GitHub code search required a login. **This needs a 10-minute check before betting on the
approach**, because per-area scaling values and hotspot metadata must live somewhere text-editable for
the agent story to hold.

**Net:** AGS 4 alpha is *potentially* very agent-workable, gated on (a) Wine in the container,
(b) alpha stability, (c) verifying the room metadata format.

---

## Visionaire Studio

**Status: active. Purpose-built. Pricing genuinely unclear from here.**

- Version 5.3.x line; **5.3.3 (build 1244)** is the most recent update I saw referenced. A major update
  adding **SDL3 and Apple Silicon support** was reported around November 2025 (one search result said
  2025, another said 2024 — I could not resolve this).
- **Released on Steam on 2026-07-04** as a distributed product, which is a strong signal of active
  commercial life. Source: <https://store.steampowered.com/app/4367370/Visionaire_Studio/> (blocked;
  via search index — medium confidence)

**Scripting.** **Lua 5.4** for advanced work, on top of a visual "action parts" system that covers most
game logic without code. Lua is an easy step from JS (dynamic, first-class functions; the differences
are 1-based indexing, `nil`, tables-for-everything, `..` for concat). For an LLM, Lua is a **high-corpus
language** — this is a real advantage over AGS Script or ASHES.
Source: <https://wiki.visionaire-tracker.net/wiki/Scripting> (blocked; via search index)

**Genre features.** Complete: scenes, walkable ways, hotspots/objects, character scaling, inventory,
dialogue trees, save/load, localization. Built by and for adventure studios.

**Pixel art / 320x200.** Excellent and explicit: **"the smallest resolution you can set in Visionaire
Studio is 320x200"**, and there is a **"pixel effect" option that uses nearest-neighbour interpolation**,
plus separate nearest-neighbour magnification/minification filter settings. This is exactly the
requirement. Source: <https://wiki.visionaire-tracker.net/wiki/Game_Properties> and the Visionaire forum
thread "Pixel art adventure games" (both blocked; via search index — medium confidence, but the two
sources agree)

**Export targets.** Windows, macOS, Linux, iOS, Android, HTML5, and consoles (PlayStation, Xbox, Switch)
with the appropriate licence. Caveat stated by the vendor's own wiki: **"HTML5 has the least features.
There is no support for videos, audio containers/effects, 3d characters."** Desktop is the first-class
target.

**Licensing — UNRESOLVED, verify before relying on this.** Three mutually inconsistent figures appeared:

| Source | Claim |
|---|---|
| Search summary of the shop/itch pages | Free version limited to **25 scenes**, non-commercial only; "Indie Basic License €70–80" |
| Search summary of the licensing wiki | Commercial Basic **€300** first platform + **€150** per extra platform; Commercial Pro **€1000** + **€250** per extra platform |
| Another search summary | A **€75** engine licence giving unlimited development use |

The wiki page itself reportedly notes that **wiki prices and shop prices differ and the shop is
authoritative**. I could not reach <https://www.visionaire-studio.net/shop>. What is consistently
reported across all sources: **one-time purchase, no revenue share, no subscription**, and licences are
**per-platform**.

**Two things that matter for this project:** (1) the free tier's **25-scene cap is below the 20–40 scene
target**, so a paid licence is effectively required; (2) if the per-platform model is real, "Windows +
Mac + Linux" is three licences, not one.

**Verified commercial titles.** Daedalic Entertainment shipped **10+ games** on Visionaire: the
**Deponia** series, **The Whispered World**, **A New Beginning**, **Edna & Harvey: The Breakout** (2008)
and **Edna & Harvey: Harvey's New Eyes**, **Chains of Satinav**, **Memoria**, **The Night of the Rabbit**.
This is the most commercially proven engine in this list for full-price adventure games.
Source: <https://en.wikipedia.org/wiki/Edna_%26_Harvey:_The_Breakout>, Visionaire wiki intro page

**Editor.** Strong, purpose-built, GUI-first, with polygon tools for walkable areas. A Linux build has
existed since 2020. Source: <https://www.gamingonlinux.com/2020/01/adventure-game-creator-visionaire-studio-is-coming-to-linux/>

### Visionaire under the agent constraint

The project format is **`.ved`, which is XML** (with `.veb` as an optional smaller binary form), holding
"different tables (storing different types of objects)". So it is *nominally* text.

In practice this is a weak "yes": it is a single monolithic machine-generated XML document with an
internal table/ID structure, entirely authored by the GUI, with no documented external schema and no
stated support for hand-editing. An agent could probably learn to patch it, but every edit risks
corrupting a proprietary file whose invariants are undocumented, and there is no source to read.
Combined with the fact that the engine is **closed-source** (the agent cannot read the implementation
when the docs are thin) and that I **could not verify any headless/CLI build path**, this is a poor fit
for LLM-driven development despite being an excellent fit for a human.
Source: <https://wiki.visionaire-tracker.net/wiki/Data_Structure> (blocked; via search index)

---

## Godot

### Plain Godot

- **4.6.3 stable, released 2026-05-20.** MIT licence, zero royalties. The most actively developed
  general-purpose engine here.
- **Pixel art at 320x200 is fully supported and well-documented**: set the project viewport to 320x200,
  stretch mode **`canvas_items`**, scaling mode **`integer`**, and default texture filter **Nearest**.
  That is exactly integer nearest-neighbour upscaling of a low logical resolution.
  Sources: <https://www.gdquest.com/library/pixel_art_setup_godot4/>, <https://itch.io/blog/806788/godot-44-settings-for-pixel-art>
- **Export**: Windows/macOS/Linux desktop all first-class; **web (HTML5/wasm) built in** but
  Compatibility renderer / WebGL 2.0 only, and threaded builds need COOP/COEP headers; Android/iOS
  supported. Note **C# cannot target web** — if web matters, GDScript is the only option.
  Source: <https://www.strayspark.studio/blog/godot-46-export-web-android-ios-guide>
- **Genre features out of the box: essentially none.** Godot gives you `NavigationPolygon` (so
  polygon pathfinding is free), `YSort`/`y_sort_enabled` for depth sorting, `Area2D` for hotspots. It
  does **not** give you verb UI, inventory, dialogue trees, per-area character scaling, save/load of
  adventure state, or a room model. Plain Godot is "build it yourself in GDScript" — which is most of
  the JS-option work, in a lower-corpus language.

### Godot + Popochiu ✅

**This is the live Godot option in 2026.**

- **Popochiu 2.1.1 released 2026-05-23**; 2.1.0 on **2026-03-16** after 13 months of work, with 46+
  improvements. **Requires Godot 4.6.** MIT licence, 341 stars.
  Sources: <https://github.com/carenalgas/popochiu>, <https://github.com/carenalgas/popochiu/releases>,
  <https://carenalga.itch.io/popochiu/devlog/1459411/popochiu-210>
- Explicitly "inspired by Adventure Game Studio and PowerQuest".
- **Features:** rooms with props, hotspots, **multiple walkable areas**, regions and position markers;
  character management with dialogue emotions; **region-based character scaling** (2.1.0 notes
  "region-based character scaling now works consistently regardless of movement direction" — so the
  55%–100% depth scaling requirement is covered); inventory; dialogue trees; save/load; room
  transitions; audio management; **command-based GUI framework with multiple out-of-the-box interfaces**;
  Aseprite import; **"seamless support for retro-style, pixel-art, and high-resolution 2D games"**.
- **Editor:** yes — a dedicated dock with **custom gizmos for visual creation**, in-viewport polygon
  editing, auto-tracing of collision polygons, and dialogue-tree management.
- **Gaps I could not confirm:** explicit walk-behind/depth-sorting documentation (Godot's `y_sort` covers
  the mechanism, but I could not verify Popochiu wraps it), and localization support. The docs site was
  blocked.
- **Commercial track record: weak.** I could **not verify a single commercially released Steam title
  built with Popochiu.** The first game made with it was *Pato & Lobo*, an Adventure Jam 2021 entry on
  itch.io. Several jam/hobby games exist. This is the main risk: a young plugin with one primary
  maintainer and no shipped commercial proof.

**Under the agent constraint, Popochiu scores very well:**

- **`.tscn`, `.tres` and `.gd` are all plain text** and "mostly human-readable and easy for version
  control systems to manage". Popochiu advertises **"100% pure Godot code and resources, with no
  lock-in"** — so rooms, walkable polygons (as `Polygon2D`/`NavigationRegion2D` point arrays), hotspots
  and dialogue are text an agent can write and diff.
  Source: <https://docs.godotengine.org/en/stable/engine_details/file_formats/tscn.html>
- **Headless everything on Linux**: `godot --headless -e --quit` to import, `godot --headless
  --export-release <preset>` to build, and **GUT** for unit tests via
  `godot --headless -d -s addons/gut/gut_cmdln.gd -gdir=res://test -gjunit_xml_file=... -gexit`,
  producing **JUnit XML**. That is a genuine agent feedback loop.
  Source: <https://gut.readthedocs.io/en/latest/Command-Line.html>
- **Fully native Linux toolchain**, no Wine.
- **Language corpus: the weak spot.** GDScript is Python-shaped and LLMs handle it acceptably, but the
  corpus is far smaller than JS/TS or C#, and **Popochiu's own API is niche** — the agent will need to
  read the plugin source (which, being MIT and local, it can).

### Godot + Escoria ⚠️ — flag as stagnant

- The Godot 4 port replaced the old ESCscript DSL with a new **ASHES** language.
- **Latest release is `v4.0.0-alpha.34`, dated 2025-02-26 — still alpha, no stable release.**
- **`escoria-core`'s most recent commit is 2025-04-12** ("docs: Added README and license"), verified by
  fetching the commit history directly. The satellite repos are older still: `escoria-game-template`
  2025-04-12, `escoria-ui-simplemouse` 2025-04-01, `escoria-dialog-simple` 2025-03-21.
  Source: <https://github.com/godot-escoria/escoria-core/commits/main>, <https://github.com/godot-escoria>
- Only the **docs and demo-game repos** show 2026 activity (both 2026-08-07). The **core framework has
  been untouched for ~16 months.** 125 stars.

**Assessment: do not start a new project on Escoria in 2026.** It is a permanent alpha whose core has
stalled while Popochiu — same niche, same engine, MIT — shipped two releases in 2026. If you want
adventure machinery on Godot, use Popochiu.

---

## Unity

### Unity licensing baseline (2026)

The **Runtime Fee was cancelled** outright in September 2024. **Unity Personal is free** with the
revenue/funding ceiling raised from $100k to **$200k**, and the "Made with Unity" splash screen is
optional from Unity 6. Above $200k you need **Unity Pro at ~$2,200/seat/year**; Enterprise above $25M.
For a solo dev this is effectively free.
Sources: <https://unity.com/blog/unity-is-canceling-the-runtime-fee>, <https://unity.com/products/pricing-updates>

### Adventure Creator

- **Version 1.86.0, released 2026-03-02.** Actively maintained; supports Unity 2018.4.36+.
- **$80** one-time on the Unity Asset Store.
- Full genre coverage: 2D and 3D, point-and-click, pathfinding, hotspots, inventory, dialogue trees
  with a visual conversation editor, save/load, localization, and a visual **ActionList** system that
  lets you build logic without code, dropping to C# when needed.
- **Verified commercial titles:** **Harold Halibut**, **Little Misfortune**, **Sally Face**,
  **Yes, Your Grace**, **Colossal Cave**. This is a strong, genuinely shipped track record.
  Source: <https://assetstore.unity.com/packages/tools/game-toolkits/adventure-creator-11896> (blocked;
  via search index — medium confidence on the game list)
- Editor: strong custom inspectors and scene-view tools.

### PowerQuest

- **v0.20 "Drift 'em up", released 2026-01-30**, described as another year of updates plus the fixes
  required to ship *The Drifter*. **Name-your-own-price (free)** from Powerhoof on itch.io.
- Explicitly designed to be **AGS-like**: "the fast workflow and ease-of-use of tools like
  AGS/Visionaire, along with the power and flexibility of Unity", for "world-class 2D sprite-based
  point-and-click adventure games". Scripts save to **native Unity C#**.
- **Verified commercial title: The Drifter** (Powerhoof, released **2025-07-17**, Windows/macOS/Linux) —
  built with PowerQuest, by the tool's own authors. Reported "over 80 PowerQuest games released".
  Sources: <https://powerhoof.itch.io/powerquest/devlog/1335713/powerquest-v020-drift-em-up>,
  <https://en.wikipedia.org/wiki/The_Drifter_(video_game)>
- Of the two Unity options, **PowerQuest is the closer match to a 320x200 LucasArts VGA game** — it is
  sprite-and-pixel-art-first, whereas Adventure Creator is a broader 2D/3D adventure toolkit.
- Note: I fetched `github.com/powerhoof/PowerQuest` and got a **404** — distribution appears to be via
  itch.io, not a public GitHub repo. I could not verify its licence text.

### Unity under the agent constraint

- **Scene and prefab files are YAML — text, but the wrong kind of text.** They are dominated by
  `fileID` and `guid` references which "are not meaningful at a glance, exposing low-level identifiers
  at exactly the point where humans need high-level context", and "a text merge can succeed mechanically
  and still fail semantically." An agent editing Unity scenes by hand is writing GUID soup with no
  type checking and a real chance of silently breaking object references.
  Sources: <https://docs.unity3d.com/6000.6/Documentation/Manual/yaml-prefab-serialization.html>,
  <https://7wolves.org/articles/why-unity-scene-merges-are-so-hard/>
- Mitigation: the agent can write **C# editor scripts** that build scenes programmatically via the
  Unity API rather than editing YAML — a legitimate and much safer pattern, but it is an extra layer of
  indirection and requires `-batchmode -nographics` round-trips to see any result.
- **C# has excellent LLM corpus mass** — the best of any engine-native language here.
- Unity has a Linux editor and `-batchmode -nographics` headless builds, but Linux is Unity's
  least-exercised editor platform, and the install is tens of gigabytes.

---

## Wintermute / WME Lite ❌

**Abandoned. Do not use for a new 2026 project.**

- **Wintermute Engine 1.9.1 was the last stable release, dated 2010-01-01.** A beta 1.10.1 followed on
  2012-07-19. Nothing since.
- **WME Lite** (the cross-platform C++ runtime, MIT, on Bitbucket since 2013) is the only part with any
  later life; one listing showed a 0.0.12 build dated 2024-04-22, which I could not corroborate from a
  primary source. `dead-code.org` was blocked.
- The forum shows some life (a post dated 2026-05-21), so the community is not literally dead, but the
  **engine has had no stable release in 16 years**.
- Historical note: Wintermute games are supported by **ScummVM**, which is the main reason old WME
  titles still run.
- Genre features were good for their era and 320x200 is fine, but the toolchain is Windows-era legacy,
  there is no modern export story (no meaningful web/mobile), and an LLM agent has almost no corpus for
  WME Script.

Sources: <https://en.wikipedia.org/wiki/Wintermute_Engine> (blocked; via search index),
<https://handwiki.org/wiki/Software:Wintermute_Engine>

---

## SLUDGE ❌

**Dormant. Do not use for a new 2026 project.**

Verified directly from GitHub:

- **Last release: SLUDGE 2.2.2, 2018-09-18.**
- **Last commit on `master`: 2023-07-20** ("Fix alpha blending of characters during freeze"). Before
  that, 2022-01-14, then 2019-04-10 — i.e. three commits in seven years.
- 78 stars, 7 open issues, 661 commits total. LGPL 2.1 (GTK Dev Kit is GPL 3+).
- Windows/Mac/GTK-Linux. Sebastian Krzyszkowiak (dos1) joined to help maintain it, with "vague plans" of
  future builds.

Sources: <https://github.com/opensludge/opensludge>, <https://github.com/opensludge/opensludge/releases>,
<https://github.com/opensludge/opensludge/commits/master>

The genre feature set was solid (it powered *Out Of Order*), but a five-year-stale engine with a
bespoke DSL and near-zero LLM corpus is not a rational 2026 choice.

---

## JavaScript / web-native options

### The honest headline

**There is no mature, maintained, open-source JavaScript point-and-click adventure framework in 2026.**
I searched specifically for this. What exists:

| Project | Built on | Stars | Status |
|---|---|---|---|
| **JSGAM** (`kreezii/jsgam`) | PixiJS + GSAP + Howler + PolyK + Walkable | 82 | ❌ **Last commit on `master`: 2021-05-02.** Abandoned. |
| **phaser-pnc** (`lewiji/phaser-pnc`) | Phaser 3 | 20 | ❌ 44 commits, no recent activity. Abandoned. |
| **caper** (`gandazgul/caper`) | Phaser 3 | **2** | ⚠️ Updated 2026-06-14 but a 2-star personal project |
| **ALPACA** (`pinguin999/ALPACA`) | C++/JNGL, Lua scripts, **JSON scenes** | 93 | ✅ Updated 2026-07-21 — but it's C++, not JS |

Sources: <https://github.com/kreezii/jsgam/commits/master>, <https://github.com/lewiji/phaser-pnc>,
<https://github.com/topics/point-and-click?o=desc&s=updated>, <https://github.com/pinguin999/ALPACA>

JSGAM is the closest thing to a real one — MIT, PixiJS-based, **games defined in JSON**, with walkable
areas and pathfinding — and it is exactly the architecture this project would want. It has simply been
dead for five years. It is worth reading as a **reference design**, not adopting.

So the JS route means **building the genre machinery yourself**. The rendering foundations are excellent
and very much alive:

- **Phaser 4.1.0, released 2026-04-30** — stable, complete WebGL renderer rewrite.
  Source: <https://gamefromscratch.com/phaser-4-released/>
- **PixiJS v8.17**, on a **monthly release cadence** since v8.10. Source: <https://pixijs.com/blog>
- **Excalibur.js 0.32.0** — active, TypeScript-first, but still pre-1.0.

### How big is "build it yourself", concretely?

Not hand-waved. Module by module, for the requirement list, assuming TypeScript on PixiJS (or Phaser):

| Module | What's involved | Rough size |
|---|---|---|
| Room/scene model + loader | JSON schema for rooms: background, layers, hotspots, exits, walkable polys, scaling bands | 200–400 LOC |
| Walkable-area pathfinding | Concave polygon → convex decomposition (`poly-decomp`), then A* over the navmesh with **`navmesh`** (npm, mikewesthad, v2.3.1) or funnel/string-pull for straight paths | 200–400 LOC glue; the algorithm itself is a dependency |
| Character controller | Follow path, 4/8-direction sprite selection, walk/idle/talk state machine, turn-to-face | 400–700 LOC |
| **Depth scaling 55–100%** | Linear interpolation of scale from `y` within a band; trivial once the room model exists | **~50 LOC** |
| **Walk-behind / depth sorting** | Modern approach: foreground cutout sprites each with a baseline `y`, sorted with `sortableChildren`/`zIndex` alongside characters. (AGS's mask approach is also reproducible by reading an indexed PNG.) | 100–250 LOC |
| Hotspot hit-testing | Either polygon point-in-poly, or per-pixel lookup from an indexed hotspot mask PNG via an offscreen canvas `ImageData` | 150–300 LOC |
| Verb UI / contextual cursor | Verb bar or verb coin, cursor states, hover text, hotspot highlighting | 300–600 LOC |
| Inventory | Model, UI grid, drag/click-combine, use-item-on-hotspot | 300–500 LOC |
| Dialogue trees | Best not hand-rolled: use **inkjs** (Ink) or a Yarn Spinner JS runtime, plus your own UI + wiring | 200–400 LOC glue |
| **Cutscene/sequence runtime** | The genuinely underestimated one: async/await or generator-based sequencing so `await bob.say(...)`, `await bob.walkTo(...)`, `await wait(500)` compose and are **skippable/interruptible** | 300–500 LOC |
| Save/load | Serialize world state to JSON; needs a versioning/migration story from day one | 150–350 LOC |
| Localization | String tables keyed by ID + a `t()` layer threaded through all text | 100–200 LOC |
| Pixel-perfect 320x200 | Pixi: `scaleMode: 'nearest'`, `roundPixels`, integer-factor canvas scaling, letterboxing | ~100 LOC |
| **Authoring tooling** | **The real hidden cost.** A browser tool to draw walkable polygons and hotspot regions over a background and export JSON | 400–800 LOC |
| Desktop packaging for Steam | Electron or Tauri wrapper + `steamworks.js` for achievements/overlay; build pipeline for Win/Mac/Linux | days, not LOC |

**Realistic total: roughly 4,000–8,000 lines of engine code before you write a single puzzle**, plus the
packaging work. For an LLM agent that is perhaps a few solid days of generation — but the code has to be
*correct*, and the parts that bite are the ones engines have spent 20 years hardening: pathfinding edge
cases around concave geometry and doorways, interruptible/skippable cutscene sequencing, save-game
versioning across 40 scenes, and text/dialogue timing.

**What you get in exchange, under the agent constraint:**

- **100% plain text, 100% your schema.** Rooms, hotspots, walkable polygons and dialogue are JSON or TS
  the agent designed — no proprietary format, no GUI gate, perfect diffs.
- **The highest-corpus language available.** The agent writes idiomatic TypeScript far more reliably
  than AGS Script, ASHES, or even GDScript. This is a genuine, large multiplier on agent output quality.
- **A real feedback loop**: `npm test` with vitest for pure logic (pathfinding, inventory, state
  machines are all unit-testable), and **Playwright screenshots** for visual verification — the agent
  can literally look at a rendered 320x200 frame and compare it against a reference.
- **Native Linux, npm, no Wine, no 40GB editor install.**
- The developer's **existing PHP/JS expertise applies directly to reviewing the diffs** — which is the
  human's actual job in this workflow. This is a much bigger deal than it looks: the human can only
  meaningfully review code in a language they read fluently.

**What you lose:** the visual room editor (partially recoverable by building a small one), the shipped-
game confidence of AGS/Visionaire, and 20 years of genre edge cases.

**Web/desktop/mobile:** web is native and perfect. Desktop for Steam requires an Electron/Tauri/NW.js
wrapper — a well-trodden path, but I **could not verify specific notable Steam titles shipped as
Phaser/Pixi + Electron**, so treat it as "known to work" rather than "proven at scale here". Mobile via
Capacitor is possible but least polished.

### GDevelop — worth a mention

Open source, MIT runtime, no royalties, free tier. **Project format is JSON** (agent-editable), events
can be **extended or replaced with JavaScript**, exports to web/desktop/mobile, and it ships pathfinding,
physics and multiple layers/cameras out of the box. But its adventure-genre coverage is **generic, not
purpose-built** — no verb UI, no dialogue trees, no per-area character scaling, no walk-behind system.
You would be building most of the genre machinery anyway, but inside a GUI-centric tool rather than a
codebase. **Under the agent constraint it is strictly worse than plain TypeScript**: same amount of
custom work, but mediated through a project JSON schema the agent doesn't know well and an editor the
agent can't open. Source: <https://github.com/4ian/GDevelop>

### Construct 3 — mention and dismiss

Supports JavaScript and TypeScript alongside its event sheets, and is JS-native under the hood. But it
is **subscription-only** (roughly $130–470/year depending on tier), **closed-source**, and — decisively
— the **editor runs only in a browser**. An agent in a container cannot drive it. Not a fit here.

---

## Fit for this developer

Ranked against the actual working model: **an LLM agent authoring most of the code in a Linux
container, with a PHP/JS developer directing and reviewing diffs.** This ranking deliberately differs
from what I would recommend to a human writing the code by hand — where AGS or Visionaire would top the
list without much argument.

### 1. TypeScript + PixiJS (or Phaser 4), genre machinery built in-house

**The trade-off: you build ~4,000–8,000 lines of engine before the first puzzle, in exchange for the
best possible agent-authoring conditions and a codebase the human can actually review.**

Every hard gate is passed cleanly: plain-text everything, npm on Linux, headless unit tests plus
Playwright screenshot verification, and the highest-corpus language in the comparison. Crucially, the
human reviews TypeScript — their native competence — instead of skimming AGS Script or GDScript diffs
they can't confidently judge. 320x200 with nearest-neighbour is ~100 lines. The depth-scaling and
walk-behind requirements, which sound exotic, are genuinely small (~50 and ~150 LOC).

The risks are real and should not be minimised: no visual editor for walkable areas (budget building a
small one), Steam requires an Electron/Tauri wrapper, and you will rediscover genre edge cases that AGS
solved in 2003. Read JSGAM's source first — it is the same architecture, already worked out.

### 2. Godot 4.6 + Popochiu

**The trade-off: a genuinely purpose-built adventure toolkit with text project files and excellent
headless tooling — but a niche plugin API and a lower-corpus language, and no proven commercial title.**

This is the best compromise between "ready-made engine" and "agent-authorable". `.tscn`/`.tres`/`.gd`
are all diffable text with no lock-in; `godot --headless` builds and GUT emits JUnit XML; the Linux
toolchain is native. Popochiu is actively developed (2.1.1 in May 2026) and covers walkable areas,
region-based character scaling, hotspots, inventory, dialogue trees and save/load — most of the list,
already hardened.

Against it: GDScript has meaningfully less LLM corpus than TypeScript, **Popochiu's own API is niche
enough that the agent will be reading plugin source rather than recalling it**, the human will be
reviewing GDScript they don't know, and I **could not verify a single commercial Steam release built
with Popochiu**. It also pins you to Godot 4.6 and a largely single-maintainer plugin.

Pick this if the value of not building pathfinding/inventory/dialogue from scratch outweighs the
language and review friction.

### 3. AGS 4.0 (alpha) — the highest-ceiling, highest-risk option

**The trade-off: unmatched genre fit and a real commercial track record, against a Windows-only editor,
alpha status, and an unverified room metadata format.**

For this exact game — 320x200 VGA, walk-behinds, per-area scaling 10–200% — nothing else is as
purpose-built, and Wadjet Eye's shipped catalogue proves it at commercial scale. AGS 4's **open room
format** is the plot twist: rooms as folders of PNG backgrounds and **indexed-palette mask PNGs**
(colour index = area number) plus plain-text `.asc` scripts, with `.crm` generated only at compile time.
An agent can generate those masks programmatically. `/compile` gives a CI-grade headless build.

But: the **editor is Windows-only .NET**, so the container needs Wine; **AGS 4 is still alpha** as of
August 2026 with no stable release date; AGS Script has a small LLM corpus; and I **could not verify the
schema of the per-room metadata file** — where per-area scaling and hotspot names must live. If that
turns out to be binary or undocumented, the agent story collapses back to AGS 3's binary `.crm` gate.

**Before considering this seriously, spend 30 minutes verifying:** (a) what files an AGS 4 `Rooms/N/`
folder actually contains and whether the metadata is text; (b) whether `AGSEditor.exe /compile` runs
reliably under Wine on Linux.

### Also-rans, briefly

- **Visionaire Studio** — superb for a human (320x200 is its floor, "pixel effect" is nearest-neighbour,
  Lua is high-corpus, Daedalic shipped 10+ games on it). But **closed-source**, a **monolithic
  GUI-authored XML** project file with undocumented invariants, **no verifiable headless build**, a free
  tier capped at **25 scenes** (below this project's 20–40), and **pricing I could not pin down**.
  Under the agent constraint, the closed source is the killer — when docs run out the agent has nothing
  to read.
- **Unity + PowerQuest / Adventure Creator** — both actively maintained with real shipped games
  (*The Drifter*; *Harold Halibut*, *Sally Face*). C# is a great LLM language. But Unity scenes are
  **GUID-laden YAML** where a mechanically-successful merge can be semantically broken, the Linux editor
  is the least-tested target, and the install is enormous. Viable if you accept driving Unity through
  agent-written C# editor scripts rather than file edits — a real pattern, but an extra layer.
- **Plain Godot without Popochiu** — you build the same machinery as the TypeScript option, but in a
  lower-corpus language the human can't review as well. Strictly dominated by options 1 and 2.
- **Escoria, Wintermute, SLUDGE** — **rule out.** Escoria's core has been untouched since 2025-04-12 and
  never left alpha; Wintermute's last stable release was 2010; SLUDGE's was 2018 with three commits
  since. All three combine stagnation with near-zero LLM corpus.
- **GDevelop, Construct 3** — same custom-build burden as the JS route, but mediated by a GUI the agent
  cannot open. No advantage here.

### The honest framing of the top choice

The decision is essentially: **how much do you value a visual room editor and 20 years of hardened genre
edge cases, versus the agent writing TypeScript instead of a niche DSL and the human being able to
review it?**

If the agent is doing the work, the second column is worth more than it would be for a human developer —
and it inverts the usual advice. But it is not free, and the ~4,000–8,000 LOC estimate is the number to
argue with. A reasonable de-risking move: **prototype one room in both option 1 and option 2** and
compare how many agent iterations each takes to get walk + scale + walk-behind + one hotspot correct.
