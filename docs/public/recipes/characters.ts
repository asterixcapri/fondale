import { type CharacterDefinition, type NounDefinition, uniformGrid } from "fondale";

// One cell, one frame. A real game animates; the contract is the same.
const frames = uniformGrid({ frameWidth: 256, frameHeight: 256, columns: 1, count: 1 });

function sheets(who: string) {
  return {
    left: { image: new URL(`./${who}-left.png`, import.meta.url), frames },
    right: { image: new URL(`./${who}-right.png`, import.meta.url), frames },
    front: { image: new URL(`./${who}-front.png`, import.meta.url), frames },
    back: { image: new URL(`./${who}-back.png`, import.meta.url), frames },
  };
}

/** The figure is 240 of the 256 cell pixels tall: a third of a 720-pixel frame. */
const visualAnchor = { x: 128, y: 252 };

export const player = ({
  initialScene: "quay",
  initialGroundPoint: { x: 320, y: 620 },
  initialFacing: "front",
  initialAppearance: "workwear",
  movementSpeed: 220,
  appearances: {
    workwear: {
      visualAnchor,
      animations: { idle: { sheets: sheets("player"), timing: { framesPerSecond: 1, loop: true } } },
      roles: { default: "idle", walking: "idle" },
    },
  },
} satisfies CharacterDefinition);

export const keeperNoun = ({
  labels: [{ text: "Keeper" }],
  preferredVerbs: [{ verb: "talk-to" }],
  cases: [
    {
      verb: "talk-to",
      when: { hasObject: "lantern" },
      line: { character: "keeper", text: "Mind the wick. The storeroom is dark." },
    },
    { verb: "talk-to", line: { character: "keeper", text: "There is a lantern under the crate." } },
    { verb: "look-at", response: { text: "Grey, patient, and older than the quay." } },
  ],
} satisfies NounDefinition);

export const keeper = ({
  initialScene: "quay",
  initialGroundPoint: { x: 760, y: 560 },
  initialFacing: "left",
  initialAppearance: "waiting",
  movementSpeed: 120,
  appearances: {
    waiting: {
      visualAnchor,
      animations: { idle: { sheets: sheets("keeper"), timing: { framesPerSecond: 1, loop: true } } },
      roles: { default: "idle" },
    },
  },
  noun: keeperNoun,
} satisfies CharacterDefinition);
