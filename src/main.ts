import { Application, Assets, Container, Sprite, TexturePool } from "pixi.js";

import { ROOM_HEIGHT, ROOM_WIDTH } from "./engine/constants";
import { buildDebugOverlay } from "./engine/debug-overlay";
import { fitToWindow } from "./engine/viewport";
import { vicoloCapri } from "./rooms/vicolo-capri";

declare global {
  interface Window {
    /** Set once the first room is on screen, so the verification harness
     *  screenshots a drawn frame instead of a blank canvas. */
    __gameReady?: true;
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

  const texture = await Assets.load(room.background);
  texture.source.scaleMode = "nearest";

  const background = new Sprite(texture);
  background.width = ROOM_WIDTH;
  background.height = ROOM_HEIGHT;
  scene.addChild(background);

  if (new URLSearchParams(window.location.search).has("debug")) {
    scene.addChild(buildDebugOverlay(room));
  }

  fitToWindow(app, scene);

  window.__gameReady = true;
}

main().catch((error: unknown) => {
  // The harness fails the run on any console error, so an unhandled rejection
  // here surfaces as a test failure rather than a silently black screen.
  console.error("avvio fallito", error);
});
