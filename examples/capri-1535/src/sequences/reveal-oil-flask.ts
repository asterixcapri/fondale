import { type SequenceDefinition } from "fondale";

export const revealOilFlask = ({
  scene: "harbour",
  steps: [{
    type: "direction",
    directions: [{
      type: "animation",
      subject: { kind: "character", character: "michele" },
      animation: "pick-up",
    }, {
      type: "animation",
      subject: { kind: "scenery", scenery: "fishingNets" },
      animation: "moveAside",
      startAfter: { direction: 0, cue: "contact" },
    }],
  }, {
    type: "operations",
    operations: [{
      type: "set-appearance",
      target: { kind: "scenery", scene: "harbour", scenery: "fishingNets" },
      appearance: "moved",
    }, {
      type: "set-variable",
      variable: "netsMoved",
      value: true,
    }],
  }, {
    type: "line",
    character: "michele",
    text: "Ho tirato via le reti. Sotto c'era davvero un'ampolla.",
  }],
} satisfies SequenceDefinition);
