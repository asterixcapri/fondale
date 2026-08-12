import backgroundUrl from "./background.png";
import {
  AuthoringError,
  type GameProject,
  type SceneDefinition,
  startGame,
  type GameSession,
} from "../../src/index";

declare global {
  interface Window {
    __startTest?: {
      session: GameSession;
      target: HTMLElement;
      trySecondStart(): Promise<string>;
      restart(): Promise<GameSession>;
      mutateProject(): void;
    };
    __startError?: string;
  }
}

const scene = ({
  background: backgroundUrl,
  walkableRegion: [
    { x: 55, y: 239 },
    { x: 186, y: 146 },
    { x: 228, y: 146 },
    { x: 352, y: 239 },
  ],
} satisfies SceneDefinition);
const variables = { changedAfterStart: false };
const project = ({
  identity: "test.start-game",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { opening: scene },
  variables,
  initialScene: "opening",
  letterboxColor: "#241b2f",
} satisfies GameProject);
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
    restart: () => startGame(project, { target }),
    mutateProject: () => {
      variables.changedAfterStart = true;
    },
  };
} catch (error) {
  window.__startError = error instanceof AuthoringError ? error.diagnostics[0]!.code : String(error);
}
