import { defineNoun, defineScene } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import harbourBackgroundUrl from "./background.png";
import winchLubricatedUrl from "./winch-lubricated.png";
import winchRepairedUrl from "./winch-repaired.png";
import winchStuckUrl from "./winch-stuck.png";

export const harbour = defineScene({
  background: harbourBackgroundUrl,
  walkableRegion: rectangle(8, 150, 425, 180),
  perspectiveScale: [{ y: 150, scale: 0.8 }, { y: 180, scale: 0.92 }],
  scenery: {
    winch: {
      baseline: 174, position: { x: 250, y: 174 }, initialAppearance: "stuck",
      appearances: {
        stuck: { kind: "static", image: winchStuckUrl },
        lubricated: { kind: "static", image: winchLubricatedUrl },
        repaired: { kind: "static", image: winchRepairedUrl },
      },
      noun: defineNoun({
        labels: [{ text: "Argano" }],
        preferredVerbs: [{ verb: "look-at" }],
        secondaryVerbs: [{ verb: "push" }],
        cases: [
          {
            verb: "look-at",
            when: { variable: "boatReady", equals: true },
            response: { text: "La manovella gira e la corda è finalmente in tensione." },
          },
          {
            verb: "look-at",
            when: { variable: "winchLubricated", equals: true },
            response: { text: "Gli ingranaggi sono liberi. Ora manca la manovella." },
          },
          {
            verb: "look-at",
            response: { text: "Il sale ha seccato il meccanismo e la manovella è sparita." },
          },
          {
            verb: "use",
            firstNoun: "oilFlask",
            response: { text: "L'olio libera lentamente gli ingranaggi." },
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
          {
            verb: "use",
            firstNoun: "winchHandle",
            when: { variable: "winchLubricated", equals: true },
            response: { text: "La manovella entra al suo posto. Il gozzo può partire." },
            operations: [
              { type: "set-variable", variable: "boatReady", value: true },
              {
                type: "set-appearance",
                target: { kind: "scenery", scene: "harbour", scenery: "winch" },
                appearance: "repaired",
              },
              {
                type: "place-selected-object",
                groundPoint: { x: 270, y: 170 },
                appearance: "installed",
              },
            ],
          },
        ],
      }),
    },
  },
  hotspots: [{
    target: { kind: "background" }, area: rectangle(65, 111, 174, 174),
    approach: { groundPoint: { x: 180, y: 170 }, facing: "left" },
    when: { variable: "boatReady", equals: false },
    noun: defineNoun({
      labels: [{ text: "Gozzo" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        response: { text: "Il gozzo aspetta che l'argano torni a funzionare." },
      }],
    }),
  }, {
    target: { kind: "character", character: "raffaele" }, area: rectangle(304, 121, 342, 178),
    approach: { groundPoint: { x: 294, y: 172 }, facing: "right" },
  }, {
    target: { kind: "object", object: "oilFlask" }, area: rectangle(396, 145, 425, 178),
    approach: { groundPoint: { x: 389, y: 172 }, facing: "right" },
  }, {
    target: { kind: "object", object: "winchHandle" }, area: rectangle(353, 145, 393, 179),
    approach: { groundPoint: { x: 344, y: 174 }, facing: "right" },
    when: { variable: "boatReady", equals: false },
  }, {
    target: { kind: "scenery", scenery: "winch" }, area: rectangle(210, 145, 288, 179),
    approach: { groundPoint: { x: 300, y: 172 }, facing: "left" },
  }],
  entrances: {
    fromTownSquare: { groundPoint: { x: 338, y: 170 }, facing: "left" },
    fromGrotto: { groundPoint: { x: 180, y: 170 }, facing: "right" },
    fromTavern: { groundPoint: { x: 330, y: 170 }, facing: "left" },
  },
  passages: [{
    area: rectangle(65, 111, 174, 174), approach: { groundPoint: { x: 180, y: 170 }, facing: "left" },
    when: { variable: "boatReady", equals: true },
    noun: defineNoun({
      labels: [{ text: "Verso la grotta" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    }),
    direction: "left",
    destination: { scene: "grotto", entrance: "fromHarbour" },
  }, {
    area: rectangle(348, 67, 400, 166), approach: { groundPoint: { x: 338, y: 170 }, facing: "right" },
    noun: defineNoun({
      labels: [{ text: "Verso la piazza" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    }),
    direction: "right", destination: { scene: "townSquare", entrance: "fromHarbour" },
  }, {
    area: rectangle(294, 78, 336, 154), approach: { groundPoint: { x: 330, y: 170 }, facing: "back" },
    noun: defineNoun({
      labels: [{ text: "Porta della taverna" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    }),
    direction: "enter", destination: { scene: "tavern", entrance: "fromHarbour" },
  }],
});
