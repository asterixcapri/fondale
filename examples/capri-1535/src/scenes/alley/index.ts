import { defineNoun, defineScene } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import alleyBackgroundUrl from "./background.png";
import lockedGateUrl from "./gate-locked.png";
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
        locked: {
          animations: { idle: { frames: [lockedGateUrl], framesPerSecond: 1, loop: true } },
          roles: { default: "idle" },
          visualAnchor: { x: 23, y: 25 },
        },
        unlocked: { animations: { idle: { frames: [unlockedMarkerUrl], framesPerSecond: 1, loop: true } }, roles: { default: "idle" } },
      },
      noun: defineNoun({
        labels: [
          { when: { variable: "gateOpen", equals: true }, text: "Cancello aperto" },
          { text: "Cancello chiuso" },
        ],
        preferredVerbs: [
          { when: { variable: "gateOpen", equals: true }, verb: "look-at" },
          { verb: "open" },
        ],
        secondaryVerbs: [{ verb: "look-at" }],
        cases: [
          { verb: "open", response: { text: "La serratura ha bisogno di una chiave." } },
          {
            verb: "use",
            firstNoun: "key",
            response: { text: "La chiave d'ottone apre il cancello." },
            operations: [
              { type: "set-variable", variable: "gateOpen", value: true },
              {
                type: "set-appearance",
                target: { kind: "scenery", scene: "alley", scenery: "gate" },
                appearance: "unlocked",
              },
              {
                type: "place-selected-object",
                groundPoint: { x: 217, y: 153 },
                appearance: "used",
              },
            ],
          },
        ],
      }),
    },
  },
  hotspots: [{
    target: { kind: "background" }, area: rectangle(280, 116, 310, 176),
    approach: { groundPoint: { x: 278, y: 176 }, facing: "right" },
    noun: defineNoun({
      labels: [{ text: "Viandante" }],
      preferredVerbs: [{ verb: "talk-to" }],
      secondaryVerbs: [{ verb: "look-at" }],
      objectVerbs: [{ verb: "give" }],
      cases: [{ verb: "talk-to", sequence: "conversation" }],
    }),
  }, {
    target: { kind: "object", object: "key" }, area: rectangle(104, 150, 132, 179),
    approach: { groundPoint: { x: 137, y: 175 }, facing: "left" },
  }, {
    target: { kind: "scenery", scenery: "gate" }, area: rectangle(183, 135, 235, 165),
    approach: { groundPoint: { x: 208, y: 151 }, facing: "back" },
    when: { variable: "gateOpen", equals: false },
  }],
  entrances: { fromTownSquare: { groundPoint: { x: 208, y: 152 }, facing: "front" } },
  passages: [{
    area: rectangle(183, 116, 235, 166), approach: { groundPoint: { x: 208, y: 150 }, facing: "back" },
    when: { variable: "gateOpen", equals: true },
    noun: defineNoun({
      labels: [{ text: "Verso la piazza" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    }),
    direction: "up",
    destination: { scene: "townSquare", entrance: "fromAlley" },
  }],
});
