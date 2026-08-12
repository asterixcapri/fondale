import { createCoreSession, type CoreSession } from "../capabilities/game-session";
import {
  AuthoringError,
  compileGameProject,
  getBrowserProjectView,
  getGameSessionCompositionView,
  type AuthoringDiagnostic,
  type GameProject,
} from "../capabilities/game-project";
import {
  createKnowledgeDrivenDialogue,
  type DialogueProvider,
} from "../capabilities/dialogue";
import {
  createSave,
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
  /** Optional untrusted Save Snapshot data to validate and restore at startup. */
  readonly snapshot?: unknown;
  /** Required adapter when any Character declares a Dialogue Profile. */
  readonly dialogueProvider?: DialogueProvider;
}

/** The public lifecycle and persistence controls of one running Game Session. */
export interface GameSession {
  /** Creates a JSON-safe Save Snapshot from the latest committed Game State. */
  createSaveSnapshot(): SaveSnapshot;
  /** Returns the current terminal-aware lifecycle without exposing Game State. */
  getStatus(): "running" | "failed" | "stopped";
  /** Returns contextual diagnostics after a runtime failure, otherwise an empty list. */
  getDiagnostics(): readonly AuthoringDiagnostic[];
  /** Opens Reflection for the Player Character when the Game Session is idle. */
  startReflection(): boolean;
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
  const compilation = compileGameProject(project);
  if (!compilation.ok) throw new AuthoringError(compilation.diagnostics);
  const compiledProject = compilation.project;
  const dialogueConfigured = createKnowledgeDrivenDialogue(
    getGameSessionCompositionView(compiledProject).dialogue,
  ).requiresProvider();
  if (dialogueConfigured && !options.dialogueProvider) {
    throw new AuthoringError([{
      code: "environment.dialogue-provider.missing",
      family: "environment", owner: "dialogue",
      path: "startGame.dialogueProvider",
      message: "This Game Project requires a Dialogue Provider startup dependency.",
    }]);
  }
  let restored: ValidatedSaveSnapshot | undefined;
  if (options.snapshot !== undefined) {
    const validation = createSave(compiledProject).validate(options.snapshot);
    if (!validation.ok) throw new AuthoringError(validation.diagnostics);
    restored = validation.snapshot;
  }
  const projectView = getBrowserProjectView(compiledProject);
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
    if (restored && options.dialogueProvider) await options.dialogueProvider.reset();
    frame = new BrowserFrame(options.target, projectView.startup);
    frame.checkEnvironment();
    const assets = await loadProjectAssets(projectView.assets);
    await frame.mount();

    core = createCoreSession(compiledProject, restored, options.dialogueProvider);
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
    const replaceCore = async (snapshot: ValidatedSaveSnapshot) => {
      core!.stop();
      renderer!.destroy();
      if (options.dialogueProvider) await options.dialogueProvider.reset();
      core = createCoreSession(compiledProject, snapshot, options.dialogueProvider);
      renderer = mountRenderer(core);
      loop!.reset();
    };
    controls = createBrowserSessionControls(compiledProject, () => core!, replaceCore);
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
      startReflection() {
        if (stopped || !core || !renderer) return false;
        const started = core.startReflection();
        if (started) renderer.render([]);
        return started;
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
