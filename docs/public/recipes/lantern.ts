import { type NounDefinition, type ObjectDefinition } from "fondale";

/**
 * One Noun answers for the lantern on the quay and in the Inventory alike.
 *
 * Picking it up is the Object's own `pick-up` case; lighting it is a `use`
 * against the Keeper's brazier Hotspot, authored on that Hotspot's Noun.
 */
export const lanternNoun = ({
  labels: [{ text: "Lit lantern", when: { variable: "lanternLit", equals: true } }, { text: "Lantern" }],
  preferredVerbs: [{ verb: "pick-up", when: { variable: "lanternHeld", equals: false } }, { verb: "look-at" }],
  cases: [
    {
      verb: "pick-up",
      when: { variable: "lanternHeld", equals: false },
      response: { text: "Heavier than it looks." },
      operations: [
        { type: "collect-target-object" },
        { type: "set-variable", variable: "lanternHeld", value: true },
      ],
    },
    { verb: "look-at", when: { variable: "lanternLit", equals: true }, response: { text: "The wick holds a steady flame." } },
    { verb: "look-at", response: { text: "Oil enough, and no flame." } },
  ],
  fallbacks: { push: { response: { text: "It only rocks." } } },
} satisfies NounDefinition);

export const lantern = ({
  initialScene: "quay",
  initialGroundPoint: { x: 540, y: 640 },
  initialAppearance: "unlit",
  inventoryAppearance: new URL("./lantern-inventory.png", import.meta.url),
  appearances: {
    unlit: {
      animations: {
        idle: {
          sheet: { image: new URL("./lantern.png", import.meta.url), frames: [{ x: 0, y: 0, width: 96, height: 96 }] },
          timing: { framesPerSecond: 1, loop: true },
        },
      },
      roles: { default: "idle" },
    },
    lit: {
      animations: {
        idle: {
          sheet: { image: new URL("./lantern-lit.png", import.meta.url), frames: [{ x: 0, y: 0, width: 96, height: 96 }] },
          timing: { framesPerSecond: 1, loop: true },
        },
      },
      roles: { default: "idle" },
    },
  },
  noun: lanternNoun,
} satisfies ObjectDefinition);
