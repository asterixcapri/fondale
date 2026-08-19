# Quick start

Install Fondale in a TypeScript web project:

```sh
npm install @asterixcapri/fondale
```

Import only from the package root. Author ordinary typed data, pass the complete
Game Project to `startGame`, and await its first rendered frame:

```ts
import {
  startGame,
  type GameProject,
  type SceneDefinition,
} from "@asterixcapri/fondale";

const opening = {
  background: new URL("./opening.png", import.meta.url),
  walkableRegion: [
    { x: 0, y: 0 }, { x: 320, y: 0 },
    { x: 320, y: 180 }, { x: 0, y: 180 },
  ],
} satisfies SceneDefinition;

const project = {
  identity: "com.example.first-adventure",
  version: "1",
  logicalResolution: { width: 320, height: 180 },
  scenes: { opening },
  initialScene: "opening",
} satisfies GameProject;

const session = await startGame(project, {
  target: document.querySelector<HTMLElement>("#game")!,
});

// When the containing application is finished with this playthrough:
session.stop();
```

The Background must be a decodable PNG exactly matching the Scene's resolved
Scene Size. Omitted `size` defaults to the Logical Resolution, preserving a
fixed Scene; a larger `size` enables automatic Player-following Camera
scrolling without adding Camera data to Save Snapshots. `startGame` also
requires current desktop Chrome with WebGL and a
target not owned by another Game Session. Failures are reported as aggregated
`AuthoringError` diagnostics and leave the target clean.

Continue with the [vocabulary](vocabulary.md), focused [recipes](recipes/README.md),
and the [contract index](contract-index.md).
