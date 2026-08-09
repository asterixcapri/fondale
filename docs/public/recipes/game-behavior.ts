import type { GameBehavior } from "@asterixcapri/fondale";

export const openWhenReady: GameBehavior = (context) => {
  if (context.reads.variable("ready") && context.reads.hasObject("key")) {
    context.operations.setVariable("doorOpen", true);
  }
};
