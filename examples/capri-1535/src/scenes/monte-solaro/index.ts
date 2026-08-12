import { type NounDefinition, type SceneDefinition } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";

export const monteSolaro = ({
  background: backgroundUrl,
  walkableRegion: rectangle(20, 120, 396, 180),
  perspectiveScale: [{ y: 120, scale: 0.72 }, { y: 180, scale: 0.9 }],
  hotspots: [{
    target: { kind: "background" }, area: rectangle(116, 91, 285, 137),
    approach: { groundPoint: { x: 215, y: 145 }, facing: "back" },
    noun: ({
      labels: [{ text: "Orizzonte" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        when: { variable: "monteSolaroObserved", equals: true },
        response: { text: "Il mare continua a fingere di essere innocente." },
      }, {
        verb: "look-at",
        operations: [{ type: "set-variable", variable: "monteSolaroObserved", value: true }],
        sequence: "monteSolaroConclusion",
      }],
    } satisfies NounDefinition),
  }, {
    target: { kind: "background" }, area: rectangle(260, 43, 320, 154),
    approach: { groundPoint: { x: 260, y: 145 }, facing: "right" },
    noun: ({
      labels: [{ text: "Porta del posto di guardia" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        response: { text: "La porta è chiusa dall'interno." },
      }],
    } satisfies NounDefinition),
  }],
  entrances: { fromGrotto: { groundPoint: { x: 108, y: 145 }, facing: "right" } },
  passages: [{
    area: rectangle(31, 43, 104, 154), approach: { groundPoint: { x: 108, y: 145 }, facing: "left" },
    noun: ({
      labels: [{ text: "Scalinata per la grotta" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "left", destination: { scene: "grotto", entrance: "fromMonteSolaro" },
  }],
} satisfies SceneDefinition);
