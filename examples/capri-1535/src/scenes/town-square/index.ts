import { defineNoun, defineScene } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";

export const townSquare = defineScene({
  background: backgroundUrl,
  walkableRegion: rectangle(8, 126, 418, 180),
  perspectiveScale: [{ y: 126, scale: 0.72 }, { y: 180, scale: 0.9 }],
  hotspots: [{
    target: { kind: "background" }, area: rectangle(242, 66, 286, 142),
    approach: { groundPoint: { x: 264, y: 148 }, facing: "back" },
    noun: defineNoun({
      labels: [{ text: "Chiesa" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        response: { text: "La chiesa domina la piazza; da dentro arriva odore d'incenso e cera." },
      }],
    }),
  }, {
    target: { kind: "background" }, area: rectangle(389, 129, 425, 178),
    approach: { groundPoint: { x: 374, y: 174 }, facing: "right" },
    noun: defineNoun({
      labels: [{ text: "Carretto" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        response: { text: "Il carretto aspetta un carico che nessuno ha fretta di consegnare." },
      }],
    }),
  }],
  entrances: {
    fromAlley: { groundPoint: { x: 78, y: 174 }, facing: "right" },
    fromHarbour: { groundPoint: { x: 334, y: 166 }, facing: "left" },
  },
  passages: [{
    area: rectangle(0, 82, 52, 178), approach: { groundPoint: { x: 67, y: 174 }, facing: "left" },
    noun: defineNoun({
      labels: [{ text: "Verso il vicolo" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    }),
    direction: "left", destination: { scene: "alley", entrance: "fromTownSquare" },
  }, {
    area: rectangle(337, 71, 397, 172), approach: { groundPoint: { x: 334, y: 166 }, facing: "right" },
    noun: defineNoun({
      labels: [{ text: "Verso il porto" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    }),
    direction: "right", destination: { scene: "harbour", entrance: "fromTownSquare" },
  }],
});
