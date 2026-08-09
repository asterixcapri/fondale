import { defineScene } from "@asterixcapri/fondale";

import backgroundUrl from "./background.png";
import { rectangle } from "../../geometry";

export const lookout = defineScene({
  background: backgroundUrl,
  walkableRegion: [
    { x: 20, y: 132 },
    { x: 104, y: 132 },
    { x: 128, y: 120 },
    { x: 286, y: 120 },
    { x: 316, y: 132 },
    { x: 396, y: 132 },
    { x: 396, y: 239 },
    { x: 20, y: 239 },
  ],
  perspectiveScale: [
    { y: 120, scale: 0.72 },
    { y: 239, scale: 1 },
  ],
  hotspots: [
    {
      target: { kind: "background" },
      area: rectangle(116, 91, 285, 137),
      approach: { groundPoint: { x: 215, y: 135 }, facing: "back" },
      primaryAction: {
        cases: [
          {
            when: { variable: "lookoutObserved", equals: true },
            label: "Osserva ancora",
            response: "All'orizzonte il mare continua a fingere di essere innocente.",
            operations: [],
          },
        ],
        fallback: {
          label: "Osserva l'orizzonte",
          response: "Michele si avvicina al parapetto.",
          behavior(context) {
            context.operations.setVariable("lookoutObserved", true);
            context.operations.startSequence("lookoutConclusion");
          },
        },
      },
      inventoryUse: {
        cases: [],
        fallback: {
          outcome: "failure",
          response: "Non serve usare quell'oggetto per guardare il mare.",
          operations: [],
        },
      },
    },
    {
      target: { kind: "background" },
      area: rectangle(31, 43, 104, 154),
      approach: { groundPoint: { x: 108, y: 145 }, facing: "left" },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Esamina la porta",
          response: "La porta del posto di guardia è chiusa dall'interno.",
          operations: [],
        },
      },
      inventoryUse: {
        cases: [],
        fallback: {
          outcome: "failure",
          response: "Quell'oggetto non convincerà la porta ad aprirsi.",
          operations: [],
        },
      },
    },
  ],
  entrances: {
    fromHarbour: { groundPoint: { x: 340, y: 145 }, facing: "left" },
  },
  passages: [
    {
      area: rectangle(286, 48, 383, 158),
      approach: { groundPoint: { x: 340, y: 145 }, facing: "right" },
      destination: { scene: "harbour", entrance: "fromLookout" },
    },
  ],
});
