import { type GameProject } from "fondale";
import { pressOn, startCoreSession, type CoreSession } from "fondale/testing";

import { prologueDialogue, type PrologueDialogue } from "./dialogue";
import { project } from "../src/game";

export interface ExampleSession {
  readonly session: CoreSession;
  readonly dialogue: PrologueDialogue;
}

/**
 * Starts the Example and stops where the opening does, still holding the Scene.
 *
 * The harbour is the initial Scene and declares a Scene Opening case naming no
 * Entrance, so a new game begins under a Sequence and no frame of Player
 * control precedes it. Everything that plays from the beginning therefore reads
 * through the opening first — `pressOn` below — which is exactly what an author
 * adopting a Scene Opening has to do to their own suite. Only the spec that
 * proves the opening stages starts here instead.
 */
export function startExampleUnopened(): CoreSession {
  return startCoreSession(project, { dialogueProvider: prologueDialogue() });
}

/** Starts the Example with no renderer: the seam the browser adapter drives too. */
export function startExample(): CoreSession {
  const session = startExampleUnopened();
  pressOn(session);
  return session;
}

/** Starts the Example and keeps the Dialogue Provider a spec can steer. */
export function startExampleWithDialogue(): ExampleSession {
  const dialogue = prologueDialogue();
  const session = startCoreSession(project, { dialogueProvider: dialogue });
  pressOn(session);
  return { session, dialogue };
}

/**
 * Starts the real Game Project with the Player standing at one Scene's Entrance.
 *
 * A Scene is not runnable on its own — it needs a Player Character, an initial
 * Scene and everything its Nouns reference — so driving one in isolation used to
 * mean a bespoke stand-in Project per Scene. Moving the Player's starting point
 * instead drives the Scene the Players actually meet, with no second definition
 * of anything to drift out of step.
 *
 * Starting at an Entrance is not arriving through it. Beginning a game in a
 * Scene is a Scene Opening in which no door was used, so a case naming an
 * Entrance — the fortification's landing Sequence, for one — does not apply
 * here, and each Scene is met in its resting state rather than mid-staging. A
 * case naming no Entrance would apply, which is why the harbour, the only Scene
 * that declares one, is driven through `startExample` instead.
 */
export function startExampleAt(
  scene: string,
  entrance: string,
): CoreSession {
  const game: GameProject = project;
  const played = game.playerCharacter!;
  const characters = game.characters!;
  const player = characters[played]!;
  const at = game.scenes[scene]?.entrances?.[entrance];
  if (!at) throw new Error(`Scene "${scene}" declares no Entrance "${entrance}".`);
  return startCoreSession({
    ...game,
    initialScene: scene,
    characters: {
      ...characters,
      [played]: {
        ...player,
        initialScene: scene,
        initialGroundPoint: at.groundPoint,
        initialFacing: at.facing,
      },
    },
  }, { dialogueProvider: prologueDialogue() });
}

/**
 * Resumes from the automatic Continuation State, the way reopening the game does.
 *
 * A spec uses this to prove that what play committed survives a restart, which
 * is the only thing a Player can ever rely on.
 */
export function continueSession(session: CoreSession): CoreSession {
  const continuation = session.createContinuationSnapshot();
  if (!continuation) throw new Error("Play is not at a committed boundary.");
  return startCoreSession(project, {
    restored: JSON.parse(JSON.stringify(continuation.snapshot)),
    dialogueProvider: prologueDialogue(),
  });
}
