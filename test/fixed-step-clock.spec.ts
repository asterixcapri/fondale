import { expect, test } from "@playwright/test";

import { FixedStepClock } from "../src/browser/fixed-step-clock";

test("browser refresh cadence does not change the number of logical steps", () => {
  const highRefresh = new FixedStepClock();
  const lowRefresh = new FixedStepClock();
  const highRefreshSteps = Array.from({ length: 120 }, () => highRefresh.advance(1000 / 120))
    .reduce((total, steps) => total + steps, 0);
  const lowRefreshSteps = Array.from({ length: 30 }, () => lowRefresh.advance(1000 / 30))
    .reduce((total, steps) => total + steps, 0);

  expect(highRefreshSteps).toBe(60);
  expect(lowRefreshSteps).toBe(60);
});

test("a suspended tab resumes with one step instead of bulk catch-up", () => {
  const clock = new FixedStepClock();
  expect(clock.advance(5_000)).toBe(1);
  expect(clock.advance(1000 / 60)).toBe(1);
});
