import type {
  DialogueFactCandidate,
  DialogueHttpRequest,
  DialogueInterpretation,
  DialogueVerbalizationRequest,
  ReflectionTestimony,
  ResponseStrategy,
} from "@asterixcapri/fondale";
import type { Page } from "@playwright/test";

export const dialogueServerUrl = "http://127.0.0.1:4315/dialogue";

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

/**
 * The deterministic stand-in for the separately run Dialogue Server.
 *
 * It intercepts the same production HTTP seam a Player's browser uses, so the
 * standard suite proves the shipped adapter, protocol and turn lifecycle while
 * needing no model, database or network. Beyond answering, it can be told to
 * fail or to hold a turn open, which is how the suite reaches the provider
 * failure, cancellation and late-completion behavior a Player can hit for real.
 */
export interface DialogueServerStub {
  /** Every request the game made, in order. */
  readonly requests: DialogueHttpRequest[];
  /** Answers the next matching request with a provider-level failure. */
  failNext(operation: DialogueHttpRequest["operation"], message: string): void;
  /**
   * Holds the next matching request open and resolves once it has arrived.
   * The returned function answers it, which is how a late completion is staged.
   */
  holdNext(operation: DialogueHttpRequest["operation"]): Promise<() => void>;
}

export async function installDialogueServerStub(page: Page): Promise<DialogueServerStub> {
  const requests: DialogueHttpRequest[] = [];
  const failures = new Map<DialogueHttpRequest["operation"], string>();
  const holds = new Map<DialogueHttpRequest["operation"], (release: () => void) => void>();

  await page.route(dialogueServerUrl, async (route) => {
    const request = route.request().postDataJSON() as DialogueHttpRequest;
    requests.push(request);

    const failure = failures.get(request.operation);
    if (failure !== undefined) {
      failures.delete(request.operation);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: failure }),
      });
      return;
    }

    const answer = async () => {
      const responseValue = executeDialogueOperation(request);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          ...(responseValue === undefined ? {} : { value: responseValue }),
        }),
      }).catch(() => {
        // A cancelled Dialogue Turn aborts the browser request. Answering it
        // afterwards is exactly the late completion under test, and Playwright
        // reports the vanished request rather than the game misbehaving.
      });
    };

    const arrived = holds.get(request.operation);
    if (!arrived) {
      await answer();
      return;
    }
    holds.delete(request.operation);
    await new Promise<void>((resolve) => {
      arrived(() => {
        void answer().then(resolve);
      });
    });
  });

  return {
    requests,
    failNext(operation, message) {
      failures.set(operation, message);
    },
    holdNext(operation) {
      return new Promise<() => void>((resolveArrival) => {
        holds.set(operation, resolveArrival);
      });
    },
  };
}

function executeDialogueOperation(request: DialogueHttpRequest): unknown {
  switch (request.operation) {
    case "interpret":
      return readPrologueQuestion(request.request.playerInput, request.request.candidates);
    case "verbalize":
      return speakPrologueResponse(request.request);
    case "reflect":
      return {
        summary: composePrologueReflection(
          request.request.facts,
          request.request.testimonies,
        ),
      };
    case "cancel":
    case "ready":
    case "reset":
      return undefined;
  }
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
