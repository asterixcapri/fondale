import wrongSizeUrl from "../../art/example/key.png";
import { AuthoringError, defineGame, defineScene, startGame } from "../../src/index";

declare global {
  interface Window { __invalidAsset?: { code: string; children: number } }
}

const scene = defineScene({
  background: wrongSizeUrl,
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 426, y: 0 },
    { x: 426, y: 240 },
    { x: 0, y: 240 },
  ],
});
const project = defineGame({
  identity: "test.invalid-asset",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  scenes: { opening: scene },
  initialScene: "opening",
});
const target = document.querySelector<HTMLElement>("#game")!;
try {
  await startGame(project, { target });
} catch (error) {
  window.__invalidAsset = {
    code: error instanceof AuthoringError ? error.diagnostics[0]!.code : String(error),
    children: target.childElementCount,
  };
}
