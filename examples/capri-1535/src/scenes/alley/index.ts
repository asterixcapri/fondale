import { defineScene } from "@asterixcapri/fondale";

import alleyBackgroundUrl from "./background.png";
import unlockedMarkerUrl from "./gate-unlocked.png";
import { rectangle } from "../../geometry";

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
          label: "Parla",
          response: "Rifletti sulla strada bloccata.",
          operations: [{ type: "start-sequence", sequence: "conversation" }],
        },
      },
      inventoryUse: {
        cases: [],
        fallback: {
          outcome: "failure",
          response: "La chiave non può aiutarti qui.",
          operations: [],
        },
      },
    },
    {
      target: { kind: "object", object: "key" },
      area: rectangle(104, 183, 132, 215),
      approach: { groundPoint: { x: 137, y: 210 }, facing: "left" },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Prendi la chiave",
          response: "Prendi la chiave d'ottone.",
          operations: [{ type: "collect-target-object" }],
        },
      },
    },
    {
      target: { kind: "scenery", scenery: "gate" },
      area: rectangle(183, 135, 235, 165),
      approach: { groundPoint: { x: 208, y: 151 }, facing: "back" },
      when: { variable: "gateOpen", equals: false },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Esamina la serratura",
          response: "La serratura ha bisogno di una chiave.",
          operations: [],
        },
      },
      inventoryUse: {
        cases: [
          {
            object: "key",
            outcome: "success",
            response: "La chiave d'ottone apre il cancello.",
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
        fallback: {
          outcome: "failure",
          response: "Quell'oggetto non aprirà il cancello.",
          operations: [],
        },
      },
    },
  ],
  entrances: { fromTownSquare: { groundPoint: { x: 208, y: 152 }, facing: "front" } },
  passages: [
    {
      area: rectangle(183, 116, 235, 166),
      approach: { groundPoint: { x: 208, y: 150 }, facing: "back" },
      when: { variable: "gateOpen", equals: true },
      destination: { scene: "townSquare", entrance: "fromAlley" },
    },
  ],
});
