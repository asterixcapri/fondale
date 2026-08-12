import wrongSizeUrl from "./background.png";
import { AuthoringError, type GameProject, type SceneDefinition, startGame } from "../../src/index";

declare global {
  interface Window { __invalidAsset?: { code: string; message: string; children: number } }
}

const scene = ({
  background: wrongSizeUrl,
  size: { width: 640, height: 360 },
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 426, y: 0 },
    { x: 426, y: 240 },
    { x: 0, y: 240 },
  ],
} satisfies SceneDefinition);
const project = ({
  identity: "test.invalid-asset",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { opening: scene },
  initialScene: "opening",
} satisfies GameProject);
const target = document.querySelector<HTMLElement>("#game")!;
try {
  await startGame(project, { target });
} catch (error) {
  window.__invalidAsset = {
    code: error instanceof AuthoringError ? error.diagnostics[0]!.code : String(error),
    message: error instanceof AuthoringError ? error.diagnostics[0]!.message : String(error),
    children: target.childElementCount,
  };
}
