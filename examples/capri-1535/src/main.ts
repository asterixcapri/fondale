import {
  FakeDialogueProvider,
  startGame,
  type GameSession,
} from "@asterixcapri/fondale";

import { project } from "./game";

const target = document.querySelector<HTMLElement>("#game")!;
const restore = document.querySelector<HTMLButtonElement>("#restore")!;
const errorOutput = document.querySelector<HTMLOutputElement>("#error")!;
const reflection = document.querySelector<HTMLButtonElement>("#reflection")!;
const dialogueProvider = new FakeDialogueProvider({
  interpretations: {},
  verbalizations: {},
  reflections: {
    "Che cosa so?": {
      summary: "Sono arrivato a Capri in cerca di un lavoro onesto.",
    },
  },
});

if (import.meta.env.MODE === "prototype") {
  restore.hidden = true;
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
  let session: GameSession = await startGame(project, { target, dialogueProvider });

  reflection.addEventListener("click", () => session.startReflection());

  restore.addEventListener("click", async () => {
    const stored: unknown = JSON.parse(JSON.stringify(session.createSaveSnapshot()));
    session.stop();
    session = await startGame(project, { target, snapshot: stored, dialogueProvider });
  });
}

window.addEventListener("unhandledrejection", (event) => {
  errorOutput.textContent = String(event.reason);
});
