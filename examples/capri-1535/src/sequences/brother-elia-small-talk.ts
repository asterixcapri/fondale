import { type SequenceDefinition } from "fondale";

/**
 * What Brother Elia says when nothing is at stake.
 *
 * Like Raffaele's, it carries no Game Operation at all: the Player leaves it
 * knowing the man and not one Narrative Fact more. The Certosa's water is his
 * charge, so the cloister's trouble reaches even his idle talk — through a
 * branch, because a Character who has not noticed what the Player did for him
 * is worse company than a silent one.
 */
export const brotherEliaSmallTalk = ({
  steps: [{
    type: "choice",
    alternatives: [{
      text: "Che vita è, la vostra qui?",
      steps: [{
        type: "line",
        character: "brotherElia",
        text: "L'acqua e la pazienza. Mi hanno dato in custodia le due cose che non si lasciano comandare.",
      }],
    }, {
      text: "Come vanno le cose, al chiostro?",
      steps: [{
        type: "branch",
        cases: [{
          when: { variable: "wellFreed", equals: true },
          steps: [{
            type: "line",
            character: "brotherElia",
            text: "Il secchio risale. Il chiostro è tornato a essere un chiostro, e non più una discussione.",
          }],
        }, {
          when: { variable: "pulleyTroubleKnown", equals: true },
          steps: [{
            type: "line",
            character: "brotherElia",
            text: "Un secchio fermo a mezz'aria e dodici uomini che fingono di non pensarci.",
          }],
        }],
        fallback: [{
          type: "line",
          character: "brotherElia",
          text: "Come sempre: le campane in orario e gli uomini un poco in ritardo.",
        }],
      }],
    }, {
      text: "Che uomo è Raffaele?",
      steps: [{
        type: "line",
        character: "brotherElia",
        text: "Un buon uomo con una fretta cattiva. Il mare gliela perdona; io un poco meno.",
      }],
    }, {
      text: "Non vi manca il mondo?",
      steps: [{
        type: "line",
        character: "brotherElia",
        text: "Il mondo passa qui sotto due volte al giorno, a remi. Lo vedo abbastanza.",
      }],
    }, {
      text: "Che cosa vorreste, voi?",
      steps: [{
        type: "line",
        character: "brotherElia",
        text: "Che l'acqua salisse da sola.",
      }, {
        type: "line",
        character: "brotherElia",
        text: "Non è una preghiera che si possa fare con la faccia seria. Quindi tiro la corda.",
      }],
    }],
    fallback: { text: "Nulla, frate. Buona giornata.", steps: [] },
  }],
} satisfies SequenceDefinition);
