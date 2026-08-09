import { defineScene } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import { harbourNouns } from "../../nouns";
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
      baseline: 174, position: { x: 250, y: 174 }, initialAppearance: "stuck", noun: harbourNouns.winch,
      appearances: {
        stuck: { kind: "static", image: winchStuckUrl },
        lubricated: { kind: "static", image: winchLubricatedUrl },
        repaired: { kind: "static", image: winchRepairedUrl },
      },
    },
  },
  hotspots: [{
    target: { kind: "background" }, area: rectangle(65, 111, 174, 174),
    approach: { groundPoint: { x: 180, y: 170 }, facing: "left" },
    when: { variable: "boatReady", equals: false }, noun: harbourNouns.boat,
  }, {
    target: { kind: "character", character: "raffaele" }, area: rectangle(304, 121, 342, 178),
    approach: { groundPoint: { x: 294, y: 172 }, facing: "right" }, noun: harbourNouns.raffaele,
  }, {
    target: { kind: "object", object: "oilFlask" }, area: rectangle(396, 145, 425, 178),
    approach: { groundPoint: { x: 389, y: 172 }, facing: "right" }, noun: harbourNouns.oilFlask,
  }, {
    target: { kind: "object", object: "winchHandle" }, area: rectangle(353, 145, 393, 179),
    approach: { groundPoint: { x: 344, y: 174 }, facing: "right" },
    when: { variable: "boatReady", equals: false }, noun: harbourNouns.winchHandle,
  }, {
    target: { kind: "scenery", scenery: "winch" }, area: rectangle(210, 145, 288, 179),
    approach: { groundPoint: { x: 300, y: 172 }, facing: "left" }, noun: harbourNouns.winch,
  }],
  entrances: {
    fromTownSquare: { groundPoint: { x: 338, y: 170 }, facing: "left" },
    fromGrotto: { groundPoint: { x: 180, y: 170 }, facing: "right" },
    fromTavern: { groundPoint: { x: 330, y: 170 }, facing: "left" },
  },
  passages: [{
    area: rectangle(65, 111, 174, 174), approach: { groundPoint: { x: 180, y: 170 }, facing: "left" },
    when: { variable: "boatReady", equals: true }, noun: harbourNouns.toGrotto, direction: "left",
    destination: { scene: "grotto", entrance: "fromHarbour" },
  }, {
    area: rectangle(348, 67, 400, 166), approach: { groundPoint: { x: 338, y: 170 }, facing: "right" },
    noun: harbourNouns.toTownSquare, direction: "right", destination: { scene: "townSquare", entrance: "fromHarbour" },
  }, {
    area: rectangle(294, 78, 336, 154), approach: { groundPoint: { x: 330, y: 170 }, facing: "back" },
    noun: harbourNouns.toTavern, direction: "enter", destination: { scene: "tavern", entrance: "fromHarbour" },
  }],
});
