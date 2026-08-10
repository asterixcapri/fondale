import { defineGame } from "@asterixcapri/fondale";

import { michele } from "./characters/michele";
import { raffaele } from "./characters/raffaele";
import { brotherElia } from "./characters/host";
import { capriHudTheme, italianCommandFallbacks, italianCommandLexicon } from "./hud";
import { oilFlask } from "./objects/oil-flask";
import { winchHandle } from "./objects/winch-handle";
import { cloister } from "./scenes/cloister";
import { coastalFortification } from "./scenes/coastal-fortification";
import { harbour } from "./scenes/harbour";
import { townSquare } from "./scenes/town-square";
import { brotherEliaConversation } from "./sequences/host-conversation";
import { prologueConclusion } from "./sequences/monte-solaro-conclusion";
import { raffaeleConversation } from "./sequences/raffaele-conversation";

export const project = defineGame({
  identity: "org.asterixcapri.capri-1535-example",
  version: "5",
  logicalResolution: { width: 426, height: 240 },
  inventoryAppearanceSize: 32,
  letterboxColor: "#15101d",
  scenes: { townSquare, cloister, harbour, coastalFortification },
  characters: { michele, raffaele, brotherElia },
  playerCharacter: "michele",
  objects: { oilFlask, winchHandle },
  sequences: { raffaeleConversation, brotherEliaConversation, prologueConclusion },
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  hudTheme: capriHudTheme,
  variables: {
    jobAccepted: false,
    wellFreed: false,
    boatReady: false,
    driftingBoatSeen: false,
  },
  initialScene: "townSquare",
});
