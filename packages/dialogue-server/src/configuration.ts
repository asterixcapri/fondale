/** Where the Dialogue Server listens, stores memory and accepts browser calls. */
export interface DialogueServerConfiguration {
  readonly databaseUrl: string;
  readonly host: string;
  readonly port: number;
  readonly allowedOrigins?: readonly string[];
}

/**
 * Reads transport and storage configuration; model configuration is owned by
 * `createLiveDialogueModelFromEnvironment`.
 *
 * Every value stays inside this Node process: nothing here is prefixed with
 * `VITE_` and nothing reaches the browser bundle.
 */
export function readDialogueServerConfiguration(
  environment: Readonly<Record<string, string | undefined>>,
): DialogueServerConfiguration {
  const databaseUrl = environment.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL is required.");
  const port = Number(environment.DIALOGUE_ADAPTER_PORT ?? "4315");
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("DIALOGUE_ADAPTER_PORT must be an integer between 1 and 65535.");
  }
  const allowedOrigins = environment.DIALOGUE_ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (allowedOrigins?.length === 0) {
    throw new Error("DIALOGUE_ALLOWED_ORIGINS must name at least one origin when provided.");
  }
  return {
    databaseUrl,
    host: environment.DIALOGUE_ADAPTER_HOST?.trim() || "127.0.0.1",
    port,
    ...(allowedOrigins ? { allowedOrigins } : {}),
  };
}
