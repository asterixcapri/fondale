import { Application, Assets, Container, Sprite, TexturePool } from "pixi.js";

import { ROOM_HEIGHT, ROOM_WIDTH } from "./engine/constants";
import { fitToWindow } from "./engine/viewport";

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
    // Nearest-neighbour everywhere: the art is a 64-colour indexed image and
    // any filtering turns the quantised bands back into mush.
    roundPixels: true,
  });
  TexturePool.textureOptions.scaleMode = "nearest";

  document.body.appendChild(app.canvas);

  const room = new Container();
  app.stage.addChild(room);

  const texture = await Assets.load("/rooms/vicolo-capri.png");
  texture.source.scaleMode = "nearest";

  const background = new Sprite(texture);
  background.width = ROOM_WIDTH;
  background.height = ROOM_HEIGHT;
  room.addChild(background);

  fitToWindow(app, room);

  window.__gameReady = true;
}

main().catch((error: unknown) => {
  // The harness fails the run on any console error, so an unhandled rejection
  // here surfaces as a test failure rather than a silently black screen.
  console.error("avvio fallito", error);
});
