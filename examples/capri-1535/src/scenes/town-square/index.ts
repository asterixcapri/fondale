import { defineScene } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import { townSquareNouns } from "../../nouns";
import backgroundUrl from "./background.png";

export const townSquare = defineScene({
  background: backgroundUrl,
  walkableRegion: rectangle(8, 126, 418, 180),
  perspectiveScale: [{ y: 126, scale: 0.72 }, { y: 180, scale: 0.9 }],
  hotspots: [{
    target: { kind: "background" }, area: rectangle(242, 66, 286, 142),
    approach: { groundPoint: { x: 264, y: 148 }, facing: "back" }, noun: townSquareNouns.church,
  }, {
    target: { kind: "background" }, area: rectangle(389, 129, 425, 178),
    approach: { groundPoint: { x: 374, y: 174 }, facing: "right" }, noun: townSquareNouns.cart,
  }],
  entrances: {
    fromAlley: { groundPoint: { x: 78, y: 174 }, facing: "right" },
    fromHarbour: { groundPoint: { x: 334, y: 166 }, facing: "left" },
  },
  passages: [{
    area: rectangle(0, 82, 52, 178), approach: { groundPoint: { x: 67, y: 174 }, facing: "left" },
    noun: townSquareNouns.toAlley, direction: "left", destination: { scene: "alley", entrance: "fromTownSquare" },
  }, {
    area: rectangle(337, 71, 397, 172), approach: { groundPoint: { x: 334, y: 166 }, facing: "right" },
    noun: townSquareNouns.toHarbour, direction: "right", destination: { scene: "harbour", entrance: "fromTownSquare" },
  }],
});
