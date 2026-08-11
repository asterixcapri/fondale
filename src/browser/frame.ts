import { Application, TexturePool } from "pixi.js";

import { AuthoringError } from "../capabilities/game-project";
import type { BrowserStartProjectView } from "../capabilities/game-project";

const occupiedTargets = new WeakSet<HTMLElement>();

/** Owns the PixiJS canvas, logical frame fitting, and target lifecycle. */
export class BrowserFrame {
  private readonly previousStyle: {
    readonly background: string;
    readonly display: string;
    readonly placeItems: string;
    readonly overflow: string;
  };
  private pixiApplication: Application | undefined;
  private frameElement: HTMLDivElement | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private released = false;

  constructor(
    private readonly target: HTMLElement,
    private readonly settings: BrowserStartProjectView,
  ) {
    if (occupiedTargets.has(target)) {
      throw new AuthoringError([{
        code: "environment.target.occupied",
        family: "environment", owner: "browser",
        path: "startGame.target",
        message: "The target already belongs to a running Game Session.",
        suggestion: "Stop the existing Game Session or provide another target.",
      }]);
    }
    occupiedTargets.add(target);
    this.previousStyle = {
      background: target.style.background,
      display: target.style.display,
      placeItems: target.style.placeItems,
      overflow: target.style.overflow,
    };
  }

  get application(): Application {
    if (!this.pixiApplication) throw new Error("The browser frame has not been mounted.");
    return this.pixiApplication;
  }

  get element(): HTMLDivElement {
    if (!this.frameElement) throw new Error("The browser frame has not been mounted.");
    return this.frameElement;
  }

  async mount(): Promise<void> {
    const capabilityCanvas = document.createElement("canvas");
    if (!capabilityCanvas.getContext("webgl2") && !capabilityCanvas.getContext("webgl")) {
      throw webGLUnavailable();
    }

    const application = new Application();
    try {
      await application.init({
        width: this.settings.logicalResolution.width,
        height: this.settings.logicalResolution.height,
        preference: "webgl",
        backgroundAlpha: 0,
        antialias: false,
        roundPixels: true,
      });
    } catch (cause) {
      throw webGLUnavailable(cause);
    }
    this.pixiApplication = application;
    TexturePool.textureOptions.scaleMode = "nearest";

    const frame = document.createElement("div");
    this.frameElement = frame;
    frame.dataset.fondaleFrame = "";
    frame.tabIndex = -1;
    frame.style.position = "relative";
    frame.style.flex = "none";
    frame.style.imageRendering = "pixelated";
    application.canvas.style.display = "block";
    application.canvas.style.width = "100%";
    application.canvas.style.height = "100%";
    application.canvas.style.imageRendering = "pixelated";
    frame.append(application.canvas);

    this.target.style.background = this.settings.letterboxColor;
    this.target.style.display = "grid";
    this.target.style.placeItems = "center";
    this.target.style.overflow = "hidden";
    this.target.append(frame);

    this.fit();
    this.resizeObserver = new ResizeObserver(() => this.fit());
    this.resizeObserver.observe(this.target);
  }

  destroy(): void {
    if (this.released) return;
    this.released = true;
    this.resizeObserver?.disconnect();
    this.pixiApplication?.destroy(true, {
      children: true,
      texture: false,
      textureSource: false,
    });
    this.frameElement?.remove();
    this.target.style.background = this.previousStyle.background;
    this.target.style.display = this.previousStyle.display;
    this.target.style.placeItems = this.previousStyle.placeItems;
    this.target.style.overflow = this.previousStyle.overflow;
    occupiedTargets.delete(this.target);
  }

  private fit(): void {
    if (!this.frameElement) return;
    const { width, height } = this.settings.logicalResolution;
    const ratio = Math.min(this.target.clientWidth / width, this.target.clientHeight / height);
    const scale = ratio >= 1 ? Math.max(1, Math.floor(ratio)) : Math.max(0, ratio);
    this.frameElement.style.width = `${width * scale}px`;
    this.frameElement.style.height = `${height * scale}px`;
    this.frameElement.style.setProperty("--fondale-scale", String(scale));
  }
}

function webGLUnavailable(cause?: unknown): AuthoringError {
  return new AuthoringError([{
    code: "environment.webgl.unavailable",
    family: "environment", owner: "browser",
    path: "startGame",
    message: "Fondale requires WebGL in the current Chrome desktop Support Baseline.",
    ...(cause === undefined ? {} : { cause }),
  }]);
}
