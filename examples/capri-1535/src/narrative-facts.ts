import { type NarrativeFactDefinition } from "@asterixcapri/fondale";

// Propositions are written in the Example's own language, because they are
// the material a Dialogue Provider verbalises for an Italian-speaking Player
// and the material Reflection reports back to Michele.
export const narrativeFacts = ({
  "michele-arrived-in-capri": {
    proposition: "Michele è arrivato a Capri in cerca di un lavoro onesto.",
  },
  "winch-lacks-its-handle": {
    proposition: "L'argano del porto è fermo perché gli manca la manovella.",
  },
  "raffaele-lent-the-handle": {
    proposition:
      "Raffaele ha prestato volontariamente la manovella ai frati in cambio dell'acqua del pozzo.",
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
  "drifting-boat-sighting": {
    proposition:
      "Dal belvedere, Michele ha visto una barca alla deriva avvicinarsi agli scogli.",
    setsVariable: "driftingBoatSeen",
  },
} satisfies Readonly<Record<string, NarrativeFactDefinition>>);
