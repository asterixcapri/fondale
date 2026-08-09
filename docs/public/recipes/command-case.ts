import type { CommandCase } from "@asterixcapri/fondale";

export const openWhenReady: CommandCase = {
  verb: "open",
  when: { variable: "ready", equals: true },
  response: { text: "The mechanism opens." },
  operations: [{ type: "set-variable", variable: "doorOpen", value: true }],
};
