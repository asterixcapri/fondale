/** Stable categories identifying the layer that rejected authored input. */
export type AuthoringDiagnosticFamily =
  | "definition"
  | "reference"
  | "state"
  | "save"
  | "asset"
  | "environment"
  | "behavior";

/**
 * A machine-identifiable explanation of invalid authored or restored data.
 *
 * Codes, families, and author-facing paths are stable API. Messages and safe
 * suggestions may become clearer in compatible releases.
 */
export interface AuthoringDiagnostic {
  readonly code: string;
  readonly family: AuthoringDiagnosticFamily;
  readonly path: string;
  readonly message: string;
  readonly suggestion?: string;
  readonly cause?: unknown;
}

/** The single error thrown when authored definitions contain one or more problems. */
export class AuthoringError extends Error {
  readonly diagnostics: readonly AuthoringDiagnostic[];

  constructor(diagnostics: readonly AuthoringDiagnostic[]) {
    const ordered = [...diagnostics].sort((left, right) =>
      `${left.path}\0${left.code}`.localeCompare(`${right.path}\0${right.code}`),
    );
    super(ordered.map(({ path, message }) => `${path}: ${message}`).join("\n"));
    this.name = "AuthoringError";
    this.diagnostics = Object.freeze(ordered);
  }
}

