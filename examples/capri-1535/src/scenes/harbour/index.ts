import { defineScene } from "@asterixcapri/fondale";

import harbourBackgroundUrl from "./background.png";
import winchLubricatedUrl from "./winch-lubricated.png";
import winchRepairedUrl from "./winch-repaired.png";
import winchStuckUrl from "./winch-stuck.png";
import { rectangle } from "../../geometry";

export const harbour = defineScene({
  background: harbourBackgroundUrl,
  walkableRegion: rectangle(20, 145, 406, 239),
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
        { x: 20, y: 145 },
        { x: 166, y: 145 },
        { x: 178, y: 214 },
        { x: 30, y: 220 },
      ],
      approach: { groundPoint: { x: 184, y: 205 }, facing: "left" },
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
      area: rectangle(344, 122, 376, 210),
      approach: { groundPoint: { x: 318, y: 205 }, facing: "right" },
      primaryAction: {
        cases: [
          {
            when: { variable: "boatReady", equals: true },
            label: "Parla con Raffaele",
            response: "L'argano tiene. Prendi il gozzo e lascia il pacco al posto di vedetta.",
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
      area: rectangle(376, 187, 406, 224),
      approach: { groundPoint: { x: 362, y: 214 }, facing: "right" },
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
      area: rectangle(34, 198, 77, 239),
      approach: { groundPoint: { x: 84, y: 226 }, facing: "left" },
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
    fromAlley: { groundPoint: { x: 215, y: 185 }, facing: "front" },
    fromLookout: { groundPoint: { x: 184, y: 205 }, facing: "right" },
  },
  passages: [
    {
      area: [
        { x: 20, y: 145 },
        { x: 166, y: 145 },
        { x: 178, y: 214 },
        { x: 30, y: 220 },
      ],
      approach: { groundPoint: { x: 184, y: 205 }, facing: "left" },
      when: { variable: "boatReady", equals: true },
      destination: { scene: "lookout", entrance: "fromHarbour" },
    },
  ],
});
