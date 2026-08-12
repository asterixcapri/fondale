import { type SequenceDefinition } from "@asterixcapri/fondale";

export const brotherEliaConversation = ({
  steps: [{
    type: "line",
    character: "brotherElia",
    text: "Raffaele rivuole la sua manovella. Il pozzo, invece, sostiene di averne ancora bisogno.",
  }, {
    type: "choice",
    alternatives: [{ text: "Posso riprendermela?", steps: [{
      type: "line",
      character: "brotherElia",
      text: "Appena la carrucola gira. Ho fede nei miracoli, ma per il ferro preferisco l'olio.",
    }] }, { text: "Da quanto è bloccato il pozzo?", steps: [{
      type: "line",
      character: "brotherElia",
      text: "Da stamattina. Secondo frate Nicola, quindi, da almeno tre settimane.",
    }] }],
    fallback: { text: "Provo a sistemarlo.", steps: [] },
  }],
} satisfies SequenceDefinition);
