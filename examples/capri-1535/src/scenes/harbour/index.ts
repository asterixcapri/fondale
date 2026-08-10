import { defineNoun, defineScene } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";

export const harbour = defineScene({
  background: backgroundUrl,
  size: { width: 640, height: 240 },
  walkableRegion: rectangle(8, 162, 632, 230),
  perspectiveScale: [{ y: 162, scale: 0.74 }, { y: 230, scale: 0.96 }],
  hotspots: [{
    target: { kind: "character", character: "raffaele" },
    area: rectangle(408, 150, 452, 224),
    approach: { groundPoint: { x: 390, y: 208 }, facing: "right" },
  }, {
    target: { kind: "object", object: "oilFlask" },
    area: rectangle(480, 181, 520, 226),
    approach: { groundPoint: { x: 468, y: 211 }, facing: "right" },
    when: { variable: "jobAccepted", equals: true },
  }, {
    target: { kind: "background" },
    area: rectangle(505, 132, 625, 228),
    approach: { groundPoint: { x: 492, y: 211 }, facing: "right" },
    noun: defineNoun({
      labels: [{ text: "Argano del porto" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        when: { variable: "boatReady", equals: true },
        response: { text: "La manovella gira. Il piccolo gozzo per la torre può salpare." },
      }, {
        verb: "look-at",
        response: { text: "Senza la sua manovella, l'argano è soltanto un monumento alla fretta di Raffaele." },
      }, {
        verb: "use",
        firstNoun: "winchHandle",
        response: { text: "La manovella torna al suo posto. Il gozzo per la torre può salpare." },
        operations: [
          { type: "set-variable", variable: "boatReady", value: true },
          {
            type: "place-selected-object",
            groundPoint: { x: 552, y: 210 },
            appearance: "installed",
          },
        ],
      }],
    }),
  }],
  entrances: {
    fromTownSquare: { groundPoint: { x: 595, y: 210 }, facing: "left" },
    fromFortification: { groundPoint: { x: 80, y: 210 }, facing: "right" },
  },
  passages: [{
    area: rectangle(588, 90, 640, 228),
    approach: { groundPoint: { x: 602, y: 210 }, facing: "right" },
    noun: defineNoun({
      labels: [{ text: "Salita verso la piazza" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    }),
    direction: "right",
    destination: { scene: "townSquare", entrance: "fromHarbour" },
  }, {
    area: rectangle(0, 112, 180, 228),
    approach: { groundPoint: { x: 160, y: 208 }, facing: "left" },
    when: { variable: "boatReady", equals: true },
    noun: defineNoun({
      labels: [{ text: "Gozzo per la torre" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    }),
    direction: "left",
    destination: { scene: "coastalFortification", entrance: "fromHarbour" },
  }],
});
