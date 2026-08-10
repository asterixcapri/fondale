# Quick start

Install Fondale in a TypeScript web project:

```sh
npm install @asterixcapri/fondale
```

Import only from the package root. Define a Scene, compose the named registry
into an immutable Game Project, and await its first rendered frame:

```ts
import { defineGame, defineScene, startGame } from "@asterixcapri/fondale";

const opening = defineScene({
  background: new URL("./opening.png", import.meta.url),
  walkableRegion: [
    { x: 0, y: 0 }, { x: 320, y: 0 },
    { x: 320, y: 180 }, { x: 0, y: 180 },
  ],
});

const project = defineGame({
  identity: "com.example.first-adventure",
  version: "1",
  logicalResolution: { width: 320, height: 180 },
  scenes: { opening },
  initialScene: "opening",
});

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

Continue with the [concept guide](concepts.md), focused [recipes](recipes/README.md),
and [public reference](reference.md).
