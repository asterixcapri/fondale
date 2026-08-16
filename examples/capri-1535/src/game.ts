import { type GameProject } from "@asterixcapri/fondale";

import { michele } from "./characters/michele";
import { raffaele } from "./characters/raffaele";
import { capriHudTheme, italianCommandFallbacks, italianCommandLexicon } from "./hud";
import { narrativeFacts } from "./narrative-facts";
import { harbour } from "./scenes/harbour";
import { raffaeleSmallTalk } from "./sequences/raffaele-small-talk";
import { raffaeleConversation } from "./sequences/raffaele-conversation";
import { variables } from "./variables";

export const project = ({
  identity: "org.asterixcapri.capri-1535-example",
  version: "8",
  narrativeContext: "Capri in 1535, amid harbour labour, sea trade, friars, and local intrigue.",
  logicalResolution: { width: 1280, height: 720 },
  inventoryAppearanceSize: 32,
  letterboxColor: "#15101d",
  scenes: { harbour },
  characters: { michele, raffaele },
  playerCharacter: "michele",
  narrativeFacts,
  sequences: {
    raffaeleConversation,
    raffaeleSmallTalk,
  },
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  hudTheme: capriHudTheme,
  variables,
  initialScene: "harbour",
} satisfies GameProject);
