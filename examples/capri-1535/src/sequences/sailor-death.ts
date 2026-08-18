import { type SequenceStep } from "@asterixcapri/fondale";

/**
 * The end of the prologue, from the completed reading to the closing image.
 *
 * It is authored as steps rather than as a Sequence because a Sequence cannot
 * start another one: both readings end on a branch that continues here, so
 * whichever of the two lands second plays exactly this, once.
 *
 * The close-up is dismissed before the sailor dies, so the Player watches it
 * happen in the world rather than reading about it over a picture.
 */
export const sailorDeath: readonly SequenceStep[] = [
  {
    type: "line",
    character: "michele",
    text: "Ottobre del 1533 il naufragio. Giugno del 1534 il grano scaricato ad Amalfi.",
  },
  {
    type: "line",
    character: "michele",
    text: "Otto mesi dopo. Una delle due date mente, e chi l'ha scritta sapeva quale.",
  },
  {
    type: "operations",
    operations: [
      {
        type: "learn-narrative-fact",
        character: "michele",
        factId: "santa-marta-sailed-after-her-wreck",
      },
      { type: "dismiss-detail-view" },
    ],
  },
  {
    type: "narration",
    text:
      "Michele solleva il capo dal ponte. Sotto il riparo di poppa il respiro si è fatto rado, "
      + "poi non si sente più.",
  },
  {
    type: "operations",
    operations: [{
      type: "set-appearance",
      target: { kind: "character", character: "woundedSailor" },
      appearance: "dead",
    }],
  },
  {
    type: "line",
    character: "michele",
    text: "Riposa, marinaio. Il nome di quella nave da adesso lo porto io.",
  },
  {
    // The prologue closes on Michele's gesture rather than on a Narration: he
    // kneels and composes the man he cannot name.
    type: "direction",
    directions: [{
      type: "animation",
      subject: { kind: "character", character: "michele" },
      animation: "pick-up",
    }],
  },
  {
    type: "operations",
    operations: [{ type: "end-game", detailView: "prologueEnding" }],
  },
];
