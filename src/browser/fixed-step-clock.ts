/** Converts real elapsed time into deterministic 60 Hz simulation steps. */
export class FixedStepClock {
  private accumulatedMilliseconds = 0;

  constructor(
    private readonly stepMilliseconds = 1000 / 60,
    private readonly suspensionThresholdMilliseconds = 250,
  ) {}

  advance(elapsedMilliseconds: number): number {
    if (!Number.isFinite(elapsedMilliseconds) || elapsedMilliseconds < 0) return 0;
    if (elapsedMilliseconds >= this.suspensionThresholdMilliseconds) {
      this.accumulatedMilliseconds = 0;
      return 1;
    }
    this.accumulatedMilliseconds += elapsedMilliseconds;
    const steps = Math.floor((this.accumulatedMilliseconds + 1e-9) / this.stepMilliseconds);
    this.accumulatedMilliseconds -= steps * this.stepMilliseconds;
    return steps;
  }
}
