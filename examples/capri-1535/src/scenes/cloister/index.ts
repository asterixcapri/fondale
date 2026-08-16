import { type NounDefinition, type SceneDefinition } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";
import seizedWellUrl from "./well-seized.png";

const seizedWellNoun = ({
  labels: [{ text: "Pozzo del chiostro" }],
  preferredVerbs: [{ verb: "look-at" }],
  secondaryVerbs: [{ verb: "pull" }],
  cases: [{
    verb: "look-at",
    response: {
      text: "La corda è in tensione, il secchio pesa e la carrucola non gira. La manovella è ancora montata sull'asse.",
    },
  }, {
    verb: "pull",
    response: {
      text: "La carrucola è troppo secca. Tirare più forte tenderebbe soltanto la corda.",
    },
  }],
} satisfies NounDefinition);

/** The fixed 1280×720 afternoon stage; it imports no neighbouring Scene package. */
export const cloister = ({
  background: backgroundUrl,
  size: { width: 1280, height: 720 },
  walkableRegion: [
    { x: 50, y: 470 },
    { x: 820, y: 470 },
    { x: 850, y: 600 },
    { x: 820, y: 690 },
    { x: 50, y: 690 },
  ],
  perspectiveScale: [
    { y: 470, scale: 0.72 },
    { y: 570, scale: 0.86 },
    { y: 690, scale: 1 },
  ],
  scenery: {
    seizedWell: {
      baseline: 630,
      position: { x: 1022, y: 630 },
      initialAppearance: "seized",
      appearances: {
        seized: {
          animations: {
            idle: {
              sheet: {
                image: seizedWellUrl,
                frames: [{ x: 0, y: 0, width: 295, height: 360 }],
              },
              timing: { framesPerSecond: 1, loop: true },
            },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 147, y: 360 },
        },
      },
      noun: seizedWellNoun,
    },
    leftArcadeForeground: {
      baseline: 610,
      initialAppearance: "default",
      appearances: {
        default: {
          kind: "background-region",
          area: [
            { x: 0, y: 0 },
            { x: 150, y: 0 },
            { x: 150, y: 440 },
            { x: 260, y: 440 },
            { x: 310, y: 560 },
            { x: 260, y: 610 },
            { x: 0, y: 610 },
          ],
        },
      },
    },
  },
  hotspots: [{
    target: { kind: "character", character: "brotherElia" },
    area: rectangle(750, 394, 828, 622),
    approach: { groundPoint: { x: 680, y: 600 }, facing: "right" },
  }, {
    target: { kind: "scenery", scenery: "seizedWell" },
    area: rectangle(875, 270, 1170, 630),
    approach: { groundPoint: { x: 850, y: 600 }, facing: "right" },
  }],
  entrances: {
    fromHarbour: { groundPoint: { x: 170, y: 610 }, facing: "right" },
    fromTownSquare: { groundPoint: { x: 170, y: 610 }, facing: "right" },
  },
  passages: [{
    area: rectangle(0, 260, 130, 610),
    approach: { groundPoint: { x: 145, y: 560 }, facing: "left" },
    noun: ({
      labels: [{ text: "Passaggio verso il porto" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "left",
    destination: { scene: "harbour", entrance: "fromCloister" },
  }],
} satisfies SceneDefinition);
