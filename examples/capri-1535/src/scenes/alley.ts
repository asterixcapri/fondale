import { defineScene } from "@asterixcapri/fondale";

import alleyBackgroundUrl from "../assets/backgrounds/alley.png";
import unlockedMarkerUrl from "../assets/scenery/gate/unlocked.png";
import { rectangle } from "../geometry";

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

export const alley = defineScene({
  background: alleyBackgroundUrl,
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
        locked: { kind: "background-region", area: rectangle(186, 118, 232, 150) },
        unlocked: { kind: "static", image: unlockedMarkerUrl },
      },
    },
    jar: {
      baseline: 189,
      initialAppearance: "whole",
      appearances: {
        whole: { kind: "background-region", area: rectangle(238, 158, 263, 189) },
      },
    },
  },
  hotspots: [
    {
      target: { kind: "background" },
      area: rectangle(280, 116, 310, 190),
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
      area: rectangle(104, 183, 132, 215),
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
      area: rectangle(183, 135, 235, 165),
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
      area: rectangle(186, 116, 232, 134),
      approach: { groundPoint: { x: 208, y: 150 }, facing: "back" },
      when: { variable: "gateOpen", equals: true },
      destination: { scene: "harbour", entrance: "fromAlley" },
    },
  ],
});
