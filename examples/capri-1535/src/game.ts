import { type GameProject } from "@asterixcapri/fondale";

import { michele } from "./characters/michele";
import { raffaele } from "./characters/raffaele";
import { capriHudTheme, italianCommandFallbacks, italianCommandLexicon } from "./hud";
import { winchHandle } from "./objects/winch-handle";
import { harbour } from "./scenes/harbour";
import { raffaeleSmallTalk } from "./sequences/raffaele-small-talk";
import { raffaeleConversation } from "./sequences/raffaele-conversation";
import { winchInstallation } from "./sequences/winch-installation";

export const project = ({
  identity: "org.asterixcapri.capri-1535-example",
  version: "8",
  logicalResolution: { width: 1280, height: 720 },
  inventoryAppearanceSize: 32,
  letterboxColor: "#15101d",
  scenes: { harbour },
  characters: { michele, raffaele },
  playerCharacter: "michele",
  // Propositions are written in the Example's own language, because they are
  // the material a Dialogue Provider verbalises for an Italian-speaking Player
  // and the material Reflection reports back to Michele.
  narrativeFacts: {
    "michele-arrived-in-capri": {
      proposition: "Michele è arrivato a Capri in cerca di un lavoro onesto.",
    },
    "winch-lacks-its-handle": {
      proposition: "L'argano del porto è fermo perché gli manca la manovella.",
    },
    "friars-took-the-handle": {
      proposition:
        "I frati hanno preso la manovella dell'argano per tirare l'acqua dal pozzo del chiostro.",
    },
    "cloister-pulley-is-jammed": {
      proposition:
        "La carrucola del pozzo del chiostro è bloccata e trattiene il secchio con la manovella.",
      setsVariable: "pulleyTroubleKnown",
    },
    "oil-frees-the-pulley": {
      proposition: "L'olio delle lampade libera la carrucola secca del pozzo.",
    },
    "oil-flask-lies-by-the-nets": {
      proposition: "Un'ampolla d'olio è posata accanto alle reti, sul molo.",
    },
    "the-tower-watches-the-sea": {
      proposition:
        "Dalla torre della fortificazione costiera si tiene d'occhio il mare aperto.",
    },
  },
  objects: { winchHandle },
  sequences: {
    raffaeleConversation,
    raffaeleSmallTalk,
    winchInstallation,
  },
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  hudTheme: capriHudTheme,
  variables: {
    jobAccepted: false,
    pulleyTroubleKnown: false,
    wellFreed: false,
    boatReady: false,
    driftingBoatSeen: false,
    boatLanded: false,
  },
  initialScene: "harbour",
} satisfies GameProject);
