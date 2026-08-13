import type {
  DialogueFactCandidate,
  DialogueInterpretation,
  DialogueVerbalizationRequest,
  ResponseStrategy,
} from "@asterixcapri/fondale";

/**
 * The Example's own scripted reading and wording of prologue dialogue.
 *
 * It is shared by the two places that need to answer a typed question without a
 * model: the local adapter's default Dialogue Model, and the provider injected
 * into the acceptance build. Both go through here so a Player and the suite
 * meet the same words.
 *
 * Nothing here decides content. Interpretation only ever returns one of the
 * candidates the Engine offered for that turn, and verbalisation only ever
 * dresses the Fact, Claim or Response Strategy the Engine already authorised.
 */
const factKeywords: Readonly<Record<string, readonly string[]>> = {
  "michele-arrived-in-capri": ["chi sei", "da dove", "lavoro onesto"],
  "winch-lacks-its-handle": ["argano"],
  "friars-took-the-handle": ["frati", "manovella"],
  "cloister-pulley-is-jammed": ["carrucola", "pozzo"],
  "oil-frees-the-pulley": ["olio", "sbloccare", "liberare"],
  "oil-flask-lies-by-the-nets": ["ampolla", "reti"],
  "the-tower-watches-the-sea": ["torre", "vedetta", "segnale"],
};

const factWording: Readonly<Record<string, string>> = {
  "michele-arrived-in-capri": "Sono arrivato a Capri in cerca di un lavoro onesto.",
  "winch-lacks-its-handle": "L'argano è fermo: gli manca la manovella.",
  "friars-took-the-handle": "La manovella se la sono presa i frati, per il pozzo del chiostro.",
  "cloister-pulley-is-jammed": "La carrucola del pozzo è bloccata e il secchio non risale.",
  "oil-frees-the-pulley": "Con un po' d'olio quella carrucola tornerebbe a girare.",
  "oil-flask-lies-by-the-nets": "L'ampolla dell'olio è là, accanto alle reti.",
  "the-tower-watches-the-sea": "Dalla torre si tiene d'occhio il mare aperto.",
};

const strategyWording: Readonly<Record<ResponseStrategy, string>> = {
  answer: "Ecco quello che so.",
  withhold: "Di questo preferisco non parlare.",
  evade: "Il mare è largo, e le domande sono tante.",
  refuse: "No. Non ne parlo.",
  clarify: "Che cosa vuoi sapere, di preciso?",
  "cover-story": "Le cose sono andate diversamente.",
};

/** The offered Narrative Fact the Player's own words point at, if any. */
export function readPrologueQuestion(
  playerInput: string,
  candidates: readonly DialogueFactCandidate[],
): DialogueInterpretation {
  const spoken = playerInput.toLocaleLowerCase("it-IT");
  const match = candidates.find(({ id }) =>
    (factKeywords[id] ?? []).some((keyword) => spoken.includes(keyword))
  );
  return match ? { factId: match.id } : { factId: null, reason: "no-relevant-fact" };
}

/** The Italian wording for whatever the Engine authorised this turn. */
export function speakPrologueResponse(request: DialogueVerbalizationRequest): string {
  if (request.fact) return factWording[request.fact.id] ?? request.fact.proposition;
  if (request.claim) return request.claim.proposition;
  return strategyWording[request.strategy];
}

/** What Michele tells himself about the Character Knowledge he has committed. */
export function composePrologueReflection(
  facts: readonly DialogueFactCandidate[],
): string {
  if (facts.length === 0) return "Non ho ancora scoperto niente che valga la pena ripensare.";
  return `Quello che so: ${facts.map(({ proposition }) => proposition).join(" ")}`;
}
