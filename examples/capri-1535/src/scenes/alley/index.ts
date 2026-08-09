import { defineScene } from "@asterixcapri/fondale";

import { alleyNouns } from "../../nouns";
import { rectangle } from "../../geometry";
import alleyBackgroundUrl from "./background.png";
import unlockedMarkerUrl from "./gate-unlocked.png";

export const alley = defineScene({
  background: alleyBackgroundUrl,
  walkableRegion: rectangle(55, 146, 352, 180),
  perspectiveScale: [{ y: 146, scale: 0.55 }, { y: 180, scale: 0.82 }],
  scenery: {
    gate: {
      baseline: 150,
      position: { x: 209, y: 143 },
      initialAppearance: "locked",
      appearances: {
        locked: { kind: "background-region", area: rectangle(186, 118, 232, 150) },
        unlocked: { kind: "static", image: unlockedMarkerUrl },
      },
      noun: alleyNouns.gate,
    },
  },
  hotspots: [{
    target: { kind: "background" }, area: rectangle(280, 116, 310, 176),
    approach: { groundPoint: { x: 278, y: 176 }, facing: "right" }, noun: alleyNouns.traveller,
  }, {
    target: { kind: "object", object: "key" }, area: rectangle(104, 150, 132, 179),
    approach: { groundPoint: { x: 137, y: 175 }, facing: "left" }, noun: alleyNouns.key,
  }, {
    target: { kind: "scenery", scenery: "gate" }, area: rectangle(183, 135, 235, 165),
    approach: { groundPoint: { x: 208, y: 151 }, facing: "back" },
    when: { variable: "gateOpen", equals: false }, noun: alleyNouns.gate,
  }],
  entrances: { fromTownSquare: { groundPoint: { x: 208, y: 152 }, facing: "front" } },
  passages: [{
    area: rectangle(183, 116, 235, 166), approach: { groundPoint: { x: 208, y: 150 }, facing: "back" },
    when: { variable: "gateOpen", equals: true }, noun: alleyNouns.toTownSquare, direction: "up",
    destination: { scene: "townSquare", entrance: "fromAlley" },
  }],
});
