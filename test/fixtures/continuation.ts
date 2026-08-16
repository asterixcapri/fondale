import {
  AuthoringError,
  startGame,
  type AuthoringDiagnostic,
  type GameSession,
} from "../../src/index";
import { project as dialogueProject } from "./knowledge-driven-dialogue";

declare global {
  interface Window {
    __continuationSession?: GameSession;
    __continuationDiagnostics?: readonly AuthoringDiagnostic[];
  }
}

const identity = new URLSearchParams(location.search).get("project") ?? "continuation-one";

try {
  window.__continuationSession = await startGame({
    ...dialogueProject,
    identity: `org.asterixcapri.${identity}`,
  }, {
    target: document.querySelector<HTMLElement>("#continuation-game")!,
    dialogueServerUrl: "/test-dialogue",
  });
} catch (error) {
  if (error instanceof AuthoringError) window.__continuationDiagnostics = error.diagnostics;
  else throw error;
}
