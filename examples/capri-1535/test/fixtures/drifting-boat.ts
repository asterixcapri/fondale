import {
  type GameProject,
  type NounDefinition,
  type SceneDefinition,
  startGame,
} from "@asterixcapri/fondale";

import { michele } from "../../src/characters/michele";
import { woundedSailor } from "../../src/characters/wounded-sailor";
import { italianCommandFallbacks, italianCommandLexicon } from "../../src/hud";
import { rectangle } from "../../src/geometry";
import { driftingBoat } from "../../src/scenes/drifting-boat";

const fortificationStub = ({
  background: driftingBoat.background,
  size: { width: 1280, height: 720 },
  walkableRegion: rectangle(0, 490, 1280, 610),
  entrances: {
    fromDriftingBoat: { groundPoint: { x: 180, y: 570 }, facing: "right" },
  },
  passages: [{
    area: rectangle(1080, 470, 1280, 610),
    approach: { groundPoint: { x: 1060, y: 570 }, facing: "right" },
    noun: ({
      labels: [{ text: "Barca alla deriva" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "right",
    destination: { scene: "driftingBoat", entrance: "fromFortification" },
  }],
} satisfies SceneDefinition);

const isolatedProject = ({
  identity: "org.asterixcapri.capri-1535-drifting-boat-fixture",
  version: "1",
  logicalResolution: { width: 1280, height: 720 },
  scenes: { coastalFortification: fortificationStub, driftingBoat },
  characters: {
    michele: {
      ...michele,
      initialScene: "coastalFortification",
      initialGroundPoint: { x: 1000, y: 570 },
      dialogue: undefined,
    },
    woundedSailor,
  },
  playerCharacter: "michele",
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  initialScene: "coastalFortification",
} satisfies GameProject);

await startGame(isolatedProject, {
  target: document.querySelector<HTMLElement>("#game")!,
});
