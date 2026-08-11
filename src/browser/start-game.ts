import { createCoreSession, type CoreSession } from "../capabilities/game-session";
import { AuthoringError, type AuthoringDiagnostic } from "../capabilities/game-project";
import { getBrowserProjectView, type GameProject } from "../capabilities/game-project";
import {
  type SaveSnapshot,
  type ValidatedSaveSnapshot,
} from "../capabilities/save";
import { loadProjectAssets } from "./assets";
import { BrowserFrame } from "./frame";
import { BrowserLoop } from "./loop";
import { BrowserRenderer } from "./renderer";
import { createBrowserSessionControls, type BrowserSessionControls } from "./save-slots";

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

/**
 * Loads every project asset, draws the first committed Scene, and resolves with
 * a running session. Failure rejects without leaving a partial target mount.
 */
export async function startGame(
  project: GameProject,
  options: StartGameOptions,
): Promise<GameSession> {
  const projectView = getBrowserProjectView(project);
  let frame: BrowserFrame | undefined;
  let loop: BrowserLoop | undefined;
  let renderer: BrowserRenderer | undefined;
  let core: CoreSession | undefined;

  const cleanup = () => {
    loop?.destroy();
    renderer?.destroy();
    core?.stop();
    frame?.destroy();
  };

  try {
    frame = new BrowserFrame(options.target, projectView.startup);
    const assets = await loadProjectAssets(projectView.assets);
    await frame.mount();

    core = createCoreSession(project, options.snapshot);
    let controls: BrowserSessionControls;
    const mountRenderer = (session: CoreSession): BrowserRenderer => {
      const next = new BrowserRenderer(
        frame!.application,
        frame!.element,
        projectView.presentation,
        assets,
        session,
        controls,
      );
      next.render([]);
      return next;
    };
    const replaceCore = (snapshot: ValidatedSaveSnapshot) => {
      renderer!.destroy();
      core!.stop();
      core = createCoreSession(project, snapshot);
      renderer = mountRenderer(core);
      loop!.reset();
    };
    controls = createBrowserSessionControls(project, () => core!, replaceCore);
    renderer = mountRenderer(core);
    loop = new BrowserLoop(frame.application, () => core!, () => renderer!);
    await loop.start();

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
        family: "environment", owner: "browser",
        path: "startGame",
        message: "The Game Session could not start.",
        cause: error,
      },
    ]);
  }
}
