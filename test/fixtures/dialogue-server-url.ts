import {
  AuthoringError,
  startGame,
  type AuthoringDiagnostic,
  type GameSession,
} from "../../src/index";
import { project } from "./knowledge-driven-dialogue";

declare global {
  interface Window {
    __dialogueUrlSessions?: readonly [GameSession, GameSession];
    __dialogueUrlDiagnostics?: readonly AuthoringDiagnostic[];
  }
}

try {
  window.__dialogueUrlSessions = await Promise.all([
    startGame(project, {
      target: document.querySelector<HTMLElement>("#game-one")!,
      dialogueServerUrl: "/test-dialogue",
    }),
    startGame(project, {
      target: document.querySelector<HTMLElement>("#game-two")!,
      dialogueServerUrl: "/test-dialogue",
    }),
  ]);
} catch (error) {
  if (error instanceof AuthoringError) window.__dialogueUrlDiagnostics = error.diagnostics;
  else throw error;
}
