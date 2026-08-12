import {
  AuthoringError,
  type AuthoringDiagnostic,
} from "../src/capabilities/game-project";

export function validateTestDefinition<T>(
  value: T,
  validate: (value: T) => readonly AuthoringDiagnostic[],
): T {
  const diagnostics = validate(value);
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return value;
}
