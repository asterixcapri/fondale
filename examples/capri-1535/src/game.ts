import { type GameProject } from "@asterixcapri/fondale";

import { claims } from "./claims";
import { michele } from "./characters/michele";
import { raffaele } from "./characters/raffaele";
import { capriHudTheme, italianCommandFallbacks, italianCommandLexicon } from "./hud";
import { narrativeFacts } from "./narrative-facts";
import { oilFlask } from "./objects/oil-flask";
import { sealedLetter } from "./objects/sealed-letter";
import { harbour } from "./scenes/harbour";
import { raffaeleSmallTalk } from "./sequences/raffaele-small-talk";
import { raffaeleConversation } from "./sequences/raffaele-conversation";
import { revealOilFlask } from "./sequences/reveal-oil-flask";
import { variables } from "./variables";

export const project = ({
  identity: "org.asterixcapri.capri-1535-example",
  version: "9",
  narrativeContext: "Capri in 1535, amid harbour labour, sea trade, friars, and local intrigue.",
  logicalResolution: { width: 1280, height: 720 },
  inventoryAppearanceSize: 32,
  letterboxColor: "#15101d",
  scenes: { harbour },
  characters: { michele, raffaele },
  playerCharacter: "michele",
  narrativeFacts,
  claims,
  objects: { oilFlask, sealedLetter },
  sequences: {
    raffaeleConversation,
    raffaeleSmallTalk,
    revealOilFlask,
  },
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  hudTheme: capriHudTheme,
  variables,
  initialScene: "harbour",
} satisfies GameProject);
