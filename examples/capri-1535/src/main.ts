import {
  AuthoringError,
  startGame,
  type GameSession,
} from "@asterixcapri/fondale";

import { project } from "./game";

const target = document.querySelector<HTMLElement>("#game")!;
const errorOutput = document.querySelector<HTMLOutputElement>("#error")!;
const reflection = document.querySelector<HTMLButtonElement>("#reflection")!;

/**
 * Where the separately run Dialogue Server answers.
 *
 * The address is the only thing this game reads from its environment, and it is
 * not a credential: the model key, the database and every other server setting
 * are read by Node in the server's own process and never reach the browser.
 */
const dialogueServerUrl = import.meta.env.VITE_DIALOGUE_SERVER_URL
  ?? "http://127.0.0.1:4315/dialogue";

window.addEventListener("unhandledrejection", (event) => {
  errorOutput.textContent = String(event.reason);
});

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
  target.querySelector("[data-fondale-frame]")?.append(reflection);
  reflection.style.visibility = "visible";
  reflection.addEventListener("click", () => session.startReflection());
}
