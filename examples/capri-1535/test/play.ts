import type { CoreSession } from "@asterixcapri/fondale";

/**
 * The one place the Core suite knows how a Player drives Capri 1535.
 *
 * Everything here goes through the seam the browser adapter drives itself: the
 * same inputs a pointer and a keyboard produce, the same simulated time, the
 * same presentations. Nouns are addressed by the Label a Player reads rather
 * than by a Scene Space coordinate, and time is advanced in steps rather than
 * waited for, which is what makes a whole journey cost milliseconds.
 */

/** One simulated frame, matching the fixed step the browser loop advances by. */
export function step(session: CoreSession, count = 1): void {
  session.steps(count);
}

/** Steps until the condition holds, and fails rather than hang. */
export function until(
  session: CoreSession,
  what: string,
  holds: () => boolean,
  limit = 4_000,
): void {
  for (let taken = 0; taken < limit; taken += 1) {
    if (holds()) return;
    session.steps(1);
  }
  throw new Error(`${what} never happened within ${limit} steps.`);
}

/** The Line, Narration or choice a Player currently reads, if any. */
export function narrative(session: CoreSession): {
  kind: string;
  speaker?: string;
  text: string;
  alternatives?: readonly string[];
} | null {
  const presented = session.hud().narrative;
  if (!presented) return null;
  if (presented.kind === "line") {
    return { kind: "line", speaker: presented.speaker, text: presented.text };
  }
  if (presented.kind === "narration") return { kind: "narration", text: presented.text };
  return {
    kind: "choice",
    text: "",
    alternatives: presented.alternatives.map((one) => one.label),
  };
}

/** Picks one alternative a directed Sequence offers, by the text a Player reads. */
export function pick(session: CoreSession, label: string): void {
  const presented = session.hud().narrative;
  if (presented?.kind !== "choice") throw new Error("No Sequence choice is presented.");
  const alternative = presented.alternatives.find((one) => one.label.includes(label));
  if (!alternative) {
    throw new Error(
      `No choice "${label}". Offered: ${presented.alternatives.map((one) => one.label).join(" | ")}`,
    );
  }
  session.hudInput({ type: "choose", alternative: alternative.index });
  session.steps(1);
}

/** Steps until the presented Line or Narration contains the authored substance. */
export function hear(session: CoreSession, contains: string, speaker?: string): void {
  until(session, `a line containing "${contains}"`, () => {
    const presented = narrative(session);
    if (!presented?.text.includes(contains)) return false;
    return speaker === undefined || presented.speaker === speaker;
  });
}

/** Advances the current narrative activity the way the keyboard does. */
export function advance(session: CoreSession): void {
  session.hudInput({ type: "advance-activity" });
  session.steps(1);
}

/**
 * Advances through presented Lines until the wanted one is read, then dismisses
 * it. Intervening beats are stepped past the way a Player presses on through
 * them, so a spec names only the Lines it is proving.
 */
export function advanceTo(
  session: CoreSession,
  contains: string,
  speaker?: string,
  beats = 40,
): void {
  for (let beat = 0; beat < beats; beat += 1) {
    session.steps(20);
    const presented = narrative(session);
    if (
      presented?.text.includes(contains) &&
      (speaker === undefined || presented.speaker === speaker)
    ) {
      advance(session);
      return;
    }
    advance(session);
  }
  throw new Error(
    `No Line containing "${contains}"${speaker ? ` from ${speaker}` : ""} within ${beats} beats.`,
  );
}

/**
 * Presses on through everything currently presented until play is idle again.
 *
 * This is the "and then Michele got on with it" of the suite: a spec that is not
 * proving a particular Line does not have to name the beats it walks past.
 */
export function clear(session: CoreSession, beats = 80): void {
  for (let beat = 0; beat < beats; beat += 1) {
    rest(session);
    if (session.hud().commandResponse !== null) {
      session.hudInput({ type: "dismiss-response" });
      session.steps(1);
      continue;
    }
    const snapshot = session.snapshot();
    if (snapshot.activity === null && session.hud().narrative === null) return;
    if (session.conversation() !== null || session.reflection() !== null) return;
    advance(session);
  }
  throw new Error("Play never became idle.");
}

/** Skips the running Sequence the way Escape does. */
export function skipSequence(session: CoreSession): void {
  session.hudInput({ type: "skip-sequence" });
  session.steps(1);
}

/** Every Noun the reveal affordance currently advertises, by Label. */
export function revealed(session: CoreSession): readonly string[] {
  session.hudInput({ type: "set-nouns-revealed", revealed: true });
  return session.hud().nouns.map((noun) => noun.label);
}

/**
 * Activates a Noun by the Label a Player reads, and lets play settle.
 *
 * No walking towards it first: the browser suite had to bring a target into the
 * viewport before it could be clicked, but presentation is the adapter's problem.
 * A Noun the world offers is offered here whatever the Camera happens to show,
 * and Michele walks to its Approach Point himself.
 */
export function activate(
  session: CoreSession,
  label: string,
  options: { readonly action?: "primary" | "secondary" } = {},
): void {
  session.hudInput({ type: "set-nouns-revealed", revealed: true });
  const noun = session.hud().nouns.find((candidate) => candidate.label === label);
  if (!noun) {
    throw new Error(
      `No Noun labelled "${label}". Offered: ${revealed(session).join(", ")}`,
    );
  }
  session.hudInput({ type: "activate-noun", target: noun.target, action: options.action ?? "primary" });
  rest(session);
}

/** Walks Michele to a Scene Space point and waits until he arrives. */
export function walkTo(session: CoreSession, point: { x: number; y: number }): void {
  session.input({ type: "move", point, fast: true });
  rest(session);
}

/**
 * Whether the Game Session has finished reacting to what it was told.
 *
 * Play is at rest when nothing resolves on its own any more: no walk in flight,
 * no interaction still waiting to be reached, no Sequence direction running. A
 * presented Line, Narration, choice, Conversation or Reflection *is* rest — the
 * game has done its part and is waiting for the Player.
 *
 * Every walk is a pending Player intent, a plain move included, so this needs no
 * sampling of positions and no tolerance for how long an effect takes to land:
 * pulling the fishing nets commits its outcome some ninety steps after Michele
 * stops walking, and the intent is pending for every one of them.
 */
export function atRest(session: CoreSession): boolean {
  const activity = session.snapshot().activity;
  if (activity === null) return true;
  if (activity.type === "player-intent") return false;
  if (activity.type === "sequence") return activity.active?.kind !== "direction";
  return true;
}

/**
 * Steps until play has finished reacting, and fails rather than hang.
 *
 * Rest has to hold for a run of steps rather than for one. From outside, an
 * `activity` of `null` means both "idle" and "between two states": the walk that
 * carried an intent is over, but what the intent commits has not been applied
 * yet. The Engine knows the difference — it still holds the queued input — and
 * nothing in Game State reports it, so the run of quiet steps stands in.
 */
export function rest(session: CoreSession, limit = 8_000): void {
  let quiet = 0;
  for (let taken = 0; taken < limit; taken += 1) {
    quiet = atRest(session) ? quiet + 1 : 0;
    if (quiet >= 30) return;
    session.steps(1);
  }
  throw new Error("Play never came to rest.");
}

/**
 * Selects a carried Object, so the next activation uses it on its target.
 *
 * Selecting is a toggle in the HUD, so an already selected Object is left alone:
 * a spec that selects the same flask twice — once per unsupported combination it
 * is proving — must not silently put it back.
 */
export function select(session: CoreSession, object: string): void {
  const entry = session.hud().inventory.entries.find((candidate) => candidate.object === object);
  if (!entry) throw new Error(`"${object}" is not carried.`);
  if (entry.selected) return;
  session.hudInput({ type: "activate-inventory", object, action: "primary" });
  session.steps(1);
}

/** The Objects Michele carries. */
export function carried(session: CoreSession): readonly string[] {
  return session.snapshot().inventory.objects;
}

/** Chooses an authored Conversation alternative by the text a Player reads. */
export function choose(session: CoreSession, text: string): void {
  const open = session.conversation();
  if (!open) throw new Error("No Conversation is open.");
  const alternative = open.alternatives.find((candidate) => candidate.text === text);
  if (!alternative) {
    throw new Error(
      `No alternative "${text}". Offered: ${open.alternatives.map((one) => one.text).join(" | ")}`,
    );
  }
  session.input({ type: "select-alternative", alternative: alternative.index });
  session.steps(1);
}

/** Leaves the open Conversation. */
export function leaveConversation(session: CoreSession): void {
  session.input({ type: "escape" });
  rest(session);
}

/** The Detail View presented in place of the world, if one is. */
export function detailView(session: CoreSession): string | undefined {
  return session.snapshot().detailView;
}

/**
 * Asks Michele's Reflection one question and returns what he answers.
 *
 * Reflection reaches the Dialogue Provider, so this is asynchronous where the
 * rest of the vocabulary is not: the answer arrives as a Promise and the caller
 * awaits it, exactly as the browser adapter does.
 */
export async function reflect(session: CoreSession, question: string): Promise<string> {
  if (!session.startReflection()) throw new Error("Reflection did not open.");
  session.steps(1);
  const submission = await session.submitReflection(question);
  if (!submission.ok) throw new Error(`Reflection refused the question: ${submission.message}`);
  session.steps(1);
  const answered = narrative(session);
  return answered?.text ?? "";
}

/** Closes an open Reflection, whatever it is currently showing. */
export function leaveReflection(session: CoreSession): void {
  session.input({ type: "escape" });
  rest(session);
}

/**
 * Asks one free-form question inside the open Conversation and returns the answer.
 *
 * Both Lines are dismissed before returning, so the Conversation is back at its
 * input field and the next question can follow immediately.
 */
export async function ask(session: CoreSession, question: string): Promise<string> {
  const submission = await session.submitDialogue(question);
  if (!submission.ok) throw new Error(`The Conversation refused the question: ${submission.message}`);
  session.steps(1);
  advance(session);
  session.steps(1);
  const answered = narrative(session);
  advance(session);
  return answered?.text ?? "";
}
