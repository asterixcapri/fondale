import type {
  DialogueFactCandidate,
  DialogueInterpretation,
  DialogueInterpretationRequest,
  DialogueProvider,
  DialogueVerbalizationRequest,
  ReflectionRequest,
  ReflectionResponse,
  ResponseStrategy,
  ReflectionTestimony,
} from "@asterixcapri/fondale";

/**
 * The deterministic stand-in for the separately run Dialogue Server.
 *
 * Knowledge-Driven Dialogue is a seam, not a model: the Engine decides which
 * Facts a Character may disclose and the provider only words them. Answering
 * here with a keyword table gives the suite the same decisions a Player meets
 * while needing no model, database or network.
 */

const factKeywords: Readonly<Record<string, readonly string[]>> = {
  "michele-arrived-in-capri": ["chi sei", "da dove", "lavoro onesto"],
  "winch-lacks-its-handle": ["argano"],
  "raffaele-lent-the-handle": ["frati", "manovella", "rubato", "rubata"],
  "cloister-pulley-is-jammed": ["carrucola", "pozzo"],
  "oil-frees-the-pulley": ["olio", "sbloccare", "liberare"],
  "oil-flask-lies-by-the-nets": ["ampolla", "reti"],
  "the-tower-watches-the-sea": ["torre", "vedetta", "segnale"],
};

const factWording: Readonly<Record<string, string>> = {
  "michele-arrived-in-capri": "Sono arrivato a Capri in cerca di un lavoro onesto.",
  "winch-lacks-its-handle": "L'argano è fermo: gli manca la manovella.",
  "raffaele-lent-the-handle":
    "Raffaele ha prestato volontariamente la manovella ai frati in cambio dell'acqua.",
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

export interface PrologueDialogue extends DialogueProvider {
  /**
   * Every Reflection request the game made, in order.
   *
   * Reading it is the only way to prove a negative — that an undiscovered Fact was
   * never even a candidate — because a provider that declines to mention something
   * proves nothing about what it was allowed to mention.
   */
  readonly reflections: ReflectionRequest[];
  /** Every operation the game asked of the provider, in order. */
  readonly operations: DialogueOperation[];
  /** Answers the next matching operation with a provider-level failure. */
  failNext(operation: DialogueOperation, message: string): void;
  /**
   * Holds the next matching operation open and resolves once it has arrived.
   * The returned function answers it, which is how a late completion is staged.
   */
  holdNext(operation: DialogueOperation): Promise<() => void>;
}

export type DialogueOperation = "interpret" | "verbalize" | "reflect";

export function prologueDialogue(): PrologueDialogue {
  const reflections: ReflectionRequest[] = [];
  const operations: DialogueOperation[] = [];
  const failures = new Map<string, string>();
  const holds = new Map<string, (release: () => void) => void>();
  const answer = <Value>(operation: DialogueOperation, produce: () => Value): Promise<Value> => {
    operations.push(operation);
    const message = failures.get(operation);
    if (message !== undefined) {
      failures.delete(operation);
      return Promise.reject(new Error(message));
    }
    const arrived = holds.get(operation);
    if (!arrived) return Promise.resolve(produce());
    holds.delete(operation);
    return new Promise<Value>((resolve) => {
      arrived(() => resolve(produce()));
    });
  };
  return {
    reflections,
    operations,
    failNext(operation, message) {
      failures.set(operation, message);
    },
    holdNext(operation) {
      return new Promise<() => void>((resolveArrival) => {
        holds.set(operation, resolveArrival);
      });
    },
    interpret(request: DialogueInterpretationRequest): Promise<DialogueInterpretation> {
      return answer("interpret", () => readPrologueQuestion(request.playerInput, request.candidates));
    },
    verbalize(request: DialogueVerbalizationRequest): Promise<string> {
      return answer("verbalize", () => speakPrologueResponse(request));
    },
    reflect(request: ReflectionRequest): Promise<ReflectionResponse> {
      reflections.push(request);
      return answer("reflect", () => ({
        summary: composePrologueReflection(request.facts, request.testimonies),
      }));
    },
    reset(): Promise<void> {
      return Promise.resolve();
    },
  };
}

function readPrologueQuestion(
  playerInput: string,
  candidates: readonly DialogueFactCandidate[],
): DialogueInterpretation {
  const spoken = playerInput.toLocaleLowerCase("it-IT");
  const match = candidates.find(({ id }) =>
    (factKeywords[id] ?? []).some((keyword) => spoken.includes(keyword))
  );
  return match ? { factId: match.id } : { factId: null, reason: "no-relevant-fact" };
}

function speakPrologueResponse(request: DialogueVerbalizationRequest): string {
  if (request.fact) return factWording[request.fact.id] ?? request.fact.proposition;
  if (request.claim) return request.claim.proposition;
  return strategyWording[request.strategy];
}

function composePrologueReflection(
  facts: readonly DialogueFactCandidate[],
  testimonies: readonly ReflectionTestimony[],
): string {
  if (facts.length === 0 && testimonies.length === 0) {
    return "Non ho ancora scoperto niente che valga la pena ripensare.";
  }
  return [
    facts.length > 0
      ? `Quello che so: ${facts.map(({ proposition }) => proposition).join(" ")}`
      : "",
    testimonies.length > 0
      ? `Quello che mi è stato detto: ${testimonies.map(({ claim }) => claim.proposition).join(" ")}`
      : "",
  ].filter(Boolean).join(" ");
}
