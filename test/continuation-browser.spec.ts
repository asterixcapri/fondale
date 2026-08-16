import { expect, test, type Page } from "@playwright/test";

interface DialogueRequest {
  readonly operation: "interpret" | "verbalize" | "reflect" | "cancel" | "ready" | "reset";
  readonly sessionId: string;
  readonly turnId?: string;
  readonly request?: { readonly facts?: readonly { readonly id: string }[] };
}

async function installDialogueStandIn(page: Page): Promise<DialogueRequest[]> {
  const requests: DialogueRequest[] = [];
  await page.route("**/test-dialogue", async (route) => {
    const request = route.request().postDataJSON() as DialogueRequest;
    requests.push(request);
    const value = request.operation === "interpret"
      ? { factId: "harbour-chain-cut" }
      : request.operation === "verbalize"
        ? "I saw the harbour chain being cut."
        : request.operation === "reflect"
          ? { summary: "I remember the harbour chain was cut." }
          : undefined;
    await route.fulfill({ json: value === undefined ? { ok: true } : { ok: true, value } });
  });
  return requests;
}

async function openConversation(page: Page): Promise<void> {
  const frame = page.locator("[data-fondale-frame]");
  const bounds = await frame.locator("canvas").boundingBox();
  if (!bounds) throw new Error("Fondale canvas is not visible.");
  await page.mouse.click(
    bounds.x + (315 / 426) * bounds.width,
    bounds.y + (150 / 240) * bounds.height,
  );
  await expect(frame.locator("[data-fondale-conversation]")).toBeVisible();
}

async function continuationSessionIds(page: Page): Promise<string[]> {
  return page.evaluate(() => Array.from({ length: localStorage.length }, (_, index) =>
    localStorage.key(index)
  ).filter((key): key is string => key?.startsWith("fondale.continuation.") ?? false)
    .map((key) => (JSON.parse(localStorage.getItem(key)!) as {
      providerSessionId: string;
    }).providerSessionId));
}

async function storedPlayerKnowledge(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const key = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index)
    ).find((candidate) => candidate?.startsWith("fondale.continuation."));
    if (!key) return [];
    const continuation = JSON.parse(localStorage.getItem(key)!) as {
      snapshot: { state: { characterKnowledge: Record<string, string[]> } };
    };
    return continuation.snapshot.state.characterKnowledge.player ?? [];
  });
}

test("Continue restores committed Game State and the provider session after reload", async ({
  page,
}) => {
  const requests = await installDialogueStandIn(page);
  await page.goto("/test/fixtures/continuation.html");
  await expect(page.locator("[data-fondale-frame]")).toBeVisible();
  const originalSessionId = requests[0]!.sessionId;
  expect(requests[0]).toEqual({ operation: "reset", sessionId: originalSessionId });

  await openConversation(page);
  const conversation = page.locator("[data-fondale-conversation]");
  await conversation.locator("[data-fondale-dialogue-input]").fill("Who cut the chain?");
  await conversation.getByRole("button", { name: "Ask" }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("I saw the harbour chain being cut.");
  await expect.poll(() => continuationSessionIds(page)).toEqual([originalSessionId]);
  const firstTurnId = requests.find(({ operation }) => operation === "interpret")!.turnId;

  const requestCountBeforeReload = requests.length;
  await page.reload();
  const startup = page.locator("[data-fondale-continuation]");
  await expect(startup.getByRole("button", { name: "Continue" })).toBeVisible();
  await expect(page.locator("[data-fondale-frame] canvas")).toHaveCount(0);
  await startup.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("[data-fondale-frame]")).toBeVisible();
  expect(requests.slice(requestCountBeforeReload)).toEqual([
    { operation: "ready", sessionId: originalSessionId },
  ]);

  const continuedConversation = page.locator("[data-fondale-conversation]");
  await continuedConversation.locator("[data-fondale-dialogue-input]").fill("Who cut it again?");
  await continuedConversation.getByRole("button", { name: "Ask" }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("I saw the harbour chain being cut.");
  const continuedTurnId = requests.filter(({ operation }) => operation === "interpret").at(-1)!.turnId;
  expect(continuedTurnId).not.toBe(firstTurnId);
  expect(requests.filter(({ turnId }) => turnId === continuedTurnId)
    .every(({ sessionId }) => sessionId === originalSessionId)).toBe(true);
  await page.locator("[data-fondale-frame]").focus();
  await page.keyboard.press(".");
  await page.locator("[data-fondale-conversation]")
    .getByRole("button", { name: "Leave" }).click();
  await expect(page.locator("[data-fondale-conversation]")).toBeHidden();
  expect(await page.evaluate(() => window.__continuationSession?.startReflection())).toBe(true);
  const reflection = page.locator("[data-fondale-reflection]");
  await reflection.locator("[data-fondale-dialogue-input]").fill("What do I remember?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("I remember the harbour chain was cut.");
  expect(requests.at(-1)).toEqual(expect.objectContaining({
    operation: "reflect",
    sessionId: originalSessionId,
    request: expect.objectContaining({
      facts: expect.arrayContaining([expect.objectContaining({ id: "harbour-chain-cut" })]),
    }),
  }));
});

test("New Game replaces continuation while other Project Identities stay isolated", async ({
  page,
}) => {
  const requests = await installDialogueStandIn(page);
  await page.goto("/test/fixtures/continuation.html?project=one");
  await expect(page.locator("[data-fondale-frame]")).toBeVisible();
  const firstSessionId = requests[0]!.sessionId;
  await expect.poll(() => continuationSessionIds(page)).toEqual([firstSessionId]);

  await page.goto("/test/fixtures/continuation.html?project=two");
  await expect(page.locator("[data-fondale-frame]")).toBeVisible();
  const secondSessionId = requests.at(-1)!.sessionId;
  expect(secondSessionId).not.toBe(firstSessionId);
  await expect.poll(() => continuationSessionIds(page)).toEqual(expect.arrayContaining([
    firstSessionId,
    secondSessionId,
  ]));

  await page.goto("/test/fixtures/continuation.html?project=one");
  const startup = page.locator("[data-fondale-continuation]");
  await startup.getByRole("button", { name: "New Game" }).click();
  await expect(page.locator("[data-fondale-frame]")).toBeVisible();
  const replacementSessionId = requests.at(-1)!.sessionId;
  expect(replacementSessionId).not.toBe(firstSessionId);
  const storedSessionIds = await continuationSessionIds(page);
  expect(storedSessionIds).toEqual(expect.arrayContaining([
    replacementSessionId,
    secondSessionId,
  ]));
});

test("automatic continuation waits for an accepted Dialogue Turn without cancelling it", async ({
  page,
}) => {
  const requests: DialogueRequest[] = [];
  let releaseInterpretation!: () => void;
  const interpretationReleased = new Promise<void>((resolve) => {
    releaseInterpretation = resolve;
  });
  await page.route("**/test-dialogue", async (route) => {
    const request = route.request().postDataJSON() as DialogueRequest;
    requests.push(request);
    if (request.operation === "interpret") {
      await interpretationReleased;
      await route.fulfill({ json: { ok: true, value: { factId: "harbour-chain-cut" } } });
      return;
    }
    const value = request.operation === "verbalize"
      ? "I saw the harbour chain being cut."
      : undefined;
    await route.fulfill({ json: value === undefined ? { ok: true } : { ok: true, value } });
  });

  await page.goto("/test/fixtures/continuation.html");
  await expect(page.locator("[data-fondale-frame]")).toBeVisible();
  await openConversation(page);
  const conversation = page.locator("[data-fondale-conversation]");
  await conversation.locator("[data-fondale-dialogue-input]").fill("Who cut the chain?");
  await conversation.getByRole("button", { name: "Ask" }).click();
  await expect(conversation.locator("[data-fondale-dialogue-input]")).toBeDisabled();
  await page.waitForTimeout(250);
  expect(requests.some(({ operation }) => operation === "cancel")).toBe(false);
  expect(await storedPlayerKnowledge(page)).not.toContain("harbour-chain-cut");

  releaseInterpretation();
  await expect(page.locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("I saw the harbour chain being cut.");
  await expect.poll(() => storedPlayerKnowledge(page)).toContain("harbour-chain-cut");
});

test("malformed or incompatible continuation leaves only a safe New Game path", async ({ page }) => {
  const requests = await installDialogueStandIn(page);
  await page.goto("/test/fixtures/continuation.html");
  await expect(page.locator("[data-fondale-frame]")).toBeVisible();
  const firstSessionId = requests[0]!.sessionId;
  await expect.poll(() => continuationSessionIds(page)).toEqual([firstSessionId]);
  await page.evaluate(() => {
    const key = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index)
    ).find((candidate) => candidate?.startsWith("fondale.continuation."))!;
    const continuation = JSON.parse(localStorage.getItem(key)!) as {
      snapshot: { projectVersion: string };
    };
    continuation.snapshot.projectVersion = "incompatible";
    localStorage.setItem(key, JSON.stringify(continuation));
  });

  await page.reload();
  const startup = page.locator("[data-fondale-continuation]");
  await expect(startup.getByRole("button", { name: "Continue" })).toHaveCount(0);
  await expect(startup.getByRole("button", { name: "New Game" })).toBeVisible();
  await expect(page.locator("[data-fondale-frame] canvas")).toHaveCount(0);
  await startup.getByRole("button", { name: "New Game" }).click();
  await expect(page.locator("[data-fondale-frame]")).toBeVisible();
  expect(requests.at(-1)!.operation).toBe("reset");
  expect(requests.at(-1)!.sessionId).not.toBe(firstSessionId);
  expect(await page.evaluate(() => window.__continuationDiagnostics)).toBeUndefined();
});
