import { type GameProject, startGame, type GameSession } from "@asterixcapri/fondale";

import { michele } from "../../src/characters/michele";
import { italianCommandFallbacks, italianCommandLexicon } from "../../src/hud";
import { coastalFortification } from "../../src/scenes/coastal-fortification";

declare global {
  interface Window {
    __fortificationTest?: { readonly session: GameSession };
    __fortificationError?: string;
  }
}

const isolatedProject = ({
  identity: "org.asterixcapri.capri-1535-fortification-fixture",
  version: "1",
  logicalResolution: { width: 1280, height: 720 },
  scenes: { coastalFortification },
  characters: {
    michele: {
      ...michele,
      initialScene: "coastalFortification",
      initialGroundPoint: coastalFortification.entrances.fromHarbour.groundPoint,
      initialFacing: coastalFortification.entrances.fromHarbour.facing,
      movementSpeed: 400,
      dialogue: undefined,
    },
  },
  playerCharacter: "michele",
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  initialScene: "coastalFortification",
} satisfies GameProject);

try {
  const session = await startGame(isolatedProject, {
    target: document.querySelector<HTMLElement>("#game")!,
  });
  window.__fortificationTest = { session };
} catch (error) {
  window.__fortificationError = error instanceof Error ? error.message : String(error);
}
