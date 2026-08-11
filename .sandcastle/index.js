import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { run, codex } from "@ai-hero/sandcastle";
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

const issuesPathArgument = process.argv[2];

if (!issuesPathArgument) {
  console.error("Missing issues directory");
  process.exit(2);
}

const issuesPath = resolve(issuesPathArgument);
const issuesPathStat = await stat(issuesPath).catch(() => undefined);

if (!issuesPathStat?.isDirectory()) {
  console.error(`Issues directory not found: ${issuesPath}`);
  process.exit(2);
}

await run({
  name: "worker",
  sandbox: noSandbox(),
  agent: codex("gpt-5.6-sol", { effort: "high" }),
  promptFile: "./.sandcastle/prompt.md",
  promptArgs: {
    ISSUES_PATH: issuesPath,
  },
  maxIterations: 3,
  branchStrategy: { type: "head" },
  logging: {
    type: "stdout",
  },
});
