import { Application, TexturePool } from "pixi.js";

import { createCoreSession, type CoreSession } from "../internal/core";
import { AuthoringError, type AuthoringDiagnostic } from "../public/diagnostics";
import { getGameProjectData, type GameProject } from "../public/definitions";
import type { SaveSnapshot, ValidatedSaveSnapshot } from "../public/save";
import { loadProjectAssets } from "./assets";
import { FixedStepClock } from "./fixed-step-clock";
import { BrowserRenderer } from "./renderer";

/** Options for mounting a new, independent Game Session. */
export interface StartGameOptions {
  /** A currently unowned element that will contain the entire logical frame. */
  readonly target: HTMLElement;
  /** An optional snapshot returned by {@link validateSaveSnapshot}. */
  readonly snapshot?: ValidatedSaveSnapshot;
}

/** The public lifecycle and persistence controls of one running Game Session. */
export interface GameSession {
  /** Creates a JSON-safe Save Snapshot from the latest committed Game State. */
  createSaveSnapshot(): SaveSnapshot;
  /** Returns the current terminal-aware lifecycle without exposing Game State. */
  getStatus(): "running" | "failed" | "stopped";
  /** Returns contextual diagnostics after a runtime failure, otherwise an empty list. */
  getDiagnostics(): readonly AuthoringDiagnostic[];
  /** Permanently stops this session and releases its target. Safe to call repeatedly. */
  stop(): void;
}

const occupiedTargets = new WeakSet<HTMLElement>();

/**
 * Loads every project asset, draws the first committed Scene, and resolves with
 * a running session. Failure rejects without leaving a partial target mount.
 */
export async function startGame(
  project: GameProject,
  options: StartGameOptions,
): Promise<GameSession> {
  const data = getGameProjectData(project);
  const { target } = options;
  if (occupiedTargets.has(target)) {
    throw new AuthoringError([
      {
        code: "environment.target.occupied",
        family: "environment",
        path: "startGame.target",
        message: "The target already belongs to a running Game Session.",
        suggestion: "Stop the existing Game Session or provide another target.",
      },
    ]);
  }

  occupiedTargets.add(target);
  const previousStyle = {
    background: target.style.background,
    display: target.style.display,
    placeItems: target.style.placeItems,
    overflow: target.style.overflow,
  };
  let application: Application | undefined;
  let frame: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let renderer: BrowserRenderer | undefined;
  let core: CoreSession | undefined;

  const cleanup = () => {
    resizeObserver?.disconnect();
    renderer?.destroy();
    core?.stop();
    application?.destroy(true, { children: true, texture: false, textureSource: false });
    frame?.remove();
    target.style.background = previousStyle.background;
    target.style.display = previousStyle.display;
    target.style.placeItems = previousStyle.placeItems;
    target.style.overflow = previousStyle.overflow;
    occupiedTargets.delete(target);
  };

  try {
    const capabilityCanvas = document.createElement("canvas");
    if (!capabilityCanvas.getContext("webgl2") && !capabilityCanvas.getContext("webgl")) {
      throw new AuthoringError([
        {
          code: "environment.webgl.unavailable",
          family: "environment",
          path: "startGame",
          message: "Fondale requires WebGL in the current Chrome desktop Support Baseline.",
        },
      ]);
    }
    const assets = await loadProjectAssets(data);
    application = new Application();
    try {
      await application.init({
        width: data.logicalResolution.width,
        height: data.logicalResolution.height,
        preference: "webgl",
        backgroundAlpha: 0,
        antialias: false,
        roundPixels: true,
      });
    } catch (cause) {
      throw new AuthoringError([
        {
          code: "environment.webgl.unavailable",
          family: "environment",
          path: "startGame",
          message: "Fondale requires WebGL in the current Chrome desktop Support Baseline.",
          cause,
        },
      ]);
    }
    TexturePool.textureOptions.scaleMode = "nearest";

    frame = document.createElement("div");
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

    target.style.background = data.letterboxColor;
    target.style.display = "grid";
    target.style.placeItems = "center";
    target.style.overflow = "hidden";
    target.append(frame);

    const fitFrame = () => {
      if (!frame) return;
      const { width, height } = data.logicalResolution;
      const ratio = Math.min(target.clientWidth / width, target.clientHeight / height);
      const scale = ratio >= 1 ? Math.max(1, Math.floor(ratio)) : Math.max(0, ratio);
      frame.style.width = `${width * scale}px`;
      frame.style.height = `${height * scale}px`;
      frame.style.setProperty("--fondale-scale", String(scale));
    };
    fitFrame();
    resizeObserver = new ResizeObserver(fitFrame);
    resizeObserver.observe(target);

    core = createCoreSession(project, options.snapshot);
    renderer = new BrowserRenderer(application, frame, data, assets, core);
    renderer.render(core.snapshot(), []);
    const fixedStepClock = new FixedStepClock();
    let previousFrameTime = performance.now();
    application.ticker.add(() => {
      if (core?.lifecycle() !== "running" || !renderer) return;
      const frameTime = performance.now();
      const steps = fixedStepClock.advance(frameTime - previousFrameTime);
      previousFrameTime = frameTime;
      if (steps > 0) core.steps(steps);
      renderer.render(core.snapshot(), core.takeEffects());
    });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    let stopped = false;
    return Object.freeze({
      createSaveSnapshot() {
        if (stopped || !core) throw new Error("Game Session is stopped.");
        return core.createSaveSnapshot();
      },
      getStatus() {
        return stopped ? "stopped" : core?.lifecycle() ?? "stopped";
      },
      getDiagnostics() {
        return core?.diagnostics() ?? [];
      },
      stop() {
        if (stopped) return;
        stopped = true;
        cleanup();
      },
    });
  } catch (error) {
    cleanup();
    if (error instanceof AuthoringError) throw error;
    throw new AuthoringError([
      {
        code: "environment.start.failed",
        family: "environment",
        path: "startGame",
        message: "The Game Session could not start.",
        cause: error,
      },
    ]);
  }
}
