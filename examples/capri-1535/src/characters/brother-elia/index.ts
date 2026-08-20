import { type CharacterDefinition, type NounDefinition } from "fondale";

import { micheleLearns } from "../learning";
import idleUrl from "./idle.png";

export const brotherElia = ({
  initialScene: "cloister",
  initialGroundPoint: { x: 790, y: 620 },
  initialFacing: "left",
  initialAppearance: "welcoming",
  appearances: {
    welcoming: {
      animations: {
        idle: { sheets: { left: { image: idleUrl, frames: [{ x: 0, y: 0, width: 256, height: 256 }] }, right: { image: idleUrl, frames: [{ x: 0, y: 0, width: 256, height: 256 }] }, front: { image: idleUrl, frames: [{ x: 0, y: 0, width: 256, height: 256 }] }, back: { image: idleUrl, frames: [{ x: 0, y: 0, width: 256, height: 256 }] } }, timing: { framesPerSecond: 1, loop: true } },
      },
      roles: { default: "idle" },
      visualAnchor: { x: 128, y: 252 },
    },
  },
  movementSpeed: 60,
  noun: ({
    labels: [{ text: "Frate Elia" }],
    preferredVerbs: [{ verb: "talk-to" }],
    secondaryVerbs: [{ verb: "look-at" }],
    objectVerbs: [{ verb: "give" }],
    cases: [{
      verb: "give",
      firstNoun: "sealedLetter",
      when: { variable: "letterDelivered", equals: false },
      sequence: "deliverLetter",
      operations: [
        { type: "consume-selected-object" },
        { type: "set-variable", variable: "letterDelivered", value: true },
        { type: "set-variable", variable: "raffaeleTruthUnlocked", value: true },
        { type: "set-trust", character: "brotherElia", towards: "michele", trust: "medium" },
        ...micheleLearns(
          "raffaele-lent-the-handle",
          "cloister-pulley-is-jammed",
          "oil-frees-the-pulley",
        ),
      ],
    }],
    fallbacks: {
      give: { response: { text: "Frate Elia non ha chiesto questo oggetto." } },
    },
  } satisfies NounDefinition),
  dialogue: {
    biography:
      "Certosino del chiostro di Capri, incaricato dell'acqua e della pazienza. "
      + "Ha preso in prestito la manovella di Raffaele e non ha alcuna fretta di renderla.",
    personality: {
      talkativeness: "high",
      honesty: "high",
      discretion: "medium",
      suspiciousness: "low",
    },
    voice: { verbosity: "medium", tone: "warm", vocabulary: "formal" },
    behavior: { withholding: "withhold" },
    state: "calm",
    relationships: { michele: { trust: "low" } },
    knowledge: [
      {
        factId: "raffaele-lent-the-handle",
        disclosure: {
          level: "secret",
          when: { variable: "letterDelivered", equals: true },
        },
      },
      { factId: "cloister-pulley-is-jammed", disclosure: { level: "open" } },
      {
        // The remedy is the puzzle: he gives it once the trouble is out in the open.
        factId: "oil-frees-the-pulley",
        disclosure: { level: "guarded", when: { variable: "pulleyTroubleKnown", equals: true } },
      },
    ],
    alternatives: [{
      text: "Perché Raffaele ha mentito sulla manovella?",
      when: { variable: "letterDelivered", equals: true },
      response:
        "Per non ammettere che l'ha prestata volontariamente in cambio dell'acqua. La vanità pesa più del secchio.",
      operations: micheleLearns("raffaele-lent-the-handle"),
    }, {
      text: "Che cosa serve alla carrucola?",
      when: { variable: "pulleyTroubleKnown", equals: true },
      response: "Per il ferro preferisco l'olio: quello delle lampade, se ne trovi.",
      operations: micheleLearns("oil-frees-the-pulley"),
    }, {
      text: "La carrucola gira di nuovo.",
      when: { variable: "wellFreed", equals: true },
      response: "Il secchio è risalito e la manovella è tua. Riportala prima che Raffaele cambi mare.",
    }, {
      // Appended last on purpose: consumed alternatives are canonical Game State
      // recorded by index, so inserting one earlier would misread old Saves.
      text: "Posso trattenermi un momento?",
      sequence: "brotherEliaSmallTalk",
      after: "resume",
    }],
  },
} satisfies CharacterDefinition);
