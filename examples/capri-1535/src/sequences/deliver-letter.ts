import { type SequenceDefinition } from "fondale";

export const deliverLetter = ({
  steps: [{
    type: "line",
    character: "brotherElia",
    text:
      "La lettera lo conferma: Raffaele ci ha prestato volontariamente la manovella in cambio dell'acqua.",
  }, {
    type: "line",
    character: "brotherElia",
    text:
      "Ora puoi aiutarmi. Metti l'olio sul supporto della carrucola, poi tira la corda: il secchio dovrebbe risalire.",
  }],
} satisfies SequenceDefinition);
