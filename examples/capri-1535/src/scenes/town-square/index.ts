import { type NounDefinition, type SceneDefinition } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";

export const townSquare = ({
  background: backgroundUrl,
  size: { width: 640, height: 240 },
  walkableRegion: rectangle(8, 160, 632, 230),
  perspectiveScale: [{ y: 160, scale: 0.72 }, { y: 230, scale: 0.96 }],
  hotspots: [{
    target: { kind: "background" },
    area: rectangle(360, 42, 424, 178),
    approach: { groundPoint: { x: 375, y: 194 }, facing: "back" },
    noun: ({
      labels: [{ text: "Campanile" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        response: {
          text: "Il campanile divide la piazza dal mare. Anche quando tace, tutti sembrano ascoltarlo.",
        },
      }],
    } satisfies NounDefinition),
  }],
  entrances: {
    fromCloister: { groundPoint: { x: 300, y: 205 }, facing: "front" },
    fromHarbour: { groundPoint: { x: 594, y: 207 }, facing: "left" },
  },
  passages: [{
    area: rectangle(252, 82, 342, 178),
    approach: { groundPoint: { x: 300, y: 192 }, facing: "back" },
    noun: ({
      labels: [{ text: "Ingresso del chiostro" }],
      preferredVerbs: [{ verb: "walk-to" }],
      secondaryVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        response: { text: "Dietro la chiesa, il chiostro offre ombra, silenzio e molti pareri non richiesti." },
      }],
    } satisfies NounDefinition),
    direction: "enter",
    destination: { scene: "cloister", entrance: "fromTownSquare" },
  }, {
    area: rectangle(590, 105, 640, 226),
    approach: { groundPoint: { x: 604, y: 208 }, facing: "right" },
    noun: ({
      labels: [{ text: "Discesa verso il porto" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "right",
    destination: { scene: "harbour", entrance: "fromTownSquare" },
  }],
} satisfies SceneDefinition);
