import {
  AuthoringError,
  startGame,
  type AuthoringDiagnostic,
  type GameSession,
} from "../../src/index";
import { project } from "./knowledge-driven-dialogue";

const secondProject = {
  ...project,
  identity: "dialogue-server-url-second-project",
  narrativeContext: "A scientific mystery on Mars in 2248.",
};

declare global {
  interface Window {
    __dialogueUrlSessions?: readonly [GameSession, GameSession];
    __dialogueUrlDiagnostics?: readonly AuthoringDiagnostic[];
    __restoreFirstDialogueUrlSession?: () => Promise<void>;
  }
}

try {
  window.__dialogueUrlSessions = await Promise.all([
    startGame(project, {
      target: document.querySelector<HTMLElement>("#game-one")!,
      dialogueServerUrl: "/test-dialogue",
    }),
    startGame(secondProject, {
      target: document.querySelector<HTMLElement>("#game-two")!,
      dialogueServerUrl: "/test-dialogue",
    }),
  ]);
  window.__restoreFirstDialogueUrlSession = async () => {
    const [first, second] = window.__dialogueUrlSessions!;
    const snapshot = first.createSaveSnapshot();
    first.stop();
    const restored = await startGame(project, {
      target: document.querySelector<HTMLElement>("#game-one")!,
      dialogueServerUrl: "/test-dialogue",
      snapshot,
    });
    window.__dialogueUrlSessions = [restored, second];
  };
} catch (error) {
  if (error instanceof AuthoringError) window.__dialogueUrlDiagnostics = error.diagnostics;
  else throw error;
}
