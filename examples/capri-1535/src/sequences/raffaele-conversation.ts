import { defineSequence } from "@asterixcapri/fondale";

export const raffaeleConversation = defineSequence({
  steps: [
    {
      type: "operations",
      operations: [{ type: "set-variable", variable: "raffaeleMet", value: true }],
    },
    {
      type: "line",
      character: "raffaele",
      text: "Sei qui per guardare il mare o per renderti utile?",
    },
    {
      type: "choice",
      alternatives: [
        {
          text: "Quanto mi dai per sistemarlo?",
          steps: [
            {
              type: "operations",
              operations: [
                { type: "set-variable", variable: "raffaeleImpressed", value: true },
              ],
            },
            {
              type: "line",
              character: "michele",
              text: "Quanto mi dai per sistemarlo?",
            },
          ],
        },
        {
          text: "Dipende: il mare paga meglio di te?",
          steps: [
            {
              type: "line",
              character: "michele",
              text: "Dipende: il mare paga meglio di te?",
            },
          ],
        },
      ],
      fallback: { text: "Parliamo dell'argano.", steps: [] },
    },
    {
      type: "line",
      character: "raffaele",
      text:
        "L'argano è bloccato e il gozzo deve attraversare la grotta per portare un pacco al posto di vedetta.",
    },
    {
      type: "line",
      character: "raffaele",
      text: "Trova l'olio e la manovella. Se lo rimetti in funzione, avrai passaggio e monete.",
    },
  ],
});
