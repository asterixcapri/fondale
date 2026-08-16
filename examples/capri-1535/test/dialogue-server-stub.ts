import type {
  DialogueFactCandidate,
  DialogueHttpRequest,
  DialogueInterpretation,
  DialogueVerbalizationRequest,
  ResponseStrategy,
} from "@asterixcapri/fondale";
import type { Page } from "@playwright/test";

export const dialogueServerUrl = "http://127.0.0.1:4315/dialogue";

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

export async function installDialogueServerStub(
  page: Page,
): Promise<DialogueHttpRequest[]> {
  const requests: DialogueHttpRequest[] = [];
  await page.route(dialogueServerUrl, async (route) => {
    const request = route.request().postDataJSON() as DialogueHttpRequest;
    requests.push(request);
    const value = execute(request);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, ...(value === undefined ? {} : { value }) }),
    });
  });
  return requests;
}

function execute(request: DialogueHttpRequest): unknown {
  switch (request.operation) {
    case "interpret":
      return readPrologueQuestion(request.request.playerInput, request.request.candidates);
    case "verbalize":
      return speakPrologueResponse(request.request);
    case "reflect":
      return { summary: composePrologueReflection(request.request.facts) };
    case "cancel":
    case "reset":
      return undefined;
  }
}

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

export function speakPrologueResponse(request: DialogueVerbalizationRequest): string {
  if (request.fact) return factWording[request.fact.id] ?? request.fact.proposition;
  if (request.claim) return request.claim.proposition;
  return strategyWording[request.strategy];
}

export function composePrologueReflection(
  facts: readonly DialogueFactCandidate[],
): string {
  if (facts.length === 0) return "Non ho ancora scoperto niente che valga la pena ripensare.";
  return `Quello che so: ${facts.map(({ proposition }) => proposition).join(" ")}`;
}
