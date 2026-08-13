import { type CharacterDefinition, type NounDefinition } from "@asterixcapri/fondale";

import { micheleLearns } from "../learning";
import idleUrl from "./idle.png";

export const raffaele = ({
  initialScene: "harbour",
  initialGroundPoint: { x: 430, y: 205 },
  initialFacing: "left",
  initialAppearance: "working",
  appearances: {
    working: { animations: { idle: { frames: [idleUrl], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
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
    knowledge: [
      { factId: "winch-lacks-its-handle", disclosure: { level: "open" } },
      { factId: "friars-took-the-handle", disclosure: { level: "open" } },
      { factId: "cloister-pulley-is-jammed", disclosure: { level: "open" } },
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
    alternatives: [{
      // The engagement keeps its own Sequence: its exact wording, its branching
      // and the Game Operations that open the prologue are untouched.
      text: "Cerchi qualcuno per un lavoro?",
      when: { variable: "jobAccepted", equals: false },
      sequence: "raffaeleConversation",
      after: "resume",
    }, {
      text: "Perché l'argano non gira?",
      response: "I frati si sono presi la manovella per il loro pozzo, e il pozzo se la tiene.",
      operations: micheleLearns(
        "winch-lacks-its-handle",
        "friars-took-the-handle",
        "cloister-pulley-is-jammed",
      ),
    }, {
      text: "Dove trovo l'ampolla?",
      when: { variable: "jobAccepted", equals: true },
      response: "L'ampolla è accanto alle reti. La manovella è ancora nel chiostro.",
      operations: micheleLearns("oil-flask-lies-by-the-nets", "friars-took-the-handle"),
    }, {
      text: "L'argano è a posto?",
      when: { variable: "boatReady", equals: true },
      response: "L'argano tiene. Sali alla torre e controlla il segnale: al ritorno ti pago.",
      operations: micheleLearns("the-tower-watches-the-sea"),
    }],
  },
} satisfies CharacterDefinition);
