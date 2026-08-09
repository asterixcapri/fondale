import { defineScene } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import { monteSolaroNouns } from "../../nouns";
import backgroundUrl from "./background.png";

export const monteSolaro = defineScene({
  background: backgroundUrl,
  walkableRegion: rectangle(20, 120, 396, 180),
  perspectiveScale: [{ y: 120, scale: 0.72 }, { y: 180, scale: 0.9 }],
  hotspots: [{
    target: { kind: "background" }, area: rectangle(116, 91, 285, 137),
    approach: { groundPoint: { x: 215, y: 145 }, facing: "back" }, noun: monteSolaroNouns.horizon,
  }, {
    target: { kind: "background" }, area: rectangle(260, 43, 320, 154),
    approach: { groundPoint: { x: 260, y: 145 }, facing: "right" }, noun: monteSolaroNouns.door,
  }],
  entrances: { fromGrotto: { groundPoint: { x: 108, y: 145 }, facing: "right" } },
  passages: [{
    area: rectangle(31, 43, 104, 154), approach: { groundPoint: { x: 108, y: 145 }, facing: "left" },
    noun: monteSolaroNouns.toGrotto, direction: "left", destination: { scene: "grotto", entrance: "fromMonteSolaro" },
  }],
});
