import { defineGame } from "@asterixcapri/fondale";

import { michele } from "./characters/michele";
import { raffaele } from "./characters/raffaele";
import { host } from "./characters/host";
import { capriHudTheme, italianCommandFallbacks, italianCommandLexicon } from "./hud";
import { key } from "./objects/key";
import { oilFlask } from "./objects/oil-flask";
import { winchHandle } from "./objects/winch-handle";
import { alley } from "./scenes/alley";
import { harbour } from "./scenes/harbour";
import { grotto } from "./scenes/grotto";
import { monteSolaro } from "./scenes/monte-solaro";
import { tavern } from "./scenes/tavern";
import { townSquare } from "./scenes/town-square";
import { conversation } from "./sequences/conversation";
import { hostConversation } from "./sequences/host-conversation";
import { monteSolaroConclusion } from "./sequences/monte-solaro-conclusion";
import { raffaeleConversation } from "./sequences/raffaele-conversation";

export const project = defineGame({
  identity: "org.asterixcapri.capri-1535-example",
  version: "4",
  logicalResolution: { width: 426, height: 240 },
  inventoryAppearanceSize: 32,
  letterboxColor: "#15101d",
  scenes: { alley, townSquare, harbour, grotto, monteSolaro, tavern },
  characters: { michele, raffaele, host },
  playerCharacter: "michele",
  objects: { key, oilFlask, winchHandle },
  sequences: { conversation, monteSolaroConclusion, raffaeleConversation, hostConversation },
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  hudTheme: capriHudTheme,
  variables: {
    promiseMade: false,
    gateOpen: false,
    raffaeleMet: false,
    raffaeleImpressed: false,
    winchLubricated: false,
    boatReady: false,
    monteSolaroObserved: false,
  },
  initialScene: "alley",
});
