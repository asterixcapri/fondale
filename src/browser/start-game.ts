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
import { BrowserContinuation, chooseContinuation } from "./continuation";
import { BrowserFrame } from "./frame";
import { DialogueHttpError, HttpDialogueProvider } from "./http-dialogue-provider";
import { BrowserLoop } from "./loop";
import { BrowserRenderer } from "./renderer";

/** Options for mounting a new, independent Game Session. */
export interface StartGameOptions {
  /** A currently unowned element that will contain the entire logical frame. */
  readonly target: HTMLElement;
  /** Optional untrusted Save Snapshot data to validate and restore at startup. */
  readonly snapshot?: unknown;
  /** Ordinary connection to a separately run Dialogue Server. */
  readonly dialogueServerUrl?: string;
  /** Low-level alternative for Engine tests, technical fixtures, and advanced hosts. */
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
  if (options.dialogueServerUrl !== undefined && options.dialogueProvider !== undefined) {
    throw new AuthoringError([{
      code: "environment.dialogue-connection.ambiguous",
      family: "environment", owner: "dialogue",
      path: "startGame",
      message: "Supply either dialogueServerUrl or dialogueProvider, not both.",
    }]);
  }
  const requiresDialogueConnection = createKnowledgeDrivenDialogue(
    getGameSessionCompositionView(compiledProject).dialogue,
  ).requiresProvider();
  let restored: ValidatedSaveSnapshot | undefined;
  if (options.snapshot !== undefined) {
    const validation = createSave(compiledProject).validate(options.snapshot);
    if (!validation.ok) throw new AuthoringError(validation.diagnostics);
    restored = validation.snapshot;
  }
  if (requiresDialogueConnection && options.dialogueServerUrl === undefined &&
      options.dialogueProvider === undefined) {
    throw new AuthoringError([{
      code: "environment.dialogue-provider.missing",
      family: "environment", owner: "dialogue",
      path: "startGame",
      message: "This Game Project requires dialogueServerUrl or dialogueProvider.",
    }]);
  }
  const projectView = getBrowserProjectView(compiledProject);
  const continuation = options.dialogueProvider === undefined && options.snapshot === undefined
    ? new BrowserContinuation(compiledProject, projectView.startup.identity)
    : undefined;
  const storedContinuation = continuation?.read() ?? { status: "absent" as const };
  const availableContinuation = storedContinuation.status === "valid"
    ? storedContinuation.state
    : undefined;
  const startupChoice = storedContinuation.status === "absent"
    ? "new-game"
    : await chooseContinuation(
      options.target,
      projectView.startup,
      storedContinuation.status === "valid",
    );
  if (startupChoice === "continue") restored = availableContinuation!.snapshot;

  let dialogueProvider = options.dialogueProvider;
  let providerSessionId = continuation
    ? startupChoice === "continue"
      ? availableContinuation!.providerSessionId
      : crypto.randomUUID()
    : undefined;
  if (requiresDialogueConnection && options.dialogueServerUrl !== undefined) {
    providerSessionId ??= crypto.randomUUID();
    const httpDialogueProvider = new HttpDialogueProvider({
      endpoint: options.dialogueServerUrl,
      sessionId: providerSessionId,
    });
    dialogueProvider = httpDialogueProvider;
    try {
      if (startupChoice === "continue") await httpDialogueProvider.ready();
      else await httpDialogueProvider.reset();
    } catch (error) {
      throw new AuthoringError([dialogueConnectionDiagnostic(error)]);
    }
  }
  let frame: BrowserFrame | undefined;
  let loop: BrowserLoop | undefined;
  let renderer: BrowserRenderer | undefined;
  let core: CoreSession | undefined;
  let continuationTimer: ReturnType<typeof setTimeout> | undefined;
  let lastContinuationRevision: number | undefined;

  const persistContinuation = () => {
    if (!continuation || !providerSessionId || !core) return;
    const continuationSnapshot = core.createContinuationSnapshot();
    if (!continuationSnapshot ||
        continuationSnapshot.revision === lastContinuationRevision) return;
    if (continuation.write(providerSessionId, continuationSnapshot.snapshot)) {
      lastContinuationRevision = continuationSnapshot.revision;
    }
  };
  const scheduleContinuation = () => {
    if (!continuation || continuationTimer !== undefined) return;
    continuationTimer = setTimeout(() => {
      continuationTimer = undefined;
      persistContinuation();
    }, 100);
  };

  const cleanup = () => {
    clearTimeout(continuationTimer);
    loop?.destroy();
    renderer?.destroy();
    core?.stop();
    frame?.destroy();
  };

  try {
    frame = new BrowserFrame(options.target, projectView.startup);
    frame.checkEnvironment();
    const assets = await loadProjectAssets(projectView.assets);
    await frame.mount();

    core = createCoreSession(compiledProject, restored, dialogueProvider);
    const mountRenderer = (session: CoreSession): BrowserRenderer => {
      const next = new BrowserRenderer(
        frame!.application,
        frame!.element,
        projectView.presentation,
        assets,
        session,
      );
      next.render([]);
      return next;
    };
    renderer = mountRenderer(core);
    loop = new BrowserLoop(
      frame.application,
      () => core!,
      () => renderer!,
      scheduleContinuation,
    );
    await loop.start();
    persistContinuation();

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
        persistContinuation();
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

function dialogueConnectionDiagnostic(error: unknown): AuthoringDiagnostic {
  if (error instanceof DialogueHttpError && error.kind === "unreachable") {
    return {
      code: "environment.dialogue-server.unreachable",
      family: "environment", owner: "dialogue",
      path: "startGame.dialogueServerUrl",
      message: "Fondale could not reach the declared Dialogue Server.",
      suggestion: "Start the Dialogue Server and verify dialogueServerUrl.",
    };
  }
  return {
    code: "environment.dialogue-server.connection-failed",
    family: "environment", owner: "dialogue",
    path: "startGame.dialogueServerUrl",
    message: "The declared Dialogue Server rejected its connection check.",
    suggestion: "Verify dialogueServerUrl and the Dialogue Server configuration.",
  };
}
