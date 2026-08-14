import { type CharacterDefinition, type NounDefinition, uniformGrid } from "@asterixcapri/fondale";

import { micheleLearns } from "../learning";
import idleUrl from "./idle-v2.png";
import speakingUrl from "./speaking-v2.png";

export const raffaele = ({
  initialScene: "harbour",
  initialGroundPoint: { x: 1060, y: 535 },
  initialFacing: "left",
  initialAppearance: "working",
  appearances: {
    working: {
      animations: {
        idle: { sheets: { left: { image: idleUrl, frames: uniformGrid({ frameWidth: 96, frameHeight: 288, columns: 6, count: 6 }) }, right: { image: idleUrl, frames: uniformGrid({ frameWidth: 96, frameHeight: 288, columns: 6, count: 6 }) }, front: { image: idleUrl, frames: uniformGrid({ frameWidth: 96, frameHeight: 288, columns: 6, count: 6 }) }, back: { image: idleUrl, frames: uniformGrid({ frameWidth: 96, frameHeight: 288, columns: 6, count: 6 }) } }, timing: { framesPerSecond: 4, loop: true } },
        speaking: { sheets: { left: { image: speakingUrl, frames: uniformGrid({ frameWidth: 96, frameHeight: 288, columns: 8, count: 8 }) }, right: { image: speakingUrl, frames: uniformGrid({ frameWidth: 96, frameHeight: 288, columns: 8, count: 8 }) }, front: { image: speakingUrl, frames: uniformGrid({ frameWidth: 96, frameHeight: 288, columns: 8, count: 8 }) }, back: { image: speakingUrl, frames: uniformGrid({ frameWidth: 96, frameHeight: 288, columns: 8, count: 8 }) } }, timing: { framesPerSecond: 8, loop: true } },
      },
      roles: { default: "idle", speaking: "speaking" },
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
    }, {
      // Appended last on purpose: consumed alternatives are canonical Game State
      // recorded by index, so inserting one earlier would misread old Saves.
      text: "Due parole, se hai tempo.",
      sequence: "raffaeleSmallTalk",
      after: "resume",
    }],
  },
} satisfies CharacterDefinition);
