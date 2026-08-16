import {
  AuthoringError,
  startGame,
  type GameSession,
} from "@asterixcapri/fondale";

import { project } from "./game";

const target = document.querySelector<HTMLElement>("#game")!;
const errorOutput = document.querySelector<HTMLOutputElement>("#error")!;
const reflection = document.querySelector<HTMLButtonElement>("#reflection")!;

const dialogueServerUrl = "http://127.0.0.1:4315/dialogue";

window.addEventListener("unhandledrejection", (event) => {
  errorOutput.textContent = String(event.reason);
});

if (import.meta.env.MODE === "prototype") {
  reflection.hidden = true;
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
  let session: GameSession | undefined;
  try {
    session = await startGame(project, { target, dialogueServerUrl });
  } catch (cause) {
    errorOutput.textContent = cause instanceof AuthoringError
      ? cause.diagnostics
        .map(({ message, suggestion }) => [message, suggestion].filter(Boolean).join(" "))
        .join(" ")
      : String(cause);
  }

  if (session) {
    reflection.addEventListener("click", () => session.startReflection());
  }
}
