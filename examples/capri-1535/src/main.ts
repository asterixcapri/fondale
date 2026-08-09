import {
  startGame,
  validateSaveSnapshot,
  type GameSession,
} from "@asterixcapri/fondale";

import { project } from "./game";

const target = document.querySelector<HTMLElement>("#game")!;
const restore = document.querySelector<HTMLButtonElement>("#restore")!;
const errorOutput = document.querySelector<HTMLOutputElement>("#error")!;

let session: GameSession = await startGame(project, { target });

restore.addEventListener("click", async () => {
  const stored: unknown = JSON.parse(JSON.stringify(session.createSaveSnapshot()));
  session.stop();
  const result = validateSaveSnapshot(project, stored);
  if (!result.ok) throw new Error(result.diagnostics.map(({ message }) => message).join("\n"));
  session = await startGame(project, { target, snapshot: result.snapshot });
});

window.addEventListener("unhandledrejection", (event) => {
  errorOutput.textContent = String(event.reason);
});
