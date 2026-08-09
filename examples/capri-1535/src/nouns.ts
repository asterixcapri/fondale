import { defineNoun } from "@asterixcapri/fondale";

const defineUnaryNoun = (text: string, preferred: Parameters<typeof defineNoun>[0]["preferredVerbs"][number]["verb"], response: string) =>
  defineNoun({ labels: [{ text }], preferredVerbs: [{ verb: preferred }], cases: [{ verb: preferred === "walk-to" ? "look-at" : preferred, response: { text: response } }] });

const passage = (text: string) => defineNoun({
  labels: [{ text }], preferredVerbs: [{ verb: "walk-to" }], cases: [],
});

export const alleyNouns = {
  traveller: defineNoun({
    labels: [{ text: "Viandante" }], preferredVerbs: [{ verb: "talk-to" }],
    cases: [{ verb: "talk-to", sequence: "conversation" }],
  }),
  key: defineNoun({
    labels: [{ text: "Chiave d'ottone" }], preferredVerbs: [{ verb: "pick-up" }],
    cases: [{ verb: "pick-up", response: { text: "Prendo la chiave d'ottone." }, operations: [{ type: "collect-target-object" }] }],
  }),
  gate: defineNoun({
    labels: [{ when: { variable: "gateOpen", equals: true }, text: "Cancello aperto" }, { text: "Cancello chiuso" }],
    preferredVerbs: [{ when: { variable: "gateOpen", equals: true }, verb: "look-at" }, { verb: "open" }],
    cases: [
      { verb: "open", response: { text: "La serratura ha bisogno di una chiave." } },
      { verb: "use", firstNoun: "key", response: { text: "La chiave d'ottone apre il cancello." }, operations: [
        { type: "set-variable", variable: "gateOpen", value: true },
        { type: "set-appearance", target: { kind: "scenery", scene: "alley", scenery: "gate" }, appearance: "unlocked" },
        { type: "place-selected-object", groundPoint: { x: 217, y: 153 }, appearance: "used" },
      ] },
    ],
  }),
  toTownSquare: passage("Verso la piazza"),
};

export const townSquareNouns = {
  church: defineUnaryNoun("Chiesa", "look-at", "La chiesa domina la piazza; da dentro arriva odore d'incenso e cera."),
  cart: defineUnaryNoun("Carretto", "look-at", "Il carretto aspetta un carico che nessuno ha fretta di consegnare."),
  toAlley: passage("Verso il vicolo"),
  toHarbour: passage("Verso il porto"),
};

export const harbourNouns = {
  boat: defineUnaryNoun("Gozzo", "look-at", "Il gozzo aspetta che l'argano torni a funzionare."),
  raffaele: defineNoun({
    labels: [{ text: "Raffaele" }], preferredVerbs: [{ verb: "talk-to" }],
    cases: [
      { verb: "talk-to", when: { variable: "boatReady", equals: true }, response: { text: "L'argano tiene. Attraversa la grotta e porta il pacco a Monte Solaro.", speaker: "raffaele" } },
      { verb: "talk-to", when: { variable: "raffaeleMet", equals: true }, response: { text: "L'olio è vicino alle botti; la manovella era fra le reti.", speaker: "raffaele" } },
      { verb: "talk-to", sequence: "raffaeleConversation" },
    ],
  }),
  oilFlask: defineNoun({
    labels: [{ text: "Ampolla d'olio" }], preferredVerbs: [{ verb: "pick-up" }],
    cases: [{ verb: "pick-up", response: { text: "Prendo la piccola ampolla d'olio." }, operations: [{ type: "collect-target-object" }] }],
  }),
  winchHandle: defineNoun({
    labels: [{ text: "Manovella" }], preferredVerbs: [{ verb: "pick-up" }],
    cases: [{ verb: "pick-up", response: { text: "Libero la manovella dalle reti." }, operations: [{ type: "collect-target-object" }] }],
  }),
  winch: defineNoun({
    labels: [{ text: "Argano" }], preferredVerbs: [{ verb: "look-at" }],
    cases: [
      { verb: "look-at", when: { variable: "boatReady", equals: true }, response: { text: "La manovella gira e la corda è finalmente in tensione." } },
      { verb: "look-at", when: { variable: "winchLubricated", equals: true }, response: { text: "Gli ingranaggi sono liberi. Ora manca la manovella." } },
      { verb: "look-at", response: { text: "Il sale ha seccato il meccanismo e la manovella è sparita." } },
      { verb: "use", firstNoun: "oilFlask", response: { text: "L'olio libera lentamente gli ingranaggi." }, operations: [
        { type: "set-variable", variable: "winchLubricated", value: true },
        { type: "set-appearance", target: { kind: "scenery", scene: "harbour", scenery: "winch" }, appearance: "lubricated" },
        { type: "consume-selected-object" },
      ] },
      { verb: "use", firstNoun: "winchHandle", when: { variable: "winchLubricated", equals: true }, response: { text: "La manovella entra al suo posto. Il gozzo può partire." }, operations: [
        { type: "set-variable", variable: "boatReady", value: true },
        { type: "set-appearance", target: { kind: "scenery", scene: "harbour", scenery: "winch" }, appearance: "repaired" },
        { type: "place-selected-object", groundPoint: { x: 270, y: 170 }, appearance: "installed" },
      ] },
    ],
  }),
  toTownSquare: passage("Verso la piazza"),
  toGrotto: passage("Verso la grotta"),
  toTavern: passage("Porta della taverna"),
};

export const grottoNouns = {
  water: defineUnaryNoun("Acqua della grotta", "look-at", "Sotto l'azzurro, la roccia sembra muoversi con le onde."),
  toHarbour: passage("Verso il porto"),
  toMonteSolaro: passage("Scalinata per Monte Solaro"),
};

export const monteSolaroNouns = {
  horizon: defineNoun({
    labels: [{ text: "Orizzonte" }], preferredVerbs: [{ verb: "look-at" }],
    cases: [{ verb: "look-at", when: { variable: "monteSolaroObserved", equals: true }, response: { text: "Il mare continua a fingere di essere innocente." } }, {
      verb: "look-at", response: { text: "Michele si avvicina al parapetto." }, operations: [{ type: "set-variable", variable: "monteSolaroObserved", value: true }], sequence: "monteSolaroConclusion",
    }],
  }),
  door: defineUnaryNoun("Porta del posto di guardia", "look-at", "La porta è chiusa dall'interno."),
  toGrotto: passage("Scalinata per la grotta"),
};

export const tavernNouns = {
  host: defineNoun({ labels: [{ text: "Oste" }], preferredVerbs: [{ verb: "talk-to" }], cases: [{ verb: "talk-to", sequence: "hostConversation" }] }),
  closedDoor: defineUnaryNoun("Porta chiusa", "look-at", "La porta a sinistra è chiusa e non sembra destinata agli ospiti."),
  interior: defineUnaryNoun("Sala della taverna", "look-at", "Legno scuro, brocche e storie che migliorano a ogni bicchiere."),
  toHarbour: passage("Portone per il porto"),
};
