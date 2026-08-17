import { type SequenceDefinition } from "@asterixcapri/fondale";

/**
 * The prologue's last beat: opening the bundle changes the same Object into
 * its opened Appearance and commits the discovery that ends the demo.
 */
export const bundleOpening = ({
  steps: [
    {
      type: "narration",
      text: "Michele scioglie lo spago cerato e apre il fagotto sul ponte.",
    },
    {
      type: "operations",
      operations: [
        {
          type: "set-appearance",
          target: { kind: "object", object: "oilskinBundle" },
          appearance: "opened",
        },
        {
          type: "place-object",
          object: "oilskinBundle",
          scene: "driftingBoat",
          groundPoint: { x: 950, y: 596 },
          appearance: "opened",
        },
        {
          type: "learn-narrative-fact",
          character: "michele",
          factId: "bundle-holds-broken-seal",
        },
      ],
    },
    {
      type: "line",
      character: "michele",
      text:
        "Un sigillo spezzato. E un frammento di registro: la rotta di una nave che non è mai tornata.",
    },
    {
      type: "narration",
      text: "Il mare cala nell'ultimo chiarore. Qualcuno, da qualche parte, quel sigillo lo stava aspettando.",
    },
  ],
} satisfies SequenceDefinition);
