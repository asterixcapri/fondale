import { type DetailViewDefinition, type NounDefinition } from "@asterixcapri/fondale";

const sealNoun = ({
  labels: [{ text: "Seal" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{ verb: "look-at", response: { text: "Pressed while the wax was still too hot." } }],
} satisfies NounDefinition);

/**
 * A Detail View is exactly the Logical Resolution and has no Scene Space:
 * nothing walks inside one, so its Hotspots carry no Approach Point.
 *
 * This same Detail View is the game's Ending, named by an `end-game`
 * operation. An Ending carries no image of its own.
 */
export const notice = ({
  image: new URL("./notice.png", import.meta.url),
  hotspots: [
    {
      area: [{ x: 420, y: 260 }, { x: 860, y: 260 }, { x: 860, y: 380 }, { x: 420, y: 380 }],
      noun: sealNoun,
    },
  ],
} satisfies DetailViewDefinition);
