import { type GameProject } from "fondale";
import { startCoreSession, type CoreSession } from "fondale/testing";

import { prologueDialogue, type PrologueDialogue } from "./dialogue";
import { project } from "../src/game";

export interface ExampleSession {
  readonly session: CoreSession;
  readonly dialogue: PrologueDialogue;
}

/** Starts the Example with no renderer: the seam the browser adapter drives too. */
export function startExample(): CoreSession {
  return startCoreSession(project, { dialogueProvider: prologueDialogue() });
}

/** Starts the Example and keeps the Dialogue Provider a spec can steer. */
export function startExampleWithDialogue(): ExampleSession {
  const dialogue = prologueDialogue();
  return { session: startCoreSession(project, { dialogueProvider: dialogue }), dialogue };
}

/**
 * Starts the real Game Project with the Player standing at one Scene's Entrance.
 *
 * A Scene is not runnable on its own — it needs a Player Character, an initial
 * Scene and everything its Nouns reference — so driving one in isolation used to
 * mean a bespoke stand-in Project per Scene. Moving the Player's starting point
 * instead drives the Scene the Players actually meet, with no second definition
 * of anything to drift out of step.
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
