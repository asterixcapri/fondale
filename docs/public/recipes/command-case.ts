import type { CommandCase } from "@asterixcapri/fondale";

export const openWhenReady: CommandCase = {
  verb: "open",
  when: { variable: "ready", equals: true },
  response: { text: "The mechanism opens." },
  operations: [{ type: "set-variable", variable: "doorOpen", value: true }],
};

export const greetDirectly: CommandCase = {
  verb: "talk-to",
  line: { character: "guide", text: "Welcome aboard." },
};
