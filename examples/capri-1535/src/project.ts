import { defineGame } from "@asterixcapri/fondale";

import { michele } from "./characters/michele";
import { key } from "./objects/key";
import { alley } from "./scenes/alley";
import { harbour } from "./scenes/harbour";
import { conversation } from "./sequences/conversation";

export const project = defineGame({
  identity: "org.asterixcapri.capri-1535-example",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  inventoryAppearanceSize: 32,
  letterboxColor: "#15101d",
  scenes: { alley, harbour },
  characters: { michele },
  playerCharacter: "michele",
  objects: { key },
  sequences: { conversation },
  variables: { promiseMade: false, gateOpen: false, behaviorRan: false },
  initialScene: "alley",
});
