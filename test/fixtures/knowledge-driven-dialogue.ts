import backgroundUrl from "./background.png";
import characterUrl from "./direction-idle.svg";
import {
  FakeDialogueProvider,
  type CharacterDefinition,
  type CommandLexicon,
  type GameProject,
  type NounDefinition,
  type SceneDefinition,
  startGame,
  type GameSession,
} from "../../src/index";

declare global {
  interface Window {
    __dialogueSession?: GameSession;
    __dialogueProvider?: FakeDialogueProvider;
  }
}

const commandLexicon = ({
  inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
  verbs: {
    open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
    "look-at": "Look at", pull: "Pull", give: "Give", "talk-to": "Talk to", use: "Use",
  },
  patterns: {
    unary: "{verb} {noun}",
    give: "{verb} {first} to {second}",
    use: "{verb} {first} with {second}",
  },
} satisfies CommandLexicon);
const fallback = { text: "That does not help." };
const talkToNoun = (character: string, label: string): NounDefinition => ({
  labels: [{ text: label }],
  preferredVerbs: [{ verb: "talk-to" }],
  cases: [{
    verb: "talk-to",
    line: { character, text: `Authored words from ${label}.` },
  }],
});
const noun = talkToNoun("antonio", "Antonio");
const appearance = {
  animations: { idle: { frames: [characterUrl], framesPerSecond: 1, loop: true } },
  roles: { default: "idle", walking: "idle" },
};
const character = (
  x: number,
  definition: Pick<CharacterDefinition, "noun" | "dialogue"> = {},
): CharacterDefinition => ({
  initialScene: "opening",
  initialGroundPoint: { x, y: 170 },
  initialFacing: "front",
  initialAppearance: "idle",
  appearances: { idle: appearance },
  movementSpeed: 900,
  ...definition,
});
const project = ({
  identity: "test.knowledge-driven-dialogue-browser",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  initialScene: "opening",
  playerCharacter: "player",
  narrativeFacts: {
    "harbour-chain-cut": { proposition: "The harbour chain was cut." },
    "antonio-ordered-sabotage": { proposition: "Antonio ordered the sabotage." },
    "antonio-on-santa-lucia": { proposition: "Antonio was aboard the Santa Lucia." },
  },
  claims: {
    "antonio-denies-santa-lucia": {
      proposition: "Antonio was never aboard the Santa Lucia.",
    },
  },
  variables: { confessionUnlocked: false, handoffReady: true },
  characters: {
    player: character(180, { dialogue: { knowledge: [] } }),
    antonio: character(315, {
      noun,
      dialogue: {
        behavior: { withholding: "evade" },
        knowledge: [{
          factId: "harbour-chain-cut",
          disclosure: { level: "open" },
        }, {
          factId: "antonio-ordered-sabotage",
          disclosure: {
            level: "secret",
            when: { variable: "confessionUnlocked", equals: true },
          },
        }, {
          factId: "antonio-on-santa-lucia",
          disclosure: {
            level: "secret",
            when: { variable: "confessionUnlocked", equals: true },
          },
        }],
        coverStories: [{
          concealsFactId: "antonio-on-santa-lucia",
          claimId: "antonio-denies-santa-lucia",
        }],
        alternatives: [{
          text: "Who cut the harbour chain?",
          response: "I never saw who cut it.",
        }, {
          text: "Where were you that night?",
          response: "At home, with the shutters closed.",
        }],
      },
    }),
    lucia: character(80, {
      noun: talkToNoun("lucia", "Lucia"),
      dialogue: {
        knowledge: [{
          factId: "harbour-chain-cut",
          disclosure: { level: "open" },
        }],
        handoffs: [{
          when: { variable: "handoffReady", equals: true },
          sequence: "luciaExactAccount",
          after: "resume",
        }],
      },
    }),
    marco: character(390, {
      noun: talkToNoun("marco", "Marco"),
      dialogue: {
        knowledge: [{
          factId: "harbour-chain-cut",
          disclosure: { level: "open" },
        }],
        handoffs: [{
          when: { variable: "handoffReady", equals: true },
          sequence: "marcoExactAccount",
          after: "close",
        }],
      },
    }),
    bystander: character(25, {
      noun: talkToNoun("bystander", "Bystander"),
    }),
  },
  sequences: {
    luciaExactAccount: {
      steps: [{
        type: "line",
        character: "lucia",
        text: "Meet me beneath the harbour clock at midnight.",
      }],
    },
    marcoExactAccount: {
      steps: [{
        type: "line",
        character: "marco",
        text: "This closes our exploratory conversation.",
      }],
    },
  },
  scenes: {
    opening: ({
      background: backgroundUrl,
      walkableRegion: [
        { x: 0, y: 100 }, { x: 426, y: 100 }, { x: 426, y: 190 }, { x: 0, y: 190 },
      ],
      hotspots: [{
        target: { kind: "character", character: "antonio" },
        area: [{ x: 285, y: 110 }, { x: 345, y: 110 }, { x: 345, y: 190 }, { x: 285, y: 190 }],
        approach: { groundPoint: { x: 275, y: 170 }, facing: "right" },
      }, {
        target: { kind: "character", character: "lucia" },
        area: [{ x: 50, y: 110 }, { x: 110, y: 110 }, { x: 110, y: 190 }, { x: 50, y: 190 }],
        approach: { groundPoint: { x: 120, y: 170 }, facing: "left" },
      }, {
        target: { kind: "character", character: "marco" },
        area: [{ x: 360, y: 110 }, { x: 425, y: 110 }, { x: 425, y: 190 }, { x: 360, y: 190 }],
        approach: { groundPoint: { x: 350, y: 170 }, facing: "right" },
      }, {
        target: { kind: "character", character: "bystander" },
        area: [{ x: 0, y: 110 }, { x: 45, y: 110 }, { x: 45, y: 190 }, { x: 0, y: 190 }],
        approach: { groundPoint: { x: 50, y: 170 }, facing: "left" },
      }],
    } satisfies SceneDefinition),
  },
  commandLexicon,
  commandFallbacks: {
    open: fallback, "pick-up": fallback, push: fallback, close: fallback,
    "look-at": fallback, pull: fallback, give: fallback, "talk-to": fallback, use: fallback,
  },
} satisfies GameProject);
const dialogueProvider = new FakeDialogueProvider({
  interpretations: {
    "Who cut the chain?": "harbour-chain-cut",
    "What happened to the chain?": "harbour-chain-cut",
    "What are you hiding?": "antonio-ordered-sabotage",
    "Were you aboard the Santa Lucia?": "antonio-on-santa-lucia",
    "I do not know what to ask.": null,
    "Wait for this answer.": {
      outcome: "pending",
      value: "harbour-chain-cut",
      ignoreCancellation: true,
    },
    "Begin the exact account.": "harbour-chain-cut",
    "Close after the exact account.": "harbour-chain-cut",
    "Wait before the exact account.": {
      outcome: "pending",
      value: "harbour-chain-cut",
      ignoreCancellation: true,
    },
  },
  verbalizations: {
    "harbour-chain-cut": "I saw the harbour chain being cut.",
    "antonio-denies-santa-lucia": "I was never aboard the Santa Lucia.",
    evade: "I would rather not say.",
    clarify: "What exactly do you want to know?",
  },
  reflections: {
    "What have I learned?": {
      summary: "I know the harbour chain was cut, and Antonio denied being aboard the Santa Lucia.",
      hypotheses: ["Antonio may know more than he admitted."],
      suggestions: ["Investigate the Santa Lucia's passenger list."],
    },
  },
});
window.__dialogueProvider = dialogueProvider;

window.__dialogueSession = await startGame(project, {
  target: document.querySelector<HTMLElement>("#game")!,
  dialogueProvider,
});
document.querySelector<HTMLButtonElement>("#reflect")!.addEventListener("click", () => {
  window.__dialogueSession?.startReflection();
});
