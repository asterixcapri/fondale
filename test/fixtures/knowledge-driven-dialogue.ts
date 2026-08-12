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
const noun = ({
  labels: [{ text: "Antonio" }],
  preferredVerbs: [{ verb: "talk-to" }],
  cases: [{
    verb: "talk-to",
    line: { character: "antonio", text: "This authored fallback must not run." },
  }],
} satisfies NounDefinition);
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
  },
  variables: { confessionUnlocked: false },
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
        }],
      },
    }),
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
    "I do not know what to ask.": null,
    "Wait for this answer.": {
      outcome: "pending",
      value: "harbour-chain-cut",
      ignoreCancellation: true,
    },
  },
  verbalizations: {
    "harbour-chain-cut": "I saw the harbour chain being cut.",
    evade: "I would rather not say.",
    clarify: "What exactly do you want to know?",
  },
});
window.__dialogueProvider = dialogueProvider;

window.__dialogueSession = await startGame(project, {
  target: document.querySelector<HTMLElement>("#game")!,
  dialogueProvider,
});
