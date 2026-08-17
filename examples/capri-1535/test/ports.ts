const environment = (globalThis as {
  process?: { env: Record<string, string | undefined> };
}).process?.env ?? {};

/**
 * The acceptance build's port. The Playwright config resolves it to a free
 * ephemeral port (or the CAPRI_TEST_PORT override) and exports the result
 * back into the environment, so workers read the value the suite bound to.
 * The literal fallback only applies outside a Playwright run.
 */
export const acceptancePort = Number(environment.CAPRI_TEST_PORT ?? "5273");

/**
 * The ordinary build's port, served beside the acceptance one so the suite can
 * observe what a human meets when the dialogue stack is not running. The test
 * that uses it refuses the adapter address itself, so the outcome does not
 * depend on whether a developer happens to have the adapter up. Resolved by
 * the Playwright config like the acceptance port above.
 */
export const ordinaryPort = Number(environment.CAPRI_ORDINARY_PORT ?? "5274");
