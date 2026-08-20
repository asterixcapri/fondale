import { startGame, type GameSession } from "fondale";

import { project } from "./game";

const storageKey = `${project.identity}/continuation`;

/** A Save Snapshot is JSON-safe: store it as it is, with no transformation. */
export function store(session: GameSession): void {
  localStorage.setItem(storageKey, JSON.stringify(session.createSaveSnapshot()));
}

/**
 * Stored data comes back as `unknown` on purpose.
 *
 * `startGame` validates it against the current project before any browser or
 * asset work, so an incompatible or tampered save fails early and cleanly
 * rather than half-restoring a world.
 */
export async function restore(target: HTMLElement): Promise<GameSession> {
  const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "null");
  if (stored === null) return startGame(project, { target });
  return startGame(project, { target, snapshot: stored });
}
