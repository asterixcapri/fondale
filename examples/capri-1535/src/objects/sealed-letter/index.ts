import { type NounDefinition, type ObjectDefinition } from "fondale";

import inventoryUrl from "./inventory.png";
import sceneUrl from "./scene.png";

export const sealedLetter = ({
  // Until Raffaele hands it over, the letter is positioned against his static
  // silhouette. It has no Hotspot and therefore cannot be collected early.
  initialScene: "harbour",
  initialGroundPoint: { x: 1100, y: 500 },
  initialAppearance: "sealed",
  appearances: {
    sealed: {
      animations: {
        idle: {
          sheet: { image: sceneUrl, frames: [{ x: 0, y: 0, width: 42, height: 25 }] },
          timing: { framesPerSecond: 1, loop: true },
        },
      },
      roles: { default: "idle" },
      visualAnchor: { x: 21, y: 25 },
    },
  },
  inventoryAppearance: inventoryUrl,
  noun: ({
    labels: [{ text: "Lettera sigillata" }],
    preferredVerbs: [{ verb: "look-at" }],
    cases: [{
      verb: "look-at",
      response: { text: "La ceralacca è intatta. È destinata a Frate Elia." },
    }, {
      verb: "use",
      response: { text: "Non devo rompere il sigillo né perdere la lettera." },
    }],
  } satisfies NounDefinition),
} satisfies ObjectDefinition);
