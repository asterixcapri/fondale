import { type SequenceDefinition } from "fondale";

/**
 * What Raffaele says when nothing is at stake.
 *
 * Not one step here carries a Game Operation, so nothing said in this Sequence
 * can be learned, unlock anything or reach Reflection: it is the Player getting
 * to know the man, and never a way around a puzzle. Keeping the small talk in
 * its own Sequence also costs the Conversation a single authored alternative,
 * which matters where at most six may be eligible at once.
 */
export const raffaeleSmallTalk = ({
  steps: [{
    type: "choice",
    alternatives: [{
      text: "Com'è andata, oggi?",
      steps: [{
        type: "branch",
        cases: [{
          when: { variable: "boatReady", equals: true },
          steps: [{
            type: "line",
            character: "raffaele",
            text: "L'argano gira, la barca è pronta. Non mi fido: quando tutto va, di solito mi sono dimenticato qualcosa.",
          }],
        }, {
          when: { variable: "jobAccepted", equals: true },
          steps: [{
            type: "line",
            character: "raffaele",
            text: "Storta. Ma adesso ho te, quindi è storta in due.",
          }],
        }, {
          steps: [{
            type: "line",
            character: "raffaele",
            text: "Tre boghe e un polpo che se n'è tornato a casa. Il mare oggi tiene le mani in tasca.",
          }],
        }],
      }],
    }, {
      text: "Da quanto vai per mare?",
      steps: [{
        type: "line",
        character: "raffaele",
        text: "Questo gozzo era di mio padre. Lui ci parlava. Io ci litigo, e basta.",
      }, {
        type: "line",
        character: "raffaele",
        text: "Trent'anni che facciamo la stessa discussione, e vince sempre lui.",
      }],
    }, {
      text: "Che gente sono, i frati?",
      steps: [{
        type: "line",
        character: "raffaele",
        text: "Brava gente. Pregano per tutti e restituiscono con comodo.",
      }, {
        type: "line",
        character: "raffaele",
        text: "Se in paradiso si cammina col loro passo, ci arriveremo tardi. Ma ci arriveremo.",
      }],
    }, {
      text: "Non ti fermi mai?",
      steps: [{
        type: "line",
        character: "raffaele",
        text: "Il mare non aspetta e il pane nemmeno. Mi fermo d'inverno, quando lo decide lui.",
      }],
    }, {
      text: "Cosa vorresti, se potessi scegliere?",
      steps: [{
        type: "line",
        character: "raffaele",
        text: "Una barca che non imbarchi e una schiena che non scricchioli.",
      }, {
        type: "line",
        character: "raffaele",
        text: "Intanto rammendo le reti. Uno si accontenta di quello che sa fare.",
      }],
    }, {
      text: "Niente. Pensavo ad alta voce.",
      steps: [],
    }],
  }],
} satisfies SequenceDefinition);
