import { defineScene } from "@asterixcapri/fondale";

import harbourBackgroundUrl from "./background.png";
import winchLubricatedUrl from "./winch-lubricated.png";
import winchRepairedUrl from "./winch-repaired.png";
import winchStuckUrl from "./winch-stuck.png";
import { rectangle } from "../../geometry";

export const harbour = defineScene({
  background: harbourBackgroundUrl,
  walkableRegion: rectangle(8, 164, 425, 239),
  perspectiveScale: [
    { y: 164, scale: 0.82 },
    { y: 239, scale: 1 },
  ],
  scenery: {
    winch: {
      baseline: 214,
      position: { x: 250, y: 214 },
      initialAppearance: "stuck",
      appearances: {
        stuck: { kind: "static", image: winchStuckUrl },
        lubricated: { kind: "static", image: winchLubricatedUrl },
        repaired: { kind: "static", image: winchRepairedUrl },
      },
    },
  },
  hotspots: [
    {
      target: { kind: "background" },
      area: [
        { x: 65, y: 111 },
        { x: 165, y: 111 },
        { x: 174, y: 169 },
        { x: 70, y: 174 },
      ],
      approach: { groundPoint: { x: 180, y: 190 }, facing: "left" },
      when: { variable: "boatReady", equals: false },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Esamina il gozzo",
          response: "Il gozzo non può essere messo in acqua finché l'argano è bloccato.",
          operations: [],
        },
      },
      inventoryUse: {
        cases: [],
        fallback: {
          outcome: "failure",
          response: "Quell'oggetto non farà scivolare il gozzo in mare.",
          operations: [],
        },
      },
    },
    {
      target: { kind: "character", character: "raffaele" },
      area: rectangle(304, 121, 342, 211),
      approach: { groundPoint: { x: 294, y: 205 }, facing: "right" },
      primaryAction: {
        cases: [
          {
            when: { variable: "boatReady", equals: true },
            label: "Parla con Raffaele",
            response:
              "L'argano tiene. Prendi il gozzo, attraversa la grotta e lascia il pacco al posto di vedetta.",
            operations: [],
          },
          {
            when: { variable: "winchLubricated", equals: true },
            label: "Parla con Raffaele",
            response: "Ora manca soltanto la manovella. Cerca meglio fra le reti.",
            operations: [],
          },
          {
            when: { variable: "raffaeleMet", equals: true },
            label: "Parla con Raffaele",
            response: "L'olio è vicino alle botti. La manovella era fra le reti.",
            operations: [],
          },
        ],
        fallback: {
          label: "Parla con Raffaele",
          response: "Raffaele ti squadra come se fossi già in ritardo.",
          operations: [{ type: "start-sequence", sequence: "raffaeleConversation" }],
        },
      },
      inventoryUse: {
        cases: [],
        fallback: {
          outcome: "failure",
          response: "Raffaele fa un passo indietro. «Usalo sull'argano, non su di me.»",
          operations: [],
        },
      },
    },
    {
      target: { kind: "object", object: "oilFlask" },
      area: rectangle(396, 181, 425, 220),
      approach: { groundPoint: { x: 389, y: 211 }, facing: "right" },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Prendi l'olio",
          response: "Prendi la piccola ampolla d'olio.",
          operations: [{ type: "collect-target-object" }],
        },
      },
      inventoryUse: {
        cases: [],
        fallback: {
          outcome: "failure",
          response: "Non serve usare un oggetto sull'ampolla.",
          operations: [],
        },
      },
    },
    {
      target: { kind: "object", object: "winchHandle" },
      area: rectangle(353, 202, 393, 239),
      approach: { groundPoint: { x: 344, y: 225 }, facing: "right" },
      when: { variable: "boatReady", equals: false },
      primaryAction: {
        cases: [],
        fallback: {
          label: "Prendi la manovella",
          response: "Libera la manovella dalle reti.",
          operations: [{ type: "collect-target-object" }],
        },
      },
      inventoryUse: {
        cases: [],
        fallback: {
          outcome: "failure",
          response: "Non serve usare un oggetto sulla manovella.",
          operations: [],
        },
      },
    },
    {
      target: { kind: "scenery", scenery: "winch" },
      area: rectangle(210, 154, 288, 220),
      approach: { groundPoint: { x: 300, y: 210 }, facing: "left" },
      primaryAction: {
        cases: [
          {
            when: { variable: "boatReady", equals: true },
            label: "Esamina l'argano",
            response: "La manovella gira e la corda è finalmente in tensione.",
            operations: [],
          },
          {
            when: { variable: "winchLubricated", equals: true },
            label: "Esamina l'argano",
            response: "Gli ingranaggi sono liberi. Ora manca la manovella.",
            operations: [],
          },
        ],
        fallback: {
          label: "Esamina l'argano",
          response: "Il sale ha seccato il meccanismo e la manovella è sparita.",
          operations: [],
        },
      },
      inventoryUse: {
        cases: [
          {
            object: "winchHandle",
            when: { variable: "winchLubricated", equals: true },
            outcome: "success",
            response: "La manovella entra al suo posto. Il gozzo può partire.",
            operations: [
              { type: "set-variable", variable: "boatReady", value: true },
              {
                type: "set-appearance",
                target: { kind: "scenery", scene: "harbour", scenery: "winch" },
                appearance: "repaired",
              },
              {
                type: "place-selected-object",
                groundPoint: { x: 270, y: 205 },
                appearance: "installed",
              },
            ],
          },
          {
            object: "oilFlask",
            outcome: "success",
            response: "L'olio libera lentamente gli ingranaggi.",
            operations: [
              { type: "set-variable", variable: "winchLubricated", value: true },
              {
                type: "set-appearance",
                target: { kind: "scenery", scene: "harbour", scenery: "winch" },
                appearance: "lubricated",
              },
              { type: "consume-selected-object" },
            ],
          },
        ],
        fallback: {
          outcome: "failure",
          response: "Il meccanismo è troppo secco. Prima serve dell'olio.",
          operations: [],
        },
      },
    },
  ],
  entrances: {
    fromTownSquare: { groundPoint: { x: 338, y: 181 }, facing: "left" },
    fromGrotto: { groundPoint: { x: 180, y: 190 }, facing: "right" },
    fromLookout: { groundPoint: { x: 180, y: 190 }, facing: "right" },
  },
  passages: [
    {
      area: [
        { x: 65, y: 111 },
        { x: 165, y: 111 },
        { x: 174, y: 169 },
        { x: 70, y: 174 },
      ],
      approach: { groundPoint: { x: 180, y: 190 }, facing: "left" },
      when: { variable: "boatReady", equals: true },
      destination: { scene: "grotto", entrance: "fromHarbour" },
    },
    {
      area: rectangle(348, 67, 400, 166),
      approach: { groundPoint: { x: 338, y: 181 }, facing: "right" },
      destination: { scene: "townSquare", entrance: "fromHarbour" },
    },
  ],
});
