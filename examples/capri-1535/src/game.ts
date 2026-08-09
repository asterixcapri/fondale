import { defineGame } from "@asterixcapri/fondale";

import { michele } from "./characters/michele";
import { raffaele } from "./characters/raffaele";
import { key } from "./objects/key";
import { oilFlask } from "./objects/oil-flask";
import { winchHandle } from "./objects/winch-handle";
import { alley } from "./scenes/alley";
import { harbour } from "./scenes/harbour";
import { lookout } from "./scenes/lookout";
import { conversation } from "./sequences/conversation";
import { lookoutConclusion } from "./sequences/lookout-conclusion";
import { raffaeleConversation } from "./sequences/raffaele-conversation";

export const project = defineGame({
  identity: "org.asterixcapri.capri-1535-example",
  version: "2",
  logicalResolution: { width: 426, height: 240 },
  inventoryAppearanceSize: 32,
  letterboxColor: "#15101d",
  scenes: { alley, harbour, lookout },
  characters: { michele, raffaele },
  playerCharacter: "michele",
  objects: { key, oilFlask, winchHandle },
  sequences: { conversation, lookoutConclusion, raffaeleConversation },
  variables: {
    promiseMade: false,
    gateOpen: false,
    raffaeleMet: false,
    raffaeleImpressed: false,
    winchLubricated: false,
    boatReady: false,
    lookoutObserved: false,
  },
  initialScene: "alley",
});
