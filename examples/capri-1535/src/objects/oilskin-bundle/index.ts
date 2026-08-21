import { type NounDefinition, type ObjectDefinition } from "fondale";

import inventoryUrl from "./inventory.png";
import wrappedUrl from "./scene.png";

/**
 * The sailor's parting Object. It lies clutched near his hand until the
 * encounter hands it to Michele and unties it in the same beat. What it held
 * is presented as a Detail View, so the Object never returns to the deck and
 * carries the one Appearance the Scene ever draws.
 */
export const oilskinBundle = ({
  initialScene: "driftingBoat",
  initialGroundPoint: { x: 950, y: 596 },
  initialAppearance: "wrapped",
  appearances: {
    wrapped: {
      animations: {
        idle: {
          sheet: { image: wrappedUrl, frames: [{ x: 0, y: 0, width: 56, height: 36 }] },
          timing: { framesPerSecond: 1, loop: true },
        },
      },
      roles: { default: "idle" },
      visualAnchor: { x: 28, y: 36 },
    },
  },
  inventoryAppearance: inventoryUrl,
  noun: ({
    labels: [
      { text: "Fagotto di tela cerata", when: { variable: "bundleOpened", equals: false } },
      { text: "Fagotto aperto" },
    ],
    preferredVerbs: [{ verb: "look-at" }],
    secondaryVerbs: [
      { verb: "open", when: { variable: "bundleOpened", equals: false } },
      { verb: "look-at" },
    ],
    cases: [
      {
        // Until the sailor gives it away the bundle is his, and the encounter
        // is the only thing that opens it.
        verb: "open",
        when: { variable: "bundleOpened", equals: false },
        response: { text: "Lo tiene stretto. Non è mio da aprire." },
      },
      {
        verb: "open",
        response: { text: "È già aperto: il sigillo e il frammento sono lì dentro." },
      },
      {
        verb: "look-at",
        when: { variable: "bundleOpened", equals: false },
        response: {
          text: "È legato con spago cerato. Il marinaio lo stringeva come un debito.",
        },
      },
      {
        verb: "look-at",
        response: {
          text: "Un sigillo spezzato e un frammento di registro: una nave che non è mai tornata.",
        },
      },
      {
        verb: "use",
        response: { text: "Non c'è altro da aprire né da usare." },
      },
      {
        verb: "give",
        response: { text: "Questo fagotto non si cede: appartiene alla storia di mio padre." },
      },
    ],
  } satisfies NounDefinition),
} satisfies ObjectDefinition);
