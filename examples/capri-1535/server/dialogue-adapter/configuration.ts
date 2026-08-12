/** Where the local Dialogue Provider adapter listens and stores its memory. */
export interface AdapterConfiguration {
  readonly databaseUrl: string;
  readonly host: string;
  readonly port: number;
}

/**
 * Reads the adapter's transport and storage configuration; the Dialogue Model
 * it answers through is chosen separately by `selectDialogueModel`.
 *
 * Every value stays inside this Node process: nothing here is prefixed with
 * `VITE_` and nothing reaches the browser bundle.
 */
export function readAdapterConfiguration(
  environment: Readonly<Record<string, string | undefined>>,
): AdapterConfiguration {
  const databaseUrl = environment.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL is required.");
  const port = Number(environment.DIALOGUE_ADAPTER_PORT ?? "4315");
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("DIALOGUE_ADAPTER_PORT must be an integer between 1 and 65535.");
  }
  return {
    databaseUrl,
    host: environment.DIALOGUE_ADAPTER_HOST?.trim() || "127.0.0.1",
    port,
  };
}
