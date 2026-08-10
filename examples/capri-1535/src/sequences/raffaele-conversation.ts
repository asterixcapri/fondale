import { defineSequence } from "@asterixcapri/fondale";

export const raffaeleConversation = defineSequence({
  steps: [
    {
      type: "operations",
      operations: [{ type: "set-variable", variable: "jobAccepted", value: true }],
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
      ],
      fallback: { text: "Dimmi cosa devo fare.", steps: [] },
    },
    {
      type: "line",
      character: "raffaele",
      text:
        "I frati hanno preso la manovella dell'argano per il pozzo. Ora la loro carrucola è bloccata.",
    },
    {
      type: "line",
      character: "raffaele",
      text: "Prendi l'ampolla accanto alle reti, libera il pozzo e riportami la manovella. Poi salirai alla torre.",
    },
  ],
});
