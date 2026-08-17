import { type GameProject } from "@asterixcapri/fondale";

import { claims } from "./claims";
import { brotherElia } from "./characters/brother-elia";
import { michele } from "./characters/michele";
import { raffaele } from "./characters/raffaele";
import { capriHudTheme, italianCommandFallbacks, italianCommandLexicon } from "./hud";
import { narrativeFacts } from "./narrative-facts";
import { oilFlask } from "./objects/oil-flask";
import { sealedLetter } from "./objects/sealed-letter";
import { winchHandle } from "./objects/winch-handle";
import { cloister } from "./scenes/cloister";
import { coastalFortification } from "./scenes/coastal-fortification";
import { harbour } from "./scenes/harbour";
import { brotherEliaSmallTalk } from "./sequences/brother-elia-small-talk";
import { deliverLetter } from "./sequences/deliver-letter";
import { raffaeleSmallTalk } from "./sequences/raffaele-small-talk";
import { raffaeleConversation } from "./sequences/raffaele-conversation";
import { revealOilFlask } from "./sequences/reveal-oil-flask";
import { winchInstallation } from "./sequences/winch-installation";
import { freeWell } from "./sequences/free-well";
import { variables } from "./variables";

export const project = ({
  identity: "org.asterixcapri.capri-1535-example",
  version: "11",
  narrativeContext: "Capri in 1535, amid harbour labour, sea trade, friars, and local intrigue.",
  logicalResolution: { width: 1280, height: 720 },
  inventoryAppearanceSize: 32,
  letterboxColor: "#15101d",
  scenes: { harbour, cloister, coastalFortification },
  characters: { michele, raffaele, brotherElia },
  playerCharacter: "michele",
  narrativeFacts,
  claims,
  objects: { oilFlask, sealedLetter, winchHandle },
  sequences: {
    brotherEliaSmallTalk,
    deliverLetter,
    freeWell,
    raffaeleConversation,
    raffaeleSmallTalk,
    revealOilFlask,
    winchInstallation,
  },
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  hudTheme: capriHudTheme,
  variables,
  initialScene: "harbour",
} satisfies GameProject);
