import { type GameProject, startGame, type GameSession } from "@asterixcapri/fondale";

import { michele } from "../../src/characters/michele";
import { woundedSailor } from "../../src/characters/wounded-sailor";
import { italianCommandFallbacks, italianCommandLexicon } from "../../src/hud";
import { narrativeFacts } from "../../src/narrative-facts";
import { coastalFortification } from "../../src/scenes/coastal-fortification";
import { driftingBoat } from "../../src/scenes/drifting-boat";
import { boatArrival } from "../../src/sequences/boat-arrival";
import { prologueConclusion } from "../../src/sequences/prologue-conclusion";
import { variables } from "../../src/variables";

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
  scenes: { coastalFortification, driftingBoat },
  characters: {
    michele: {
      ...michele,
      initialScene: "coastalFortification",
      initialGroundPoint: coastalFortification.entrances.fromHarbour.groundPoint,
      initialFacing: coastalFortification.entrances.fromHarbour.facing,
      movementSpeed: 400,
      dialogue: undefined,
    },
    woundedSailor,
  },
  playerCharacter: "michele",
  narrativeFacts,
  sequences: { boatArrival, prologueConclusion },
  variables,
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
