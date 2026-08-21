import { type NounDefinition, type SceneDefinition } from "fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";
import gozzoUrl from "./gozzo.png";
import netsCoveringUrl from "./nets-covering.png";
import netsMovedUrl from "./nets-moved.png";
import netsMovingUrl from "./nets-moving.png";
import winchInstalledUrl from "./winch-installed.png";
import winchMissingHandleUrl from "./winch-missing-handle.png";

const staticAnimation = (image: string, width: number, height: number) => ({
  animations: {
    idle: {
      sheet: { image, frames: [{ x: 0, y: 0, width, height }] },
      timing: { framesPerSecond: 1, loop: true },
    },
  },
  roles: { default: "idle" },
});

const installedWinchSheet = {
  image: winchInstalledUrl,
  frames: [{ x: 0, y: 0, width: 384, height: 255 }],
};

export const harbour = ({
  background: backgroundUrl,
  size: { width: 1920, height: 720 },
  // The far edge follows the quay's waterline, sampled from the Background:
  // water reaches y 527 at x 100, 515 at x 300, 479 at x 500, 440 at x 700 and
  // 408 at x 900, and the quay is dry from x 1100 on. The earlier straight run
  // from (90, 470) to (900, 400) cut across up to 75 points of open water, and
  // Michele could stand in it.
  walkableRegion: [
    { x: 90, y: 537 },
    { x: 300, y: 525 },
    { x: 500, y: 489 },
    { x: 700, y: 450 },
    { x: 900, y: 418 },
    { x: 1330, y: 410 },
    { x: 1810, y: 470 },
    { x: 1810, y: 540 },
    { x: 1450, y: 540 },
    { x: 1370, y: 570 },
    { x: 1210, y: 590 },
    { x: 90, y: 650 },
  ],
  perspectiveScale: [
    { y: 400, scale: 0.58 },
    { y: 520, scale: 0.8 },
    { y: 650, scale: 1 },
  ],
  scenery: {
    gozzo: {
      baseline: 462,
      position: { x: 450, y: 462 },
      initialAppearance: "moored",
      appearances: {
        moored: {
          ...staticAnimation(gozzoUrl, 500, 292),
          visualAnchor: { x: 250, y: 292 },
        },
      },
      noun: ({
        labels: [{ text: "Gozzo di Raffaele" }],
        preferredVerbs: [{ verb: "look-at" }],
        cases: [{
          verb: "look-at",
          response: { text: "Il gozzo di Raffaele è pronto per una mattina di lavoro." },
        }],
      } satisfies NounDefinition),
    },
    winch: {
      baseline: 585,
      position: { x: 1642, y: 585 },
      initialAppearance: "missingHandle",
      appearances: {
        missingHandle: {
          animations: {
            ...staticAnimation(winchMissingHandleUrl, 384, 255).animations,
            engaging: {
              sheet: installedWinchSheet,
              timing: { framesPerSecond: 1 },
            },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 192, y: 255 },
        },
        withHandle: {
          animations: {
            idle: {
              sheet: {
                image: winchMissingHandleUrl,
                frames: [{ x: 0, y: 0, width: 384, height: 255 }],
              },
              timing: { framesPerSecond: 1, loop: true },
            },
            engaging: {
              sheet: installedWinchSheet,
              timing: { framesPerSecond: 1 },
            },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 192, y: 255 },
        },
      },
      noun: ({
        labels: [
          { text: "Argano riparato", when: { variable: "winchRepaired", equals: true } },
          { text: "Argano senza manovella" },
        ],
        preferredVerbs: [{ verb: "look-at" }],
        objectVerbs: [{ verb: "use" }],
        cases: [{
          verb: "use",
          firstNoun: "winchHandle",
          when: { variable: "winchRepaired", equals: false },
          sequence: "winchInstallation",
        }, {
          verb: "look-at",
          when: { variable: "winchRepaired", equals: true },
          response: { text: "La manovella è montata saldamente. L'argano è tornato al lavoro." },
        }, {
          verb: "look-at",
          response: { text: "Un argano robusto. Sul mozzo manca la manovella." },
        }, {
          verb: "use",
          response: { text: "Qui serve proprio la manovella recuperata dal pozzo." },
        }],
      } satisfies NounDefinition),
    },
    fishingNets: {
      baseline: 613,
      position: { x: 1470, y: 613 },
      initialAppearance: "covering",
      appearances: {
        covering: {
          animations: {
            idle: {
              sheet: {
                image: netsCoveringUrl,
                frames: [{ x: 0, y: 0, width: 440, height: 178 }],
              },
              timing: { framesPerSecond: 1, loop: true },
            },
            moveAside: {
              sheet: {
                image: netsMovingUrl,
                frames: [
                  { x: 0, y: 0, width: 440, height: 178 },
                  { x: 440, y: 0, width: 440, height: 178 },
                ],
              },
              timing: { framesPerSecond: 2 },
            },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 220, y: 178 },
        },
        moved: {
          animations: {
            idle: {
              sheet: { image: netsMovedUrl, frames: [{ x: 0, y: 0, width: 440, height: 178 }] },
              timing: { framesPerSecond: 1, loop: true },
            },
            // Sequence references are validated across persistent Appearances;
            // the moved state keeps a harmless finite alias for restoration.
            moveAside: {
              sheet: { image: netsMovedUrl, frames: [{ x: 0, y: 0, width: 440, height: 178 }] },
              timing: { framesPerSecond: 1 },
            },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 220, y: 178 },
        },
      },
      noun: ({
        labels: [
          { text: "Reti da pesca spostate", when: { variable: "netsMoved", equals: true } },
          { text: "Reti da pesca" },
        ],
        preferredVerbs: [
          { verb: "pull", when: { variable: "netsMoved", equals: false } },
          { verb: "look-at" },
        ],
        secondaryVerbs: [{ verb: "look-at" }],
        cases: [{
          verb: "pull",
          when: { variable: "netsMoved", equals: false },
          sequence: "revealOilFlask",
        }, {
          verb: "look-at",
          when: { variable: "netsMoved", equals: false },
          response: { text: "Reti pesanti. Un piccolo rigonfiamento tradisce qualcosa sotto." },
        }, {
          verb: "look-at",
          response: { text: "Le reti sono ammucchiate di lato; sotto non nascondono più nulla." },
        }, {
          verb: "pull",
          response: { text: "Le reti sono già state tirate da parte." },
        }],
      } satisfies NounDefinition),
    },
    leftForeground: {
      baseline: 715,
      initialAppearance: "default",
      appearances: {
        default: {
          kind: "background-region",
          area: [{ x: 0, y: 560 }, { x: 110, y: 520 }, { x: 210, y: 720 }, { x: 0, y: 720 }],
        },
      },
    },
    rightForeground: {
      baseline: 715,
      initialAppearance: "default",
      appearances: {
        default: {
          kind: "background-region",
          area: [
            { x: 1810, y: 500 },
            { x: 1920, y: 475 },
            { x: 1920, y: 720 },
            { x: 1760, y: 720 },
          ],
        },
      },
    },
  },
  hotspots: [{
    target: { kind: "character", character: "raffaele" },
    area: rectangle(1050, 270, 1150, 548),
    approach: { groundPoint: { x: 1000, y: 550 }, facing: "right" },
  }, {
    target: { kind: "scenery", scenery: "gozzo" },
    area: rectangle(200, 170, 700, 462),
    approach: { groundPoint: { x: 720, y: 470 }, facing: "left" },
  }, {
    target: { kind: "scenery", scenery: "winch" },
    // Keep the actionable hub clear of the net heap's adjacent Hotspot.
    area: rectangle(1692, 330, 1834, 585),
    approach: { groundPoint: { x: 1370, y: 570 }, facing: "right" },
  }, {
    target: { kind: "scenery", scenery: "fishingNets" },
    area: rectangle(1250, 435, 1690, 613),
    approach: { groundPoint: { x: 1210, y: 590 }, facing: "right" },
  }, {
    target: { kind: "object", object: "oilFlask" },
    area: rectangle(1435, 545, 1505, 610),
    approach: { groundPoint: { x: 1370, y: 570 }, facing: "right" },
    when: { variable: "netsMoved", equals: true },
  }, {
    target: { kind: "background" },
    area: rectangle(1180, 350, 1390, 500),
    approach: { groundPoint: { x: 1160, y: 510 }, facing: "right" },
    noun: ({
      labels: [{ text: "Zona di lavoro" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        response: { text: "Ceste, corde e attrezzi: il porto è già al lavoro." },
      }],
    } satisfies NounDefinition),
  }],
  entrances: {
    fromCloister: { groundPoint: { x: 1760, y: 540 }, facing: "left" },
    initialQuay: { groundPoint: { x: 150, y: 560 }, facing: "right" },
  },
  passages: [{
    area: rectangle(0, 300, 85, 620),
    approach: { groundPoint: { x: 90, y: 560 }, facing: "left" },
    when: { variable: "boatReady", equals: true },
    noun: ({
      labels: [{ text: "Gozzo verso la fortificazione" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "left",
    destination: { scene: "coastalFortification", entrance: "fromHarbour" },
  }, {
    area: rectangle(1835, 300, 1920, 620),
    approach: { groundPoint: { x: 1810, y: 540 }, facing: "right" },
    noun: ({
      labels: [{ text: "Passaggio verso il chiostro" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "right",
    destination: { scene: "cloister", entrance: "fromHarbour" },
  }],
} satisfies SceneDefinition);
