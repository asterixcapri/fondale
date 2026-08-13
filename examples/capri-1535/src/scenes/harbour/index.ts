import { type NounDefinition, type SceneDefinition } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";
import harbourBoatUrl from "./harbour-boat.png";
import winchWithHandleUrl from "./winch-with-handle.png";
import winchWithoutHandleUrl from "./winch-without-handle.png";

export const harbour = ({
  background: backgroundUrl,
  size: { width: 1920, height: 720 },
  walkableRegion: [
    { x: 24, y: 438 },
    { x: 250, y: 402 },
    { x: 500, y: 377 },
    { x: 790, y: 392 },
    { x: 1080, y: 407 },
    { x: 1370, y: 390 },
    { x: 1450, y: 420 },
    { x: 1450, y: 690 },
    { x: 30, y: 690 },
  ],
  perspectiveScale: [
    { y: 410, scale: 0.7 },
    { y: 535, scale: 1 },
    { y: 645, scale: 1 },
  ],
  scenery: {
    harbourBoat: {
      baseline: 390,
      position: { x: 480, y: 390 },
      initialAppearance: "moored",
      appearances: {
        moored: {
          animations: {
            idle: { frames: [harbourBoatUrl], framesPerSecond: 1, loop: true },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 260, y: 235 },
        },
      },
      noun: ({
        labels: [{ text: "Barca ormeggiata" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{
          verb: "look-at",
          response: { text: "Una barca da lavoro, legata stretta al molo." },
        }],
      } satisfies NounDefinition),
    },
    winch: {
      baseline: 505,
      position: { x: 1630, y: 505 },
      initialAppearance: "withoutHandle",
      appearances: {
        withoutHandle: {
          animations: {
            idle: { frames: [winchWithoutHandleUrl], framesPerSecond: 1, loop: true },
            engaging: { frames: [winchWithoutHandleUrl], framesPerSecond: 1 },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 120, y: 164 },
        },
        withHandle: {
          animations: {
            idle: { frames: [winchWithHandleUrl], framesPerSecond: 1, loop: true },
            engaging: { frames: [winchWithHandleUrl], framesPerSecond: 1 },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 120, y: 164 },
        },
      },
      noun: ({
        labels: [{ text: "Argano del porto" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{
          verb: "look-at",
          when: { variable: "boatReady", equals: true },
          response: { text: "La manovella è al suo posto. L'argano può tornare a lavorare." },
        }, {
          verb: "look-at",
          response: { text: "L'argano è robusto, ma senza manovella non può girare." },
        }, {
          verb: "use",
          firstNoun: "winchHandle",
          sequence: "winchInstallation",
        }],
      } satisfies NounDefinition),
    },
    leftForeground: {
      baseline: 716,
      initialAppearance: "default",
      appearances: {
        default: {
          kind: "background-region",
          area: [{ x: 0, y: 438 }, { x: 90, y: 426 }, { x: 210, y: 720 }, { x: 0, y: 720 }],
        },
      },
    },
    rightForeground: {
      baseline: 716,
      initialAppearance: "default",
      appearances: {
        default: {
          kind: "background-region",
          area: [
            { x: 1800, y: 432 },
            { x: 1920, y: 440 },
            { x: 1920, y: 720 },
            { x: 1740, y: 720 },
          ],
        },
      },
    },
  },
  hotspots: [{
    target: { kind: "character", character: "raffaele" },
    area: rectangle(1008, 240, 1112, 540),
    approach: { groundPoint: { x: 1000, y: 535 }, facing: "right" },
  }, {
    target: { kind: "object", object: "winchHandle" },
    area: rectangle(890, 540, 950, 610),
    approach: { groundPoint: { x: 860, y: 585 }, facing: "right" },
  }, {
    target: { kind: "scenery", scenery: "harbourBoat" },
    area: rectangle(220, 155, 740, 390),
    approach: { groundPoint: { x: 720, y: 425 }, facing: "back" },
  }, {
    target: { kind: "scenery", scenery: "winch" },
    area: rectangle(1510, 341, 1750, 505),
    approach: { groundPoint: { x: 1390, y: 525 }, facing: "right" },
  }],
} satisfies SceneDefinition);
