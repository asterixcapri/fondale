import { type NarrativeFactDefinition } from "fondale";

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
  "sailor-sailed-with-micheles-father": {
    proposition:
      "Il marinaio ferito ha navigato con il padre di Michele e lo riconosce dal viso.",
  },
  "oilskin-bundle-received": {
    proposition:
      "Il marinaio ha affidato a Michele un fagotto di tela cerata prima di svenire.",
  },
  "bundle-holds-broken-seal": {
    proposition:
      "Nel fagotto ci sono il sigillo spezzato di una nave e un frammento di registro.",
    setsVariable: "bundleOpened",
  },
  "seal-belongs-to-the-santa-marta": {
    proposition:
      "Il sigillo spezzato è quello della Santa Marta, la nave su cui si imbarcò il padre di "
      + "Michele e che si dice perduta nell'ottobre del 1533.",
    setsVariable: "sealRead",
  },
  "registry-records-amalfi-in-june-1534": {
    proposition:
      "Il frammento di registro annota la Santa Marta che scarica grano ad Amalfi nel giugno "
      + "del 1534.",
    setsVariable: "registryRead",
  },
  // The discovery that ends the prologue: it exists only as the collision of
  // the two readings, so it is committed by neither of them alone.
  "santa-marta-sailed-after-her-wreck": {
    proposition:
      "La Santa Marta scaricava ad Amalfi otto mesi dopo il naufragio che l'avrebbe inghiottita: "
      + "una delle due date mente.",
  },
} satisfies Readonly<Record<string, NarrativeFactDefinition>>);
