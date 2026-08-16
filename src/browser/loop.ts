import type { Application } from "pixi.js";

import type { CoreSession } from "../capabilities/game-session";
import type { BrowserRenderer } from "./renderer";
import { FixedStepClock } from "./fixed-step-clock";

/** Adapts browser frame time to deterministic Game Session ticks. */
export class BrowserLoop {
  private clock = new FixedStepClock();
  private previousFrameTime = performance.now();
  private running = false;

  constructor(
    private readonly application: Application,
    private readonly currentCore: () => CoreSession,
    private readonly currentRenderer: () => BrowserRenderer,
    private readonly onProgress?: () => void,
  ) {}

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.application.ticker.add(this.tick);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }

  reset(): void {
    this.clock = new FixedStepClock();
    this.previousFrameTime = performance.now();
  }

  destroy(): void {
    if (!this.running) return;
    this.running = false;
    this.application.ticker.remove(this.tick);
  }

  private readonly tick = (): void => {
    const core = this.currentCore();
    if (core.lifecycle() !== "running") return;
    const frameTime = performance.now();
    const steps = this.clock.advance(frameTime - this.previousFrameTime);
    this.previousFrameTime = frameTime;
    if (steps > 0) {
      core.steps(steps);
      this.onProgress?.();
    }
    const effects = core.takeEffects();
    this.currentRenderer().render(effects);
  };
}
