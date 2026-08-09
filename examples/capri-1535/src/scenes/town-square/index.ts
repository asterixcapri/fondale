import { defineScene } from "@asterixcapri/fondale";

import backgroundUrl from "./background.png";
import { rectangle } from "../../geometry";

export const townSquare = defineScene({
  background: backgroundUrl,
  walkableRegion: [
    { x: 8, y: 144 },
    { x: 88, y: 136 },
    { x: 168, y: 126 },
    { x: 314, y: 126 },
    { x: 408, y: 154 },
    { x: 425, y: 239 },
    { x: 0, y: 239 },
  ],
  perspectiveScale: [
    { y: 126, scale: 0.72 },
    { y: 239, scale: 1 },
  ],
  hotspots: [
    {
      target: { kind: "background" },
      area: rectangle(242, 66, 286, 142),
      approach: { groundPoint: { x: 264, y: 148 }, facing: "back" },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Esamina la chiesa",
          response: "La chiesa domina la piazza. Da dentro arriva odore d'incenso e cera.",
          operations: [],
        },
      },
      inventoryUse: {
        cases: [],
        fallback: {
          outcome: "failure",
          response: "Non serve usare quell'oggetto sulla porta della chiesa.",
          operations: [],
        },
      },
    },
    {
      target: { kind: "background" },
      area: rectangle(389, 129, 425, 179),
      approach: { groundPoint: { x: 374, y: 174 }, facing: "right" },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Esamina il carretto",
          response: "Il carretto aspetta un carico che nessuno sembra avere fretta di consegnare.",
          operations: [],
        },
      },
      inventoryUse: {
        cases: [],
        fallback: {
          outcome: "failure",
          response: "Il carretto non ha bisogno di quell'oggetto.",
          operations: [],
        },
      },
    },
  ],
  entrances: {
    fromAlley: { groundPoint: { x: 78, y: 184 }, facing: "right" },
    fromHarbour: { groundPoint: { x: 334, y: 166 }, facing: "left" },
  },
  passages: [
    {
      area: rectangle(0, 82, 52, 187),
      approach: { groundPoint: { x: 67, y: 181 }, facing: "left" },
      destination: { scene: "alley", entrance: "fromTownSquare" },
    },
    {
      area: rectangle(337, 71, 397, 172),
      approach: { groundPoint: { x: 334, y: 166 }, facing: "right" },
      destination: { scene: "harbour", entrance: "fromTownSquare" },
    },
  ],
});
