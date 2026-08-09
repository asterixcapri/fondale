import backgroundUrl from "./background.png";
import {
  AuthoringError,
  defineGame,
  defineScene,
  startGame,
  type GameSession,
} from "../../src/index";

declare global {
  interface Window {
    __startTest?: {
      session: GameSession;
      target: HTMLElement;
      trySecondStart(): Promise<string>;
    };
    __startError?: string;
  }
}

const scene = defineScene({
  background: backgroundUrl,
  walkableRegion: [
    { x: 55, y: 239 },
    { x: 186, y: 146 },
    { x: 228, y: 146 },
    { x: 352, y: 239 },
  ],
});
const project = defineGame({
  identity: "test.start-game",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { opening: scene },
  initialScene: "opening",
  letterboxColor: "#241b2f",
});
const target = document.querySelector<HTMLElement>("#game")!;
try {
  const session = await startGame(project, { target });
  window.__startTest = {
    session,
    target,
    async trySecondStart() {
      try {
        await startGame(project, { target });
        return "unexpected success";
      } catch (error) {
        return error instanceof AuthoringError ? error.diagnostics[0]!.code : String(error);
      }
    },
  };
} catch (error) {
  window.__startError = error instanceof AuthoringError ? error.diagnostics[0]!.code : String(error);
}
