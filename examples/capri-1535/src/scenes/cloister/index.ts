import { type NounDefinition, type SceneDefinition } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";

export const cloister = ({
  background: backgroundUrl,
  size: { width: 640, height: 240 },
  walkableRegion: rectangle(8, 158, 632, 230),
  perspectiveScale: [{ y: 158, scale: 0.72 }, { y: 230, scale: 0.96 }],
  hotspots: [{
    target: { kind: "character", character: "brotherElia" },
    area: rectangle(382, 148, 430, 224),
    approach: { groundPoint: { x: 365, y: 208 }, facing: "right" },
  }, {
    target: { kind: "object", object: "winchHandle" },
    area: rectangle(548, 176, 598, 228),
    approach: { groundPoint: { x: 530, y: 210 }, facing: "right" },
  }, {
    target: { kind: "background" },
    area: rectangle(505, 118, 548, 230),
    approach: { groundPoint: { x: 505, y: 210 }, facing: "right" },
    noun: ({
      labels: [{ text: "Pozzo del chiostro" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        when: { variable: "wellFreed", equals: true },
        response: { text: "La carrucola gira di nuovo. Persino frate Elia sembra moderatamente soddisfatto." },
      }, {
        verb: "look-at",
        response: { text: "La carrucola è secca e il secchio trattiene la manovella presa a Raffaele." },
      }, {
        verb: "use",
        firstNoun: "oilFlask",
        response: { text: "L'olio libera la carrucola. Il secchio risale e la manovella può essere tolta." },
        operations: [
          { type: "set-variable", variable: "wellFreed", value: true },
          { type: "consume-selected-object" },
        ],
      }],
    } satisfies NounDefinition),
  }],
  entrances: {
    fromTownSquare: { groundPoint: { x: 58, y: 208 }, facing: "right" },
  },
  passages: [{
    area: rectangle(0, 78, 180, 228),
    approach: { groundPoint: { x: 160, y: 208 }, facing: "left" },
    noun: ({
      labels: [{ text: "Uscita verso la piazza" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "left",
    destination: { scene: "townSquare", entrance: "fromCloister" },
  }],
} satisfies SceneDefinition);
