import { type NounDefinition, type SceneDefinition, uniformGrid } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";
import boatRockingUrl from "./boat-rocking.png";

export const coastalFortification = ({
  background: backgroundUrl,
  size: { width: 640, height: 1137 },
  walkableRegion: [
    { x: 80, y: 1136 },
    { x: 80, y: 930 },
    { x: 210, y: 860 },
    { x: 240, y: 650 },
    { x: 180, y: 620 },
    { x: 180, y: 560 },
    { x: 300, y: 520 },
    { x: 325, y: 400 },
    { x: 365, y: 340 },
    { x: 370, y: 286 },
    { x: 455, y: 286 },
    { x: 485, y: 380 },
    { x: 455, y: 540 },
    { x: 430, y: 620 },
    { x: 400, y: 680 },
    { x: 395, y: 850 },
    { x: 470, y: 920 },
    { x: 470, y: 1136 },
  ],
  perspectiveScale: [{ y: 286, scale: 0.58 }, { y: 1136, scale: 0.98 }],
  scenery: {
    arrivingBoat: {
      baseline: 560,
      position: { x: 170, y: 560 },
      initialAppearance: "approaching",
      appearances: {
        approaching: {
          animations: {
            idle: { sheet: { image: boatRockingUrl, frames: uniformGrid({ frameWidth: 64, frameHeight: 128, columns: 4, count: 4 }) }, timing: { framesPerSecond: 1 } },
            rocking: { sheet: { image: boatRockingUrl, frames: uniformGrid({ frameWidth: 64, frameHeight: 128, columns: 4, count: 4 }) }, timing: { framesPerSecond: 5, loop: true } },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 32, y: 86 },
        },
        landed: {
          animations: { rocking: { sheet: { image: boatRockingUrl, frames: uniformGrid({ frameWidth: 64, frameHeight: 128, columns: 4, count: 4 }) }, timing: { framesPerSecond: 3, loop: true } } },
          roles: { default: "rocking" },
          visualAnchor: { x: 32, y: 86 },
        },
      },
    },
  },
  hotspots: [{
    target: { kind: "background" },
    area: rectangle(350, 8, 560, 330),
    approach: { groundPoint: { x: 410, y: 306 }, facing: "back" },
    noun: ({
      labels: [{ text: "Mare dalla torre" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        when: { variable: "driftingBoatSeen", equals: true },
        response: { text: "La barca continua ad avvicinarsi agli scogli." },
      }, {
        verb: "look-at",
        sequence: "prologueConclusion",
      }],
    } satisfies NounDefinition),
  }],
  entrances: {
    fromHarbour: { groundPoint: { x: 230, y: 1080 }, facing: "back" },
  },
  arrivalSequences: [{
    entrance: "fromHarbour",
    when: { variable: "boatLanded", equals: false },
    sequence: "boatArrival",
  }],
  passages: [{
    area: rectangle(32, 970, 470, 1137),
    approach: { groundPoint: { x: 190, y: 1060 }, facing: "left" },
    noun: ({
      labels: [{ text: "Sentiero verso il gozzo" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "left",
    destination: { scene: "harbour", entrance: "fromFortification" },
  }],
} satisfies SceneDefinition);
