import { defineScene } from "@asterixcapri/fondale";

import backgroundUrl from "./background.png";
import { rectangle } from "../../geometry";

export const grotto = defineScene({
  background: backgroundUrl,
  walkableRegion: [
    { x: 0, y: 196 },
    { x: 70, y: 179 },
    { x: 133, y: 174 },
    { x: 214, y: 188 },
    { x: 282, y: 174 },
    { x: 356, y: 183 },
    { x: 426, y: 203 },
    { x: 426, y: 239 },
    { x: 0, y: 239 },
  ],
  perspectiveScale: [
    { y: 174, scale: 0.8 },
    { y: 239, scale: 1 },
  ],
  hotspots: [
    {
      target: { kind: "background" },
      area: rectangle(111, 118, 198, 174),
      approach: { groundPoint: { x: 168, y: 184 }, facing: "back" },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Osserva l'acqua",
          response: "Sotto l'azzurro, la roccia sembra muoversi insieme alle onde.",
          operations: [],
        },
      },
      inventoryUse: {
        cases: [],
        fallback: {
          outcome: "failure",
          response: "Meglio non affidare quell'oggetto all'acqua della grotta.",
          operations: [],
        },
      },
    },
  ],
  entrances: {
    fromHarbour: { groundPoint: { x: 92, y: 205 }, facing: "right" },
  },
  passages: [
    {
      area: rectangle(0, 139, 82, 224),
      approach: { groundPoint: { x: 88, y: 205 }, facing: "left" },
      destination: { scene: "harbour", entrance: "fromGrotto" },
    },
    {
      area: rectangle(209, 49, 250, 149),
      approach: { groundPoint: { x: 225, y: 190 }, facing: "back" },
      destination: { scene: "lookout", entrance: "fromGrotto" },
    },
  ],
});
