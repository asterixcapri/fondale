import { startGame, type DialogueProvider, type GameSession } from "@asterixcapri/fondale";

import { project } from "./game";
import { LocalDialogueProvider } from "./local-dialogue-provider";

const target = document.querySelector<HTMLElement>("#game")!;
const restore = document.querySelector<HTMLButtonElement>("#restore")!;
const errorOutput = document.querySelector<HTMLOutputElement>("#error")!;
const reflection = document.querySelector<HTMLButtonElement>("#reflection")!;

const dialogueAdapterEndpoint = "http://127.0.0.1:4315/dialogue";
const adapterUnreachableMessage = [
  `Il Dialogue Provider locale non risponde su ${dialogueAdapterEndpoint}.`,
  "Avvia il database con `docker compose -f compose.dialogue-adapter.yml up -d`",
  "e l'adattatore con `npm run dev:dialogue-adapter`, poi ricarica la pagina.",
].join(" ");

window.addEventListener("unhandledrejection", (event) => {
  errorOutput.textContent = String(event.reason);
});

/**
 * The Dialogue Provider is chosen when the Example is built, never by the
 * Player: the ordinary build talks to the local adapter, while the acceptance
 * build injects a deterministic provider so the suite opens this same entry
 * point without a database, a model or the network.
 */
async function createDialogueProvider(): Promise<DialogueProvider> {
  if (import.meta.env.MODE === "acceptance") {
    const { DeterministicDialogueProvider } = await import("./deterministic-dialogue-provider");
    return new DeterministicDialogueProvider();
  }
  const provider = new LocalDialogueProvider({
    endpoint: dialogueAdapterEndpoint,
    sessionId: crypto.randomUUID(),
  });
  // Reaching the adapter once here turns an unreachable dialogue stack into an
  // instruction a human can act on, instead of a failure at the first question.
  // The cause stays on the adapter console: the browser learns only what to do.
  await provider.reset().catch(() => {
    throw new Error(adapterUnreachableMessage);
  });
  return provider;
}

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
  // Only an unreachable dialogue stack is turned into instructions here: any
  // other startup failure stays the loud failure it has always been, rather
  // than reading as though the adapter were the thing to go and fix.
  let dialogueProvider: DialogueProvider | undefined;
  try {
    dialogueProvider = await createDialogueProvider();
  } catch (cause) {
    errorOutput.textContent = cause instanceof Error ? cause.message : String(cause);
  }

  if (dialogueProvider) {
    let session: GameSession = await startGame(project, { target, dialogueProvider });

    reflection.addEventListener("click", () => session.startReflection());

    restore.addEventListener("click", async () => {
      const stored: unknown = JSON.parse(JSON.stringify(session.createSaveSnapshot()));
      session.stop();
      session = await startGame(project, { target, snapshot: stored, dialogueProvider });
    });
  }
}
