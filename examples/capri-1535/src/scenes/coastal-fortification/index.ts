import { type NounDefinition, type SceneDefinition } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";
import boatRockingUrl from "./boat-rocking.png";
import leftForegroundUrl from "./left-foreground.png";
import rightForegroundUrl from "./right-foreground.png";

const staticAnimation = (image: string, width: number, height: number) => ({
  animations: {
    idle: {
      sheet: { image, frames: [{ x: 0, y: 0, width, height }] },
      timing: { framesPerSecond: 1, loop: true },
    },
  },
  roles: { default: "idle" },
});

const lookoutNoun = ({
  labels: [{ text: "Belvedere della fortificazione" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{
    verb: "look-at",
    when: { variable: "driftingBoatSeen", equals: false },
    sequence: "prologueConclusion",
  }, {
    verb: "look-at",
    response: {
      text: "La barca alla deriva dondola presso gli scogli, sotto il belvedere.",
    },
  }],
} satisfies NounDefinition);

const openSeaNoun = ({
  labels: [{ text: "Mare al tramonto" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{
    verb: "look-at",
    response: {
      text: "La luce radente disegna una via dorata sul mare ancora vuoto.",
    },
  }],
} satisfies NounDefinition);

const lowerLandingNoun = ({
  labels: [{ text: "Piazzola del sentiero" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{
    verb: "look-at",
    response: {
      text: "La piazzola riparata segna l'inizio della salita alla torre.",
    },
  }],
} satisfies NounDefinition);

const rockingFrames = [
  { x: 0, y: 0, width: 64, height: 128 },
  { x: 64, y: 0, width: 64, height: 128 },
  { x: 128, y: 0, width: 64, height: 128 },
  { x: 192, y: 0, width: 64, height: 128 },
];

/**
 * The golden-hour vertical climb. The upper-left sea hosts the arriving
 * boat Scenery: it drifts in through the arrival Sequence and remains
 * landed by the rocks once the sighting is committed.
 */
export const coastalFortification = ({
  background: backgroundUrl,
  size: { width: 1280, height: 1440 },
  walkableRegion: [
    { x: 180, y: 1400 },
    { x: 1040, y: 1400 },
    { x: 975, y: 900 },
    { x: 950, y: 900 },
    { x: 950, y: 650 },
    { x: 1040, y: 650 },
    { x: 1040, y: 220 },
    { x: 700, y: 220 },
    { x: 700, y: 500 },
    { x: 480, y: 560 },
    { x: 480, y: 720 },
    { x: 620, y: 780 },
    { x: 560, y: 900 },
    { x: 250, y: 900 },
    { x: 250, y: 1120 },
    { x: 180, y: 1390 },
  ],
  perspectiveScale: [
    { y: 220, scale: 0.58 },
    { y: 720, scale: 0.78 },
    { y: 1380, scale: 0.95 },
  ],
  scenery: {
    arrivingBoat: {
      baseline: 560,
      position: { x: 170, y: 560 },
      initialAppearance: "approaching",
      appearances: {
        approaching: {
          animations: {
            idle: {
              sheet: { image: boatRockingUrl, frames: rockingFrames },
              timing: { framesPerSecond: 1, loop: true },
            },
            rocking: {
              sheet: { image: boatRockingUrl, frames: rockingFrames },
              timing: { framesPerSecond: 3, loop: true },
            },
          },
          roles: { default: "rocking" },
          visualAnchor: { x: 32, y: 86 },
        },
        landed: {
          animations: {
            idle: {
              sheet: { image: boatRockingUrl, frames: rockingFrames },
              timing: { framesPerSecond: 1, loop: true },
            },
            rocking: {
              sheet: { image: boatRockingUrl, frames: rockingFrames },
              timing: { framesPerSecond: 2, loop: true },
            },
          },
          roles: { default: "rocking" },
          visualAnchor: { x: 32, y: 86 },
        },
      },
    },
    leftForegroundParapet: {
      baseline: 1390,
      position: { x: 0, y: 1440 },
      initialAppearance: "default",
      appearances: {
        default: {
          ...staticAnimation(leftForegroundUrl, 300, 600),
          visualAnchor: { x: 0, y: 600 },
        },
      },
    },
    rightForegroundRocks: {
      baseline: 1410,
      position: { x: 1280, y: 1440 },
      initialAppearance: "default",
      appearances: {
        default: {
          ...staticAnimation(rightForegroundUrl, 400, 740),
          visualAnchor: { x: 400, y: 740 },
        },
      },
    },
  },
  hotspots: [{
    target: { kind: "background" },
    area: rectangle(650, 100, 1060, 430),
    approach: { groundPoint: { x: 850, y: 230 }, facing: "left" },
    noun: lookoutNoun,
  }, {
    target: { kind: "background" },
    area: rectangle(40, 140, 570, 570),
    approach: { groundPoint: { x: 700, y: 500 }, facing: "left" },
    noun: {
      ...openSeaNoun,
      cases: [{
        verb: "look-at",
        when: { variable: "boatLanded", equals: true },
        response: {
          text: "Una barca senza timoniere dondola vicino agli scogli, trattenuta dalla corrente.",
        },
      }, ...openSeaNoun.cases],
    },
  }, {
    target: { kind: "background" },
    area: rectangle(250, 1120, 900, 1400),
    approach: { groundPoint: { x: 540, y: 1320 }, facing: "front" },
    noun: lowerLandingNoun,
  }],
  entrances: {
    fromHarbour: { groundPoint: { x: 540, y: 1320 }, facing: "back" },
    atLookout: { groundPoint: { x: 850, y: 230 }, facing: "left" },
    fromDriftingBoat: { groundPoint: { x: 300, y: 1260 }, facing: "right" },
  },
  arrivalSequences: [{
    entrance: "fromHarbour",
    when: { variable: "boatLanded", equals: false },
    sequence: "boatArrival",
  }],
  passages: [{
    area: rectangle(0, 1120, 160, 1400),
    approach: { groundPoint: { x: 300, y: 1260 }, facing: "left" },
    when: { variable: "driftingBoatSeen", equals: true },
    noun: ({
      labels: [{ text: "Scaletta verso gli scogli" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "left",
    destination: { scene: "driftingBoat", entrance: "fromFortification" },
  }],
} satisfies SceneDefinition);
