import {
  defineCharacter,
  defineGame,
  defineObject,
  defineScene,
  defineSequence,
  startGame,
  validateSaveSnapshot,
  type GameSession,
} from "@asterixcapri/fondale";

import keyInventoryUrl from "./assets/key-inventory.png";
import keyUrl from "./assets/key.png";
import unlockedMarkerUrl from "./assets/unlocked-marker.png";
import endingBackgroundUrl from "./assets/marina-grande.png";
import openingBackgroundUrl from "./assets/vicolo-capri.png";
import walkBackUrl from "./assets/michele-walk-back.png";
import walkFrontUrl from "./assets/michele-walk-front.png";
import walkSideUrl from "./assets/michele-walk-side.png";

const polygon = (left: number, top: number, right: number, bottom: number) => [
  { x: left, y: top },
  { x: right, y: top },
  { x: right, y: bottom },
  { x: left, y: bottom },
];

const walkableRegion = [
  { x: 55, y: 239 },
  { x: 108, y: 205 },
  { x: 140, y: 172 },
  { x: 172, y: 152 },
  { x: 186, y: 146 },
  { x: 228, y: 146 },
  { x: 250, y: 158 },
  { x: 300, y: 190 },
  { x: 340, y: 216 },
  { x: 352, y: 239 },
];

const conversation = defineSequence({
  steps: [
    { type: "line", text: "The old lock guards the road to the harbour." },
    {
      type: "choice",
      alternatives: [
        {
          text: "I will find a way through.",
          when: { variable: "promiseMade", equals: false },
          steps: [
            {
              type: "operations",
              operations: [
                { type: "set-variable", variable: "promiseMade", value: true },
                {
                  type: "set-appearance",
                  target: { kind: "character", character: "michele" },
                  appearance: "determined",
                },
              ],
            },
            { type: "line", character: "michele", text: "The key must be nearby." },
          ],
        },
      ],
      fallback: { text: "I remember what I promised.", steps: [] },
    },
  ],
});

const opening = defineScene({
  background: openingBackgroundUrl,
  walkableRegion,
  perspectiveScale: [
    { y: 146, scale: 0.55 },
    { y: 239, scale: 1 },
  ],
  scenery: {
    gate: {
      baseline: 150,
      position: { x: 209, y: 143 },
      initialAppearance: "locked",
      appearances: {
        locked: { kind: "background-region", area: polygon(186, 118, 232, 150) },
        unlocked: { kind: "static", image: unlockedMarkerUrl },
      },
    },
    jar: {
      baseline: 189,
      initialAppearance: "whole",
      appearances: {
        whole: { kind: "background-region", area: polygon(238, 158, 263, 189) },
      },
    },
  },
  hotspots: [
    {
      target: { kind: "background" },
      area: polygon(280, 116, 310, 190),
      approach: { groundPoint: { x: 278, y: 196 }, facing: "right" },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Talk",
          response: "You consider the blocked road.",
          operations: [{ type: "start-sequence", sequence: "conversation" }],
        },
      },
      inventoryUse: {
        cases: [],
        fallback: { outcome: "failure", response: "The key cannot help here.", operations: [] },
      },
    },
    {
      target: { kind: "object", object: "key" },
      area: polygon(104, 183, 132, 215),
      approach: { groundPoint: { x: 137, y: 210 }, facing: "left" },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Take key",
          response: "You take the brass key.",
          operations: [{ type: "collect-target-object" }],
        },
      },
    },
    {
      target: { kind: "scenery", scenery: "gate" },
      area: polygon(183, 135, 235, 165),
      approach: { groundPoint: { x: 208, y: 151 }, facing: "back" },
      primaryAction: {
        cases: [
          {
            when: { variable: "gateOpen", equals: true },
            label: "Inspect open gate",
            response: "The mechanism yields. The harbour road is clear.",
            behavior(context) {
              context.operations.setVariable("behaviorRan", true);
            },
          },
        ],
        fallback: { label: "Inspect lock", response: "The lock needs a key.", operations: [] },
      },
      inventoryUse: {
        cases: [
          {
            object: "key",
            outcome: "success",
            response: "The brass key opens the gate.",
            operations: [
              { type: "set-variable", variable: "gateOpen", value: true },
              {
                type: "set-appearance",
                target: { kind: "scenery", scene: "alley", scenery: "gate" },
                appearance: "unlocked",
              },
              {
                type: "place-selected-object",
                groundPoint: { x: 217, y: 153 },
                appearance: "used",
              },
            ],
          },
        ],
        fallback: { outcome: "failure", response: "That will not open the gate.", operations: [] },
      },
    },
  ],
  entrances: { fromHarbour: { groundPoint: { x: 208, y: 152 }, facing: "front" } },
  passages: [
    {
      area: polygon(186, 116, 232, 134),
      approach: { groundPoint: { x: 208, y: 150 }, facing: "back" },
      when: { variable: "gateOpen", equals: true },
      destination: { scene: "harbour", entrance: "fromAlley" },
    },
  ],
});

const harbour = defineScene({
  background: endingBackgroundUrl,
  walkableRegion: polygon(20, 145, 406, 239),
  entrances: { fromAlley: { groundPoint: { x: 215, y: 185 }, facing: "front" } },
});

const michele = defineCharacter({
  initialScene: "alley",
  initialGroundPoint: { x: 190, y: 232 },
  initialFacing: "back",
  initialAppearance: "travelling",
  appearances: {
    travelling: {
      kind: "walking",
      side: { image: walkSideUrl, frames: 8 },
      front: { image: walkFrontUrl, frames: 8 },
      back: { image: walkBackUrl, frames: 8 },
      framesPerSecond: 10,
    },
    determined: {
      kind: "walking",
      side: { image: walkSideUrl, frames: 8 },
      front: { image: walkFrontUrl, frames: 8 },
      back: { image: walkBackUrl, frames: 8 },
      framesPerSecond: 12,
    },
  },
  movementSpeed: 90,
});

const key = defineObject({
  initialScene: "alley",
  initialGroundPoint: { x: 118, y: 204 },
  initialAppearance: "unused",
  appearances: {
    unused: { kind: "static", image: keyUrl },
    used: { kind: "static", image: keyUrl },
  },
  inventoryAppearance: keyInventoryUrl,
});

const project = defineGame({
  identity: "org.asterixcapri.capri-1535-example",
  version: "1",
  logicalResolution: { width: 426, height: 240 },
  inventoryAppearanceSize: 32,
  letterboxColor: "#15101d",
  scenes: { alley: opening, harbour },
  characters: { michele },
  playerCharacter: "michele",
  objects: { key },
  sequences: { conversation },
  variables: { promiseMade: false, gateOpen: false, behaviorRan: false },
  initialScene: "alley",
});

const target = document.querySelector<HTMLElement>("#game")!;
const restore = document.querySelector<HTMLButtonElement>("#restore")!;
const errorOutput = document.querySelector<HTMLOutputElement>("#error")!;
let session: GameSession = await startGame(project, { target });

restore.addEventListener("click", async () => {
  const stored: unknown = JSON.parse(JSON.stringify(session.createSaveSnapshot()));
  session.stop();
  const result = validateSaveSnapshot(project, stored);
  if (!result.ok) throw new Error(result.diagnostics.map(({ message }) => message).join("\n"));
  session = await startGame(project, { target, snapshot: result.snapshot });
});

window.addEventListener("unhandledrejection", (event) => {
  errorOutput.textContent = String(event.reason);
});
