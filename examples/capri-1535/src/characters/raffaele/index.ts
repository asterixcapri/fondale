import { type CharacterDefinition, type NounDefinition, uniformGrid } from "@asterixcapri/fondale";

import { micheleLearns } from "../learning";
import idleUrl from "./idle.png";

const staticSheet = {
  image: idleUrl,
  frames: uniformGrid({ frameWidth: 96, frameHeight: 288, columns: 1, count: 1 }),
};

export const raffaele = ({
  initialScene: "harbour",
  initialGroundPoint: { x: 1100, y: 548 },
  initialFacing: "left",
  initialAppearance: "working",
  appearances: {
    working: {
      animations: {
        idle: {
          // Raffaele's approved package intentionally owns one static Runtime image. The public
          // four-Facing contract references that same sheet, and speaking falls back to Default.
          sheets: { left: staticSheet, right: staticSheet, front: staticSheet, back: staticSheet },
          timing: { framesPerSecond: 1, loop: true },
        },
      },
      roles: { default: "idle" },
      visualAnchor: { x: 48, y: 288 },
    },
  },
  movementSpeed: 70,
  noun: ({
    labels: [{ text: "Raffaele" }],
    preferredVerbs: [{ verb: "talk-to" }],
    secondaryVerbs: [{ verb: "look-at" }],
    objectVerbs: [{ verb: "give" }],
    // Talking to Raffaele opens his Conversation: the questions that used to be
    // Command Cases are authored alternatives inside it.
    cases: [],
  } satisfies NounDefinition),
  dialogue: {
    biography:
      "Padrone del piccolo gozzo del porto di Capri. Paga poco, paga puntuale, e ha sempre "
      + "una fretta che gli costa più di quanto risparmi.",
    personality: {
      talkativeness: "medium",
      honesty: "high",
      discretion: "low",
      suspiciousness: "medium",
    },
    voice: { verbosity: "short", tone: "dry", vocabulary: "simple" },
    behavior: { withholding: "evade" },
    state: "calm",
    relationships: { michele: { trust: "medium" } },
    knowledge: [
      { factId: "winch-lacks-its-handle", disclosure: { level: "open" } },
      { factId: "cloister-pulley-is-jammed", disclosure: { level: "open" } },
      {
        factId: "raffaele-lent-the-handle",
        disclosure: {
          level: "secret",
          when: { variable: "raffaeleTruthUnlocked", equals: true },
        },
      },
      {
        // He does not send a stranger to his own oil before the stranger works for him.
        factId: "oil-flask-lies-by-the-nets",
        disclosure: { level: "guarded", when: { variable: "jobAccepted", equals: true } },
      },
      {
        factId: "the-tower-watches-the-sea",
        disclosure: { level: "secret", when: { variable: "boatReady", equals: true } },
      },
    ],
    coverStories: [{
      concealsFactId: "raffaele-lent-the-handle",
      claimId: "friars-stole-the-handle",
    }],
    alternatives: [{
      // The engagement keeps its own Sequence: its exact wording, its branching
      // and the Game Operations that open the prologue are untouched.
      text: "Cerchi qualcuno per un lavoro?",
      when: { variable: "jobAccepted", equals: false },
      sequence: "raffaeleConversation",
      after: "resume",
    }, {
      text: "Perché l'argano non gira?",
      response: "I frati hanno rubato la manovella per il loro pozzo, e il pozzo se la tiene.",
      operations: [
        ...micheleLearns(
        "winch-lacks-its-handle",
        "cloister-pulley-is-jammed",
        ),
        {
          type: "record-testimony",
          speaker: "raffaele",
          listener: "michele",
          concealsFactId: "raffaele-lent-the-handle",
          claimId: "friars-stole-the-handle",
        },
      ],
    }, {
      text: "Dove trovo l'ampolla?",
      when: { variable: "jobAccepted", equals: true },
      response: "L'ampolla è accanto alle reti. La manovella è ancora nel chiostro.",
      operations: micheleLearns("oil-flask-lies-by-the-nets"),
    }, {
      text: "L'argano è a posto?",
      when: { variable: "boatReady", equals: true },
      response: "L'argano tiene. Sali alla torre e controlla il segnale: al ritorno ti pago.",
      operations: micheleLearns("the-tower-watches-the-sea"),
    }, {
      // Keep this established alternative at its original index: consumed
      // alternatives are canonical Game State recorded by index.
      text: "Due parole, se hai tempo.",
      when: { variable: "raffaeleConfrontationReady", equals: false },
      sequence: "raffaeleSmallTalk",
      after: "resume",
    }, {
      text: "Mi hai mentito sui frati.",
      when: { variable: "raffaeleConfrontationReady", equals: true },
      response:
        "Prestito, furto: la manovella era là e ora è qui. Non serve girarci intorno, vedo che hai capito.",
      operations: [{ type: "set-variable", variable: "raffaeleConfrontationReady", value: false }, {
        type: "set-trust", character: "raffaele", towards: "michele", trust: "low",
      }, {
        type: "set-dialogue-state", character: "raffaele", state: "angry",
      }],
    }, {
      text: "Non dirò nulla del prestito.",
      when: { variable: "raffaeleConfrontationReady", equals: true },
      response: "La discrezione tiene insieme più corde di un buon nodo. Sali alla torre.",
      operations: [{ type: "set-variable", variable: "raffaeleConfrontationReady", value: false }, {
        type: "set-trust", character: "raffaele", towards: "michele", trust: "high",
      }, {
        type: "set-dialogue-state", character: "raffaele", state: "calm",
      }],
    }, {
      text: "Il prezzo del lavoro è appena salito.",
      when: { variable: "raffaeleConfrontationReady", equals: true },
      response: "Una moneta in più per la manovella, una in meno per l'insolenza. Facciamo una in più.",
      operations: [{ type: "set-variable", variable: "raffaeleConfrontationReady", value: false }, {
        type: "set-trust", character: "raffaele", towards: "michele", trust: "medium",
      }, {
        type: "set-dialogue-state", character: "raffaele", state: "calm",
      }],
    }],
  },
} satisfies CharacterDefinition);
