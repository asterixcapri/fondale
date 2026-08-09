import {
  startGame,
  validateSaveSnapshot,
  type GameProject,
} from "@asterixcapri/fondale";

export async function restoreStoredProject(
  project: GameProject,
  target: HTMLElement,
  stored: unknown,
) {
  const result = validateSaveSnapshot(project, stored);
  if (!result.ok) return { ok: false as const, diagnostics: result.diagnostics };
  const session = await startGame(project, { target, snapshot: result.snapshot });
  return { ok: true as const, session, snapshot: session.createSaveSnapshot() };
}
