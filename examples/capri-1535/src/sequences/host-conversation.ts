import { defineSequence } from "@asterixcapri/fondale";

export const hostConversation = defineSequence({
  steps: [{ type: "line", character: "host", text: "Benvenuto. Qui il mare entra soltanto nei racconti." }, {
    type: "choice",
    alternatives: [{ text: "Cosa si dice dell'argano del porto?", steps: [{
      type: "line", character: "host", text: "Che Raffaele lo cura meno del proprio orgoglio. Olio e pazienza, ragazzo.",
    }] }, { text: "Cerco soltanto un momento al caldo.", steps: [{
      type: "line", character: "host", text: "Allora siediti con gli occhi. Le sedie vere sono tutte occupate.",
    }] }],
    fallback: { text: "Devo andare.", spoken: false, steps: [] },
  }],
});
