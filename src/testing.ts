import { type ConversationPresentation, type CoreSession } from "./capabilities/game-session";
import { type Point } from "./capabilities/world";

export {
  startCoreSession,
  type CoreEffect,
  type CoreInput,
  type CoreSession,
  type CoreWorldTarget,
  type GameState,
} from "./capabilities/game-session";

/**
 * Driving a Game Project from a test, without a renderer.
 *
 * A Core Session speaks the vocabulary a browser adapter translates into: input
 * kinds, target indices and simulated steps. Writing a game's own tests against
 * that vocabulary means learning which input drives what, and every author
 * learns it by getting it wrong — a Conversation alternative is chosen with one
 * input and a Sequence choice with another, a Noun is addressed by an index the
 * Player never sees, and an activation walked to lands long after the walk ends.
 *
 * These functions say the same things in the terms a Player would: activate the
 * thing labelled this, choose the answer that reads like that, let play settle.
 * What they never contain is a game's own story; that belongs to the game.
 *
 * Starting a Game Project without a renderer belongs here too: `startCoreSession`
 * is how a test opens the game, and the runtime entry point stays what a shipped
 * game imports to run — `startGame` and its `GameSession`.
 */

/** How many simulated steps `settle` will take before it gives up. */
const settleLimit = 8_000;

/**
 * Advances simulated time until play has finished reacting.
 *
 * Fails rather than hang: a game that never comes to rest is a defect, and a
 * test that waits for it forever reports nothing.
 */
export function settle(session: CoreSession, limit = settleLimit): void {
  for (let taken = 0; taken < limit; taken += 1) {
    if (session.atRest()) return;
    session.steps(1);
  }
  throw new Error(`Play did not come to rest within ${limit} steps.`);
}

/** Every Noun the Player could reach right now, by the Label they read. */
export function revealedNouns(session: CoreSession): readonly string[] {
  session.hudInput({ type: "set-nouns-revealed", revealed: true });
  return session.hud().nouns.map((noun) => noun.label);
}

/**
 * Activates the Noun carrying this Label, then lets play settle.
 *
 * `secondary` is the alternative command a Player reaches with the other mouse
 * button, where the Noun offers one.
 */
export function activateNoun(
  session: CoreSession,
  label: string,
  action: "primary" | "secondary" = "primary",
): void {
  session.hudInput({ type: "set-nouns-revealed", revealed: true });
  const noun = session.hud().nouns.find((candidate) => candidate.label === label);
  if (!noun) {
    throw new Error(
      `No Noun labelled "${label}". Offered: ${revealedNouns(session).join(", ") || "none"}`,
    );
  }
  session.hudInput({ type: "activate-noun", target: noun.target, action });
  settle(session);
}

/**
 * Selects a carried Object, so the next activation uses it on its target.
 *
 * See {@link deselectObject} for putting it back.
 */
export function selectObject(session: CoreSession, object: string): void {
  const carried = session.hud().inventory.entries
    .find((candidate) => candidate.object === object);
  if (!carried) throw new Error(`"${object}" is not carried.`);
  // Selecting is a toggle, so an already selected Object is left alone: a test
  // that selects the same Object twice must not silently put it back.
  if (carried.selected) return;
  session.hudInput({ type: "activate-inventory", object, action: "primary" });
  session.steps(1);
}

/**
 * Puts a selected Object back, the way clicking its drawer entry again does.
 *
 * Naming the Object is deliberate. Only one can be selected, so the argument
 * looks redundant — but it makes a test say what it believes it is putting
 * back, and fail loudly when something else is in hand rather than silently
 * deselecting the wrong thing.
 */
export function deselectObject(session: CoreSession, object: string): void {
  const carried = session.hud().inventory.entries
    .find((candidate) => candidate.object === object);
  if (!carried) throw new Error(`"${object}" is not carried.`);
  // The other half of the same toggle: an Object that is not selected is left
  // alone, so deselecting twice cannot pick it back up.
  if (!carried.selected) return;
  session.hudInput({ type: "activate-inventory", object, action: "primary" });
  session.steps(1);
}

/** Advances whatever is presented, the way one key does for a Player. */
export function advanceActivity(session: CoreSession): void {
  session.hudInput({ type: "advance-activity" });
  session.steps(1);
}

/**
 * Answers with the alternative that reads like this, wherever it is offered.
 *
 * A Conversation and a Sequence both offer written alternatives and each takes a
 * different input. Which one is open is the Engine's business, not the caller's.
 */
export function chooseAlternative(session: CoreSession, text: string): void {
  const presented = session.hud().narrative;
  if (presented?.kind === "choice") {
    const choice = presented.alternatives.find((one) => one.label.includes(text));
    if (!choice) throw new Error(offered(presented.alternatives.map((one) => one.label), text));
    session.hudInput({ type: "choose", alternative: choice.index });
    session.steps(1);
    return;
  }
  const conversation: ConversationPresentation | null = session.conversation();
  const alternative = conversation?.alternatives.find((one) => one.text === text);
  if (!alternative) {
    throw new Error(offered(conversation?.alternatives.map((one) => one.text) ?? [], text));
  }
  session.input({ type: "select-alternative", alternative: alternative.index });
  session.steps(1);
}

/** The Line or Narration a Player is reading, if any. */
export function presentedLine(session: CoreSession): PresentedLine | null {
  const presented = session.hud().narrative;
  if (!presented) return null;
  if (presented.kind === "line") {
    return { kind: "line", speaker: presented.speaker, text: presented.text };
  }
  if (presented.kind === "narration") return { kind: "narration", text: presented.text };
  return { kind: "choice", text: "", alternatives: presented.alternatives.map((one) => one.label) };
}

/** What a Player is reading: who speaks, what is said, what may be answered. */
export interface PresentedLine {
  readonly kind: "line" | "narration" | "choice";
  readonly speaker?: string;
  readonly text: string;
  readonly alternatives?: readonly string[];
}

/** Skips the running Sequence, the way a Player presses Escape. */
export function skipSequence(session: CoreSession): void {
  session.hudInput({ type: "skip-sequence" });
  session.steps(1);
}

/** Leaves the open Conversation or Reflection, the way a Player presses Escape. */
export function leaveActivity(session: CoreSession): void {
  session.input({ type: "escape" });
  settle(session);
}

/** Walks the Player Character to a Scene Space point and waits for the arrival. */
export function walkTo(session: CoreSession, point: Point): void {
  session.input({ type: "move", point, fast: true });
  settle(session);
}

/** The Objects the Player Character carries. */
export function carriedObjects(session: CoreSession): readonly string[] {
  return session.snapshot().inventory.objects;
}

/** The Detail View presented in place of the world, if one is. */
export function presentedDetailView(session: CoreSession): string | undefined {
  return session.snapshot().detailView;
}

/**
 * Presses on through everything presented until play is idle again.
 *
 * This is the "and then they got on with it" of a suite: a test that is not
 * proving a particular Line does not have to name the beats it walks past. A
 * Conversation or Reflection stops it, because those wait for what to say next
 * rather than for permission to continue.
 */
export function pressOn(session: CoreSession, beats = 80): void {
  for (let beat = 0; beat < beats; beat += 1) {
    settle(session);
    if (session.hud().commandResponse !== null) {
      session.hudInput({ type: "dismiss-response" });
      session.steps(1);
      continue;
    }
    if (session.snapshot().activity === null && session.hud().narrative === null) return;
    if (session.conversation() !== null || session.reflection() !== null) return;
    advanceActivity(session);
  }
  throw new Error(`Play was still busy after ${beats} beats.`);
}

/**
 * Presses on until the wanted Line is read, then dismisses it.
 *
 * Naming the substance rather than the sentence is deliberate: a test that
 * repeats an authored Line word for word fails when the wording is improved,
 * which is editing, not a defect.
 */
export function advanceToLine(
  session: CoreSession,
  contains: string,
  speaker?: string,
  beats = 40,
): void {
  for (let beat = 0; beat < beats; beat += 1) {
    session.steps(20);
    const presented = presentedLine(session);
    const wanted = presented?.text.includes(contains) &&
      (speaker === undefined || presented.speaker === speaker);
    advanceActivity(session);
    if (wanted) return;
  }
  throw new Error(
    `No Line containing "${contains}"${speaker ? ` from ${speaker}` : ""} within ${beats} beats.`,
  );
}

/** Advances simulated time until the condition holds, and fails rather than hang. */
export function stepUntil(
  session: CoreSession,
  expectation: string,
  holds: () => boolean,
  limit = 4_000,
): void {
  for (let taken = 0; taken < limit; taken += 1) {
    if (holds()) return;
    session.steps(1);
  }
  throw new Error(`${expectation} did not happen within ${limit} steps.`);
}

/**
 * Asks the Player Character's Reflection one question and returns the answer.
 *
 * Reflection reaches the Dialogue Provider, so this is asynchronous where the
 * rest is not: the answer arrives as a Promise, exactly as an adapter sees it.
 */
export async function reflect(session: CoreSession, question: string): Promise<string> {
  if (!session.startReflection()) throw new Error("Reflection did not open.");
  session.steps(1);
  const submitted = await session.submitReflection(question);
  if (!submitted.ok) throw new Error(`Reflection refused the question: ${submitted.message}`);
  session.steps(1);
  return presentedLine(session)?.text ?? "";
}

/**
 * Asks one free-form question inside the open Conversation and returns the answer.
 *
 * Both Lines are dismissed before returning, so the Conversation is back at its
 * input field and the next question can follow immediately.
 */
export async function ask(session: CoreSession, question: string): Promise<string> {
  const submitted = await session.submitDialogue(question);
  if (!submitted.ok) throw new Error(`The Conversation refused the question: ${submitted.message}`);
  session.steps(1);
  advanceActivity(session);
  session.steps(1);
  const answered = presentedLine(session);
  advanceActivity(session);
  return answered?.text ?? "";
}

function offered(alternatives: readonly string[], wanted: string): string {
  return `No alternative "${wanted}". Offered: ${alternatives.join(" | ") || "none"}`;
}
