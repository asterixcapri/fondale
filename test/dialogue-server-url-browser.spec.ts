import { expect, test, type Locator, type Page } from "@playwright/test";

type DialogueOperation = "interpret" | "verbalize" | "reflect" | "cancel" | "ready" | "reset";
type DialogueRequest = {
  readonly operation: DialogueOperation;
  readonly sessionId: string;
  readonly request?: {
    readonly narrativeContext?: string;
    readonly playerInput?: string;
  };
};

async function openFirstConversation(page: Page): Promise<Locator> {
  await page.goto("/test/fixtures/dialogue-server-url.html");
  await expect.poll(() => page.evaluate(() => window.__dialogueUrlSessions?.length)).toBe(2);
  const firstFrame = page.locator("[data-fondale-frame]").first();
  await openConversation(firstFrame);
  return firstFrame;
}

async function openConversation(frame: Locator): Promise<Locator> {
  const bounds = await frame.locator("canvas").boundingBox();
  if (!bounds) throw new Error("Fondale canvas is not visible.");
  await frame.page().mouse.click(
    bounds.x + (315 / 426) * bounds.width,
    bounds.y + (150 / 240) * bounds.height,
  );
  return frame.locator("[data-fondale-conversation]");
}

async function askFirstCharacter(frame: Locator, question: string): Promise<void> {
  const conversation = await openConversation(frame);
  await conversation.locator("[data-fondale-dialogue-input]").fill(question);
  await conversation.getByRole("button", { name: "Ask" }).click();
}

test("browser startup connects declared Dialogue Server URLs with isolated Game Sessions", async ({
  page,
}) => {
  const requests: DialogueRequest[] = [];
  await page.route("**/test-dialogue", async (route) => {
    requests.push(route.request().postDataJSON() as DialogueRequest);
    await route.fulfill({ json: { ok: true } });
  });

  await page.goto("/test/fixtures/dialogue-server-url.html");
  await expect.poll(() => page.evaluate(() => window.__dialogueUrlSessions?.length)).toBe(2);

  expect(requests).toEqual([
    { operation: "reset", sessionId: expect.any(String) },
    { operation: "reset", sessionId: expect.any(String) },
  ]);
  expect(requests[0]!.sessionId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  expect(requests[1]!.sessionId).not.toBe(requests[0]!.sessionId);
});

test("one Dialogue Server URL serves two Game Projects with their own Narrative Context", async ({
  page,
}) => {
  const requests: DialogueRequest[] = [];
  await page.route("**/test-dialogue", async (route) => {
    const request = route.request().postDataJSON() as DialogueRequest;
    requests.push(request);
    const value = request.operation === "interpret"
      ? { factId: "harbour-chain-cut" }
      : request.operation === "verbalize"
        ? `Answer framed by: ${request.request?.narrativeContext}`
        : undefined;
    await route.fulfill({ json: value === undefined ? { ok: true } : { ok: true, value } });
  });

  await page.goto("/test/fixtures/dialogue-server-url.html");
  await expect.poll(() => page.evaluate(() => window.__dialogueUrlSessions?.length)).toBe(2);
  const frames = page.locator("[data-fondale-frame]");
  await askFirstCharacter(frames.nth(0), "What happened here?");
  await expect(frames.nth(0).locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("Capri in 1535");
  await askFirstCharacter(frames.nth(1), "What happened here?");
  await expect(frames.nth(1).locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("Mars in 2248");

  const dialogueRequests = requests.filter(({ operation }) =>
    operation === "interpret" || operation === "verbalize"
  );
  expect(dialogueRequests.map(({ request }) => request?.narrativeContext)).toEqual([
    "A historical mystery in the harbour of Capri in 1535.",
    "A historical mystery in the harbour of Capri in 1535.",
    "A scientific mystery on Mars in 2248.",
    "A scientific mystery on Mars in 2248.",
  ]);
  expect(new Set(dialogueRequests.map(({ sessionId }) => sessionId)).size).toBe(2);
});

test("browser startup distinguishes a rejected connection without exposing server details", async ({
  page,
}) => {
  await page.route("**/test-dialogue", (route) => route.fulfill({
    status: 500,
    json: { ok: false, error: "DATABASE_URL=postgresql://admin:secret@database" },
  }));

  await page.goto("/test/fixtures/dialogue-server-url.html");
  await expect.poll(() => page.evaluate(() => window.__dialogueUrlDiagnostics)).toEqual([{
    code: "environment.dialogue-server.connection-failed",
    family: "environment",
    owner: "dialogue",
    path: "startGame.dialogueServerUrl",
    message: "The declared Dialogue Server rejected its connection check.",
    suggestion: "Verify dialogueServerUrl and the Dialogue Server configuration.",
  }]);
  expect(JSON.stringify(await page.evaluate(() => window.__dialogueUrlDiagnostics)))
    .not.toContain("secret");
});

test("browser startup reports an unreachable Dialogue Server actionably", async ({ page }) => {
  await page.route("**/test-dialogue", (route) => route.abort("connectionrefused"));

  await page.goto("/test/fixtures/dialogue-server-url.html");
  await expect.poll(() => page.evaluate(() => window.__dialogueUrlDiagnostics)).toEqual([{
    code: "environment.dialogue-server.unreachable",
    family: "environment",
    owner: "dialogue",
    path: "startGame.dialogueServerUrl",
    message: "Fondale could not reach the declared Dialogue Server.",
    suggestion: "Start the Dialogue Server and verify dialogueServerUrl.",
  }]);
});

test("URL-backed Save Snapshot restoration checks readiness without resetting memory", async ({
  page,
}) => {
  const requests: DialogueRequest[] = [];
  await page.route("**/test-dialogue", async (route) => {
    requests.push(route.request().postDataJSON() as DialogueRequest);
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto("/test/fixtures/dialogue-server-url.html");
  await expect.poll(() => page.evaluate(() => window.__dialogueUrlSessions?.length)).toBe(2);

  await page.evaluate(() => window.__restoreFirstDialogueUrlSession!());

  expect(requests.at(-1)).toEqual({
    operation: "ready",
    sessionId: expect.any(String),
  });
});

test("Conversation and Reflection use the HTTP protocol behind the declared URL", async ({ page }) => {
  const requests: DialogueRequest[] = [];
  await page.route("**/test-dialogue", async (route) => {
    const request = route.request().postDataJSON() as DialogueRequest;
    requests.push(request);
    const value = request.operation === "interpret"
      ? { factId: "harbour-chain-cut" }
      : request.operation === "verbalize"
        ? "I saw the harbour chain being cut."
        : request.operation === "reflect"
          ? { summary: "I know the harbour chain was cut." }
          : undefined;
    await route.fulfill({ json: value === undefined ? { ok: true } : { ok: true, value } });
  });
  const firstFrame = await openFirstConversation(page);
  const conversation = firstFrame.locator("[data-fondale-conversation]");
  await conversation.locator("[data-fondale-dialogue-input]").fill("Who cut the chain?");
  await conversation.getByRole("button", { name: "Ask" }).click();
  await expect(firstFrame.locator('[data-fondale-line][data-fondale-speaker="antonio"]'))
    .toContainText("I saw the harbour chain being cut.");
  await firstFrame.focus();
  await page.keyboard.press(".");
  await conversation.getByRole("button", { name: "Leave" }).click();
  await expect(conversation).toBeHidden();

  expect(await page.evaluate(() => window.__dialogueUrlSessions?.[0].startReflection())).toBe(true);
  const reflection = firstFrame.locator("[data-fondale-reflection]");
  await reflection.locator("[data-fondale-dialogue-input]").fill("What have I learned?");
  await reflection.getByRole("button", { name: "Reflect" }).click();
  await expect(firstFrame.locator('[data-fondale-line][data-fondale-speaker="player"]'))
    .toContainText("I know the harbour chain was cut.");

  expect(requests.map(({ operation }) => operation)).toEqual([
    "reset", "reset", "interpret", "verbalize", "reflect",
  ]);
  expect(new Set(requests.slice(2).map(({ sessionId }) => sessionId)).size).toBe(1);
  expect(requests.slice(2).map(({ request }) => request?.narrativeContext)).toEqual([
    "A historical mystery in the harbour of Capri in 1535.",
    "A historical mystery in the harbour of Capri in 1535.",
    "A historical mystery in the harbour of Capri in 1535.",
  ]);
});

test("URL-backed turns cancel over HTTP when the Player leaves", async ({ page }) => {
  const requests: DialogueRequest[] = [];
  let releaseInterpretation!: () => void;
  const holdInterpretation = new Promise<void>((resolve) => {
    releaseInterpretation = resolve;
  });
  await page.route("**/test-dialogue", async (route) => {
    const request = route.request().postDataJSON() as DialogueRequest;
    requests.push(request);
    if (request.operation === "interpret") {
      await holdInterpretation;
      await route.fulfill({ json: { ok: true, value: { factId: "harbour-chain-cut" } } })
        .catch(() => undefined);
      return;
    }
    await route.fulfill({ json: { ok: true } });
  });
  const firstFrame = await openFirstConversation(page);
  const conversation = firstFrame.locator("[data-fondale-conversation]");
  await expect(conversation).toBeVisible();
  await conversation.locator("[data-fondale-dialogue-input]").fill("Wait for this answer.");
  await conversation.getByRole("button", { name: "Ask" }).click();
  await expect(conversation.locator("[data-fondale-dialogue-input]")).toBeDisabled();
  await conversation.getByRole("button", { name: "Leave" }).click();
  await expect.poll(() => requests.map(({ operation }) => operation)).toContain("cancel");
  releaseInterpretation();

  const firstSessionId = requests.find(({ operation }) => operation === "interpret")!.sessionId;
  expect(requests.filter(({ operation, sessionId }) =>
    operation === "reset" && sessionId === firstSessionId
  )).toHaveLength(1);
});
