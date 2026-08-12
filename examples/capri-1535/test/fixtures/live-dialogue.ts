import {
  startGame,
  type CharacterDefinition,
  type GameProject,
  type GameSession,
  type SceneDefinition,
} from "@asterixcapri/fondale";

import antonioUrl from "../../src/characters/raffaele/idle.png";
import micheleUrl from "../../src/characters/brother-elia/idle.png";
import backgroundUrl from "../../src/scenes/harbour/background.png";
import { capriHudTheme, italianCommandFallbacks, italianCommandLexicon } from "../../src/hud";
import { LocalDialogueProvider } from "../../src/local-dialogue-provider";
import { logicalBackground } from "./logical-background";

/**
 * Technical Michele/Antonio fixture for the live OpenRouter spike.
 *
 * It shares nothing with the Example's canonical story: its Narrative Facts,
 * Claims, Characters and Scene exist only to observe the Knowledge-Driven
 * Dialogue experience against a real model.
 */
declare global {
  interface Window {
    __liveDialogue?: {
      readonly sessionId: string;
      session: GameSession;
    };
  }
}

const background = await logicalBackground(backgroundUrl);
const sessionId = crypto.randomUUID();
const dialogueProvider = new LocalDialogueProvider({
  endpoint: "http://127.0.0.1:4315/dialogue",
  sessionId,
});

const idle = (image: string) => ({
  animations: { idle: { frames: [image], framesPerSecond: 1, loop: true } },
  roles: { default: "idle", walking: "idle" },
});

const project = ({
  identity: "capri.live-dialogue-spike",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  initialScene: "molo",
  playerCharacter: "michele",
  narrativeFacts: {
    "catena-tagliata": {
      proposition: "La catena del porto è stata tagliata durante la notte.",
    },
    "galea-attesa": {
      proposition: "Una galea spagnola è attesa all'alba davanti ai Faraglioni.",
    },
    "antonio-sulla-santa-lucia": {
      proposition: "Antonio era a bordo della Santa Lucia la notte del taglio.",
    },
    "sabotaggio-ordinato": {
      proposition: "Antonio ha ordinato il sabotaggio della catena.",
    },
  },
  claims: {
    "antonio-nega-santa-lucia": {
      proposition: "Antonio ha passato quella notte a riparare le reti a casa sua.",
    },
  },
  variables: { confessioneSbloccata: false },
  characters: {
    michele: ({
      initialScene: "molo",
      initialGroundPoint: { x: 150, y: 200 },
      initialFacing: "right",
      initialAppearance: "idle",
      appearances: { idle: idle(micheleUrl) },
      movementSpeed: 900,
      dialogue: { knowledge: [] },
    } satisfies CharacterDefinition),
    antonio: ({
      initialScene: "molo",
      initialGroundPoint: { x: 300, y: 200 },
      initialFacing: "left",
      initialAppearance: "idle",
      appearances: { idle: idle(antonioUrl) },
      movementSpeed: 900,
      noun: {
        labels: [{ text: "Antonio" }],
        preferredVerbs: [{ verb: "talk-to" }],
        cases: [],
      },
      dialogue: {
        biography: "Pescatore del porto di Capri, pratico di barche e di silenzi.",
        personality: {
          talkativeness: "medium",
          honesty: "low",
          discretion: "high",
          suspiciousness: "high",
        },
        voice: { verbosity: "short", tone: "dry", vocabulary: "simple" },
        behavior: { withholding: "evade" },
        state: "calm",
        knowledge: [
          { factId: "catena-tagliata", disclosure: { level: "open" } },
          { factId: "galea-attesa", disclosure: { level: "open" } },
          {
            factId: "antonio-sulla-santa-lucia",
            disclosure: {
              level: "secret",
              when: { variable: "confessioneSbloccata", equals: true },
            },
          },
          {
            factId: "sabotaggio-ordinato",
            disclosure: {
              level: "secret",
              when: { variable: "confessioneSbloccata", equals: true },
            },
          },
        ],
        coverStories: [{
          concealsFactId: "antonio-sulla-santa-lucia",
          claimId: "antonio-nega-santa-lucia",
        }],
      },
    } satisfies CharacterDefinition),
  },
  scenes: {
    molo: ({
      background,
      walkableRegion: [
        { x: 8, y: 170 }, { x: 418, y: 170 }, { x: 418, y: 228 }, { x: 8, y: 228 },
      ],
      hotspots: [{
        target: { kind: "character", character: "antonio" },
        area: [{ x: 270, y: 120 }, { x: 330, y: 120 }, { x: 330, y: 215 }, { x: 270, y: 215 }],
        approach: { groundPoint: { x: 255, y: 200 }, facing: "right" },
      }],
    } satisfies SceneDefinition),
  },
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  // The canonical theme names canonical Characters, which this fixture does
  // not have; only its speech colours change here.
  hudTheme: {
    ...capriHudTheme,
    speechColors: { michele: "#f4dfb4", antonio: "#f2ad62" },
  },
} satisfies GameProject);

const target = document.querySelector<HTMLElement>("#game")!;
const live = {
  sessionId,
  session: await startGame(project, { target, dialogueProvider }),
};
window.__liveDialogue = live;

document.querySelector<HTMLButtonElement>("#reflect")!.addEventListener("click", () => {
  live.session.startReflection();
});
document.querySelector<HTMLButtonElement>("#reload")!.addEventListener("click", async () => {
  const snapshot: unknown = JSON.parse(JSON.stringify(live.session.createSaveSnapshot()));
  live.session.stop();
  live.session = await startGame(project, { target, snapshot, dialogueProvider });
});
window.addEventListener("unhandledrejection", (event) => {
  document.querySelector<HTMLOutputElement>("#error")!.textContent = String(event.reason);
});
