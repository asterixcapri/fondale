import { defineScene } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import { grottoNouns } from "../../nouns";
import backgroundUrl from "./background.png";

export const grotto = defineScene({
  background: backgroundUrl,
  walkableRegion: rectangle(0, 150, 426, 180),
  hotspots: [{
    target: { kind: "background" }, area: rectangle(111, 118, 198, 170),
    approach: { groundPoint: { x: 168, y: 174 }, facing: "back" }, noun: grottoNouns.water,
  }],
  entrances: {
    fromHarbour: { groundPoint: { x: 92, y: 175 }, facing: "right" },
    fromMonteSolaro: { groundPoint: { x: 225, y: 170 }, facing: "front" },
  },
  passages: [{
    area: rectangle(0, 139, 82, 178), approach: { groundPoint: { x: 88, y: 175 }, facing: "left" },
    noun: grottoNouns.toHarbour, direction: "left", destination: { scene: "harbour", entrance: "fromGrotto" },
  }, {
    area: rectangle(209, 49, 250, 149), approach: { groundPoint: { x: 225, y: 170 }, facing: "back" },
    noun: grottoNouns.toMonteSolaro, direction: "up", destination: { scene: "monteSolaro", entrance: "fromGrotto" },
  }],
});
