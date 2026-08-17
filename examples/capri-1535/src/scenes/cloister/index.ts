import { type NounDefinition, type SceneDefinition } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";
import freedWellUrl from "./well-freed.png";
import wellFreeingUrl from "./well-freeing.png";
import lubricatedWellUrl from "./well-lubricated.png";
import seizedWellUrl from "./well-seized.png";

const wellNoun = ({
  labels: [
    { text: "Pozzo liberato", when: { variable: "wellFreed", equals: true } },
    { text: "Pozzo lubrificato", when: { variable: "wellLubricated", equals: true } },
    { text: "Pozzo del chiostro" },
  ],
  preferredVerbs: [
    { verb: "look-at", when: { variable: "letterDelivered", equals: false } },
    { verb: "pull", when: { variable: "wellFreed", equals: false } },
    { verb: "look-at" },
  ],
  secondaryVerbs: [{ verb: "pull" }],
  objectVerbs: [{ verb: "use" }],
  cases: [{
    verb: "look-at",
    when: { variable: "wellFreed", equals: true },
    response: {
      text: "Il secchio è risalito, la corda è allentata e il mozzo ha lasciato libera la manovella.",
    },
  }, {
    verb: "look-at",
    when: { variable: "wellLubricated", equals: true },
    response: {
      text: "L'olio luccica sul supporto della carrucola. Ora resta da tirare la corda.",
    },
  }, {
    verb: "look-at",
    response: {
      text: "La corda è in tensione, il secchio pesa e la carrucola non gira. La manovella è ancora montata sull'asse.",
    },
  }, {
    verb: "use",
    firstNoun: "oilFlask",
    when: { variable: "letterDelivered", equals: false },
    line: {
      character: "brotherElia",
      text: "Prima la lettera, giovane. Non affido il pozzo a uno sconosciuto con un'ampolla.",
    },
  }, {
    verb: "use",
    firstNoun: "oilFlask",
    when: { variable: "wellFreed", equals: true },
    response: { text: "Il pozzo è già libero; altro olio sarebbe uno spreco." },
  }, {
    verb: "use",
    firstNoun: "oilFlask",
    when: { variable: "wellLubricated", equals: true },
    response: { text: "Il supporto è già ben lubrificato." },
  }, {
    verb: "use",
    firstNoun: "oilFlask",
    response: { text: "Verso l'olio sul supporto della carrucola, senza ancora muovere la corda." },
    operations: [{ type: "consume-selected-object" }, {
      type: "set-variable",
      variable: "wellLubricated",
      value: true,
    }, {
      type: "set-appearance",
      target: { kind: "scenery", scene: "cloister", scenery: "well" },
      appearance: "lubricated",
    }],
  }, {
    verb: "pull",
    when: { variable: "letterDelivered", equals: false },
    line: {
      character: "brotherElia",
      text: "Prima la lettera. Poi potrai tirare tutte le corde che la prudenza consente.",
    },
  }, {
    verb: "pull",
    when: { variable: "wellFreed", equals: true },
    response: { text: "La corda ora scorre libera; non serve tirarla di nuovo." },
  }, {
    verb: "pull",
    when: { variable: "wellLubricated", equals: true },
    sequence: "freeWell",
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
    well: {
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
            freeing: {
              sheet: {
                image: wellFreeingUrl,
                frames: [
                  { x: 0, y: 0, width: 295, height: 360 },
                  { x: 295, y: 0, width: 295, height: 360 },
                ],
              },
              timing: { framesPerSecond: 2 },
            },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 147, y: 360 },
        },
        lubricated: {
          animations: {
            idle: {
              sheet: {
                image: lubricatedWellUrl,
                frames: [{ x: 0, y: 0, width: 295, height: 360 }],
              },
              timing: { framesPerSecond: 1, loop: true },
            },
            freeing: {
              sheet: {
                image: wellFreeingUrl,
                frames: [
                  { x: 0, y: 0, width: 295, height: 360 },
                  { x: 295, y: 0, width: 295, height: 360 },
                ],
              },
              timing: { framesPerSecond: 2 },
            },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 147, y: 360 },
        },
        freed: {
          animations: {
            idle: {
              sheet: {
                image: freedWellUrl,
                frames: [{ x: 0, y: 0, width: 295, height: 360 }],
              },
              timing: { framesPerSecond: 1, loop: true },
            },
            freeing: {
              sheet: {
                image: freedWellUrl,
                frames: [{ x: 0, y: 0, width: 295, height: 360 }],
              },
              timing: { framesPerSecond: 1 },
            },
          },
          roles: { default: "idle" },
          visualAnchor: { x: 147, y: 360 },
        },
      },
      noun: wellNoun,
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
    target: { kind: "scenery", scenery: "well" },
    area: rectangle(875, 270, 1170, 630),
    approach: { groundPoint: { x: 850, y: 600 }, facing: "right" },
  }, {
    target: { kind: "object", object: "winchHandle" },
    area: rectangle(825, 570, 890, 635),
    approach: { groundPoint: { x: 790, y: 620 }, facing: "right" },
    when: { variable: "wellFreed", equals: true },
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
