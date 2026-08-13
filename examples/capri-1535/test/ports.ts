const environment = (globalThis as {
  process?: { env: Record<string, string | undefined> };
}).process?.env ?? {};

/**
 * The acceptance build's port. Deliberately not the Example's own dev port, so
 * the suite can never reuse an ordinary `npm run dev` server, whose build talks
 * to the local adapter.
 */
export const acceptancePort = Number(environment.CAPRI_TEST_PORT ?? "5273");

/**
 * The ordinary build's port, served beside the acceptance one so the suite can
 * observe what a human meets when the dialogue stack is not running. The test
 * that uses it refuses the adapter address itself, so the outcome does not
 * depend on whether a developer happens to have the adapter up.
 */
export const ordinaryPort = Number(environment.CAPRI_ORDINARY_PORT ?? "5274");
