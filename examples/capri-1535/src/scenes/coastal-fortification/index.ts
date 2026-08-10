import { defineNoun, defineScene } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";

export const coastalFortification = defineScene({
  background: backgroundUrl,
  size: { width: 640, height: 1137 },
  walkableRegion: rectangle(170, 286, 480, 1136),
  perspectiveScale: [{ y: 286, scale: 0.58 }, { y: 1136, scale: 0.98 }],
  hotspots: [{
    target: { kind: "background" },
    area: rectangle(350, 8, 560, 330),
    approach: { groundPoint: { x: 410, y: 306 }, facing: "back" },
    noun: defineNoun({
      labels: [{ text: "Mare dalla torre" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        when: { variable: "driftingBoatSeen", equals: true },
        response: { text: "La barca continua ad avvicinarsi agli scogli." },
      }, {
        verb: "look-at",
        sequence: "prologueConclusion",
      }],
    }),
  }],
  entrances: {
    fromHarbour: { groundPoint: { x: 230, y: 1080 }, facing: "back" },
  },
  passages: [{
    area: rectangle(32, 970, 470, 1137),
    approach: { groundPoint: { x: 190, y: 1060 }, facing: "left" },
    noun: defineNoun({
      labels: [{ text: "Sentiero verso il gozzo" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    }),
    direction: "left",
    destination: { scene: "harbour", entrance: "fromFortification" },
  }],
});
