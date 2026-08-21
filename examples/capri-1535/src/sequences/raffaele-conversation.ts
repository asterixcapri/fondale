import { type SequenceDefinition } from "fondale";

import { micheleLearns } from "../characters/learning";

export const raffaeleConversation = ({
  steps: [
    {
      type: "operations",
      operations: [{ type: "set-variable", variable: "jobAccepted", value: true }, {
        type: "give-object-to-player",
        object: "sealedLetter",
      }, {
        type: "record-testimony",
        speaker: "raffaele",
        listener: "michele",
        concealsFactId: "raffaele-lent-the-handle",
        claimId: "friars-stole-the-handle",
      }],
    },
    {
      type: "line",
      character: "raffaele",
      text: "Se cerchi monete, oggi il mare ha deciso di offrirti un lavoro.",
    },
    {
      type: "choice",
      alternatives: [
        {
          text: "Quanto vale il lavoro?",
          steps: [],
        },
        {
          text: "Lavoro prima, monete dopo?",
          steps: [],
        },
        {
          text: "Dimmi cosa devo fare.",
          steps: [],
        },
      ],
    },
    {
      type: "line",
      character: "raffaele",
      text:
        "I frati hanno rubato la manovella dell'argano per il pozzo. Ora la loro carrucola è bloccata.",
    },
    {
      type: "line",
      character: "raffaele",
      text:
        "Porta questa lettera sigillata a Frate Elia. Poi cerca l'olio vicino alle reti, libera il pozzo e riportami la manovella.",
    },
    {
      // Michele leaves the engagement knowing what Raffaele just told him, so
      // the authored path feeds Reflection exactly as free-form asking does.
      type: "operations",
      operations: micheleLearns(
        "winch-lacks-its-handle",
        "cloister-pulley-is-jammed",
        "oil-flask-lies-by-the-nets",
      ),
    },
  ],
} satisfies SequenceDefinition);
