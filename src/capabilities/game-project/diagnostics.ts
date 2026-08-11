/** Stable categories identifying why authored input was rejected. */
export type AuthoringDiagnosticFamily =
  | "definition"
  | "reference"
  | "state"
  | "save"
  | "asset"
  | "environment";

/** Stable owner of the rule that produced an Authoring Diagnostic. */
export type AuthoringDiagnosticOwner =
  | "game-project"
  | "game-session"
  | "world"
  | "interaction"
  | "sequence"
  | "animation"
  | "camera"
  | "hud"
  | "save"
  | "browser";

/**
 * A machine-identifiable explanation of invalid authored or restored data.
 *
 * Codes, families, and author-facing paths are stable API. Messages and safe
 * suggestions may become clearer in compatible releases.
 */
export interface AuthoringDiagnostic {
  readonly code: string;
  readonly family: AuthoringDiagnosticFamily;
  readonly owner: AuthoringDiagnosticOwner;
  readonly path: string;
  readonly message: string;
  readonly suggestion?: string;
  readonly cause?: unknown;
}

/** The single error thrown when authored definitions contain one or more problems. */
export class AuthoringError extends Error {
  readonly diagnostics: readonly AuthoringDiagnostic[];

  constructor(diagnostics: readonly AuthoringDiagnostic[]) {
    const attributed = diagnostics.map((diagnostic) => Object.freeze({
      ...diagnostic,
      owner: inferredOwner(diagnostic),
    }));
    const ordered = attributed.sort((left, right) =>
      `${left.path}\0${left.code}`.localeCompare(`${right.path}\0${right.code}`),
    );
    super(ordered.map(({ path, message }) => `${path}: ${message}`).join("\n"));
    this.name = "AuthoringError";
    this.diagnostics = Object.freeze(ordered);
  }
}

function inferredOwner(diagnostic: AuthoringDiagnostic): AuthoringDiagnosticOwner {
  if (diagnostic.owner !== "game-project") return diagnostic.owner;
  const value = `${diagnostic.code} ${diagnostic.path}`;
  if (/animation|appearance|anchor/.test(value)) return "animation";
  if (/camera/.test(value)) return "camera";
  if (/sequence|choice|line|narration|cue|direction/.test(value)) return "sequence";
  if (/command|noun|lexicon|response|inventory|object/.test(value)) return "interaction";
  if (/scene|hotspot|point|polygon|approach|entrance|passage|scenery|character|motion|walk/.test(value)) {
    return "world";
  }
  return "game-project";
}
