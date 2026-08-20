import { type GameOperation, type SequenceDefinition } from "fondale";

/** The canonical handoff: recognition, bundle, unconsciousness. */
const handoff: readonly GameOperation[] = [
  { type: "give-object-to-player", object: "oilskinBundle" },
  {
    type: "learn-narrative-fact",
    character: "michele",
    factId: "sailor-sailed-with-micheles-father",
  },
  {
    type: "learn-narrative-fact",
    character: "michele",
    factId: "oilskin-bundle-received",
  },
  { type: "set-variable", variable: "sailorEncountered", value: true },
  {
    type: "set-appearance",
    target: { kind: "character", character: "woundedSailor" },
    appearance: "unconscious",
  },
];

/**
 * The same gesture the encounter ends on: Michele unties the bundle and the
 * close-up takes the screen. It belongs to the handoff rather than to a chore
 * the Player is left to discover, so skipping the encounter reaches it too.
 */
const opening: readonly GameOperation[] = [
  {
    type: "learn-narrative-fact",
    character: "michele",
    factId: "bundle-holds-broken-seal",
  },
  { type: "present-detail-view", detailView: "openedBundle" },
];

export const sailorEncounter = ({
  scene: "driftingBoat",
  skippable: true,
  skipOutcome: [...handoff, ...opening],
  steps: [
    {
      type: "narration",
      text:
        "Sotto il riparo di poppa, il marinaio ferito apre gli occhi quando Michele si inginocchia accanto a lui.",
    },
    {
      type: "line",
      character: "woundedSailor",
      text: "Quel viso... Io, quel viso, lo conosco.",
    },
    {
      type: "line",
      character: "michele",
      text: "Mi scambi per un altro, marinaio. Sono Michele, figlio di questa costa.",
    },
    {
      type: "line",
      character: "woundedSailor",
      text: "No... Ho navigato con tuo padre, prima che il mare calasse sulla sua rotta.",
    },
    {
      type: "line",
      character: "michele",
      text: "La nave di mio padre non è mai tornata. Voi c'eravate?",
    },
    {
      type: "line",
      character: "woundedSailor",
      text: "Prendi. Ti appartiene più di quanto appartenga al fondo del mare.",
    },
    {
      // The receiving gesture: Michele's pick-up Animation meets the handoff.
      type: "direction",
      directions: [{
        type: "animation",
        subject: { kind: "character", character: "michele" },
        animation: "pick-up",
      }],
    },
    { type: "operations", operations: handoff },
    {
      type: "narration",
      text: "La mano gli ricade sul fianco. Gli occhi si chiudono; resta soltanto il respiro.",
    },
    {
      type: "line",
      character: "michele",
      text: "Ehi, resta con me. Non hai finito di raccontare.",
    },
    {
      type: "narration",
      text: "Nessuna risposta. Michele scioglie lo spago cerato e apre il fagotto sul ponte.",
    },
    { type: "operations", operations: opening },
  ],
} satisfies SequenceDefinition);
