import {
  AuthoringError,
  startGame,
  type GameProject,
} from "@asterixcapri/fondale";

export async function restoreStoredProject(
  project: GameProject,
  target: HTMLElement,
  stored: unknown,
) {
  try {
    const session = await startGame(project, { target, snapshot: stored });
    return { ok: true as const, session, snapshot: session.createSaveSnapshot() };
  } catch (error) {
    if (error instanceof AuthoringError) {
      return { ok: false as const, diagnostics: error.diagnostics };
    }
    throw error;
  }
}
