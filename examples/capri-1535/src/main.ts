import {
  startGame,
  validateSaveSnapshot,
  type GameSession,
} from "@asterixcapri/fondale";

import { project } from "./game";

const target = document.querySelector<HTMLElement>("#game")!;
const restore = document.querySelector<HTMLButtonElement>("#restore")!;
const errorOutput = document.querySelector<HTMLOutputElement>("#error")!;

if (import.meta.env.MODE === "prototype") {
  restore.hidden = true;
  const focus = new URLSearchParams(window.location.search).get("focus");
  if (focus === "return-style") {
    const { startReturnStylePrototype } = await import("./prototypes/return-style-prototype");
    startReturnStylePrototype(target);
  } else if (focus === "verb-coin") {
    const { startVerbCoinPrototype } = await import("./prototypes/verb-coin-prototype");
    startVerbCoinPrototype(target);
  } else {
    const { startHudArchitecturePrototype } = await import("./prototypes/hud-architecture-prototype");
    startHudArchitecturePrototype(target);
  }
} else {
  let session: GameSession = await startGame(project, { target });

  restore.addEventListener("click", async () => {
    const stored: unknown = JSON.parse(JSON.stringify(session.createSaveSnapshot()));
    session.stop();
    const result = validateSaveSnapshot(project, stored);
    if (!result.ok) throw new Error(result.diagnostics.map(({ message }) => message).join("\n"));
    session = await startGame(project, { target, snapshot: result.snapshot });
  });
}

window.addEventListener("unhandledrejection", (event) => {
  errorOutput.textContent = String(event.reason);
});
