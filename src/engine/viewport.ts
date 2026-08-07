import type { Application, Container } from "pixi.js";

import { ROOM_HEIGHT, ROOM_WIDTH } from "./constants";

/**
 * Fits the logical room to the window at a whole-number scale.
 *
 * Pixel art only survives integer scaling: at 2.5x some source pixels become
 * two screen pixels and their neighbours three, so straight edges grow a limp
 * and the dithering crawls. We take the largest whole factor that fits and
 * letterbox the remainder rather than filling the window exactly.
 */
export function fitToWindow(app: Application, stage: Container): void {
  const apply = () => {
    const { width, height } = app.screen;
    const scale = Math.max(1, Math.floor(Math.min(width / ROOM_WIDTH, height / ROOM_HEIGHT)));

    stage.scale.set(scale);
    // Round the offsets too — a half-pixel origin reintroduces exactly the
    // sampling error the integer scale was there to avoid.
    stage.x = Math.floor((width - ROOM_WIDTH * scale) / 2);
    stage.y = Math.floor((height - ROOM_HEIGHT * scale) / 2);
  };

  apply();
  app.renderer.on("resize", apply);
}
