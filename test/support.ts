import {
  AuthoringError,
  compileGameProject,
  type CompiledGameProject,
  type GameProject,
} from "../src/capabilities/game-project";
import {
  createCoreSession,
  type CoreSession,
} from "../src/capabilities/game-session";
import {
  FakeDialogueProvider,
  type DialogueProvider,
} from "../src/capabilities/dialogue";
import {
  createSave,
  type SaveSnapshotValidation,
} from "../src/capabilities/save";

export function createTestSession(
  project: GameProject,
  restored?: unknown,
  dialogueProvider: DialogueProvider = new FakeDialogueProvider({
    interpretations: {},
    verbalizations: {},
  }),
): CoreSession {
  const compiledProject = compileTestGameProject(project);
  if (restored === undefined) return createCoreSession(compiledProject, undefined, dialogueProvider);
  const validation = createSave(compiledProject).validate(restored);
  if (!validation.ok) throw new AuthoringError(validation.diagnostics);
  return createCoreSession(compiledProject, validation.snapshot, dialogueProvider);
}

export function validateTestSaveSnapshot(
  project: GameProject,
  value: unknown,
): SaveSnapshotValidation {
  return createSave(compileTestGameProject(project)).validate(value);
}

export function compileTestGameProject(project: GameProject): CompiledGameProject {
  const compilation = compileGameProject(project);
  if (!compilation.ok) throw new AuthoringError(compilation.diagnostics);
  return compilation.project;
}
