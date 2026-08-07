import { Application, Assets, Container, Sprite, TexturePool, type Texture } from "pixi.js";

import { Character } from "./engine/character";
import { ROOM_HEIGHT, ROOM_WIDTH } from "./engine/constants";
import { buildDebugOverlay } from "./engine/debug-overlay";
import { buildForeground } from "./engine/foreground";
import { nearestWalkable } from "./engine/room";
import { loadFrames } from "./engine/sprite";
import { fitToWindow } from "./engine/viewport";
import { vicoloCapri } from "./rooms/vicolo-capri";
import { micheleWalk } from "./sprites/michele-walk";

declare global {
  interface Window {
    /** Set once the first room is on screen, so the verification harness
     *  screenshots a drawn frame instead of a blank canvas. */
    __gameReady?: true;
    /** Handles the harness uses to drive the game without clicking around
     *  blind: walk somewhere, then wait for arrival. */
    __game?: {
      walkTo(x: number, y: number): void;
      isWalking(): boolean;
      where(): { x: number; y: number };
    };
  }
}

async function main(): Promise<void> {
  const app = new Application();
  await app.init({
    resizeTo: window,
    background: "#000000",
    roundPixels: true,
  });
  // Nearest-neighbour everywhere: the art is quantised to 64 colours and any
  // filtering turns those bands back into mush.
  TexturePool.textureOptions.scaleMode = "nearest";

  document.body.appendChild(app.canvas);

  const room = vicoloCapri;
  const scene = new Container();
  app.stage.addChild(scene);

  const backgroundTexture = await Assets.load<Texture>(room.background);
  backgroundTexture.source.scaleMode = "nearest";

  const background = new Sprite(backgroundTexture);
  background.width = ROOM_WIDTH;
  background.height = ROOM_HEIGHT;
  scene.addChild(background);

  // Everything whose stacking depends on where it stands lives here together,
  // sorted by zIndex: actors carry their feet, scenery carries its baseline.
  const depthSorted = new Container();
  depthSorted.sortableChildren = true;
  scene.addChild(depthSorted);

  const michele = new Character(await loadFrames(micheleWalk), room.entrances["dal-basso"]!.at);
  depthSorted.addChild(michele.view);

  depthSorted.addChild(...buildForeground(room, backgroundTexture));

  // The overlay is how scene setup gets checked. `?debug` is what the
  // screenshot harness uses; the D key is for whoever opens the built page,
  // where there is no address bar to edit.
  const overlay = buildDebugOverlay(room);
  overlay.visible = new URLSearchParams(window.location.search).has("debug");
  scene.addChild(overlay);

  window.addEventListener("keydown", (event) => {
    if (event.key === "d" || event.key === "D") overlay.visible = !overlay.visible;
  });

  const walkTo = (x: number, y: number) => {
    michele.follow([nearestWalkable(room, { x, y })]);
  };

  background.eventMode = "static";
  background.cursor = "pointer";
  background.on("pointertap", (event) => {
    const local = scene.toLocal(event.global);
    walkTo(local.x, local.y);
  });

  app.ticker.add((ticker) => {
    michele.update(ticker.deltaMS / 1000, room);
    depthSorted.sortChildren();
  });

  fitToWindow(app, scene);

  window.__game = {
    walkTo,
    isWalking: () => michele.walking,
    where: () => michele.at,
  };
  window.__gameReady = true;
}

main().catch((error: unknown) => {
  // The harness fails the run on any console error, so an unhandled rejection
  // here surfaces as a test failure rather than a silently black screen.
  console.error("avvio fallito", error);
});
