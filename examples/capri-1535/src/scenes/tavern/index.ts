import { defineScene } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import { tavernNouns } from "../../nouns";
import backgroundUrl from "./background.png";

export const tavern = defineScene({
  background: backgroundUrl,
  walkableRegion: rectangle(30, 145, 396, 180),
  hotspots: [{
    target: { kind: "character", character: "host" }, area: rectangle(265, 92, 310, 176),
    approach: { groundPoint: { x: 250, y: 170 }, facing: "right" }, noun: tavernNouns.host,
  }, {
    target: { kind: "background" }, area: rectangle(54, 62, 112, 154),
    approach: { groundPoint: { x: 120, y: 170 }, facing: "left" }, noun: tavernNouns.closedDoor,
  }, {
    target: { kind: "background" }, area: rectangle(325, 80, 395, 155),
    approach: { groundPoint: { x: 320, y: 170 }, facing: "right" }, noun: tavernNouns.room,
  }],
  entrances: { fromHarbour: { groundPoint: { x: 210, y: 170 }, facing: "front" } },
  passages: [{
    area: rectangle(175, 62, 245, 154), approach: { groundPoint: { x: 210, y: 170 }, facing: "back" },
    noun: tavernNouns.toHarbour, direction: "enter", destination: { scene: "harbour", entrance: "fromTavern" },
  }],
});
