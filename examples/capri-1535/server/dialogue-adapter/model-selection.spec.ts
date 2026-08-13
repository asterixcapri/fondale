import assert from "node:assert/strict";
import { test } from "node:test";

import { selectDialogueModel } from "./model-selection";
import { defaultOpenRouterModelId } from "./openrouter-dialogue-model";
import { PrologueDialogueModel } from "./prologue-dialogue-model";

test("the adapter answers the prologue deterministically unless asked for OpenRouter", () => {
  assert(selectDialogueModel({}) instanceof PrologueDialogueModel);
  assert(selectDialogueModel({
    DIALOGUE_ADAPTER_MODEL: "deterministic",
    OPENROUTER_API_KEY: "sk-or-v1-example-secret",
  }) instanceof PrologueDialogueModel);
});

test("one server-side setting selects the live OpenRouter model", () => {
  const live = selectDialogueModel({
    DIALOGUE_ADAPTER_MODEL: "openrouter",
    OPENROUTER_API_KEY: "sk-or-v1-example-secret",
  });
  assert.equal("modelId" in live ? live.modelId : undefined, defaultOpenRouterModelId);

  const other = selectDialogueModel({
    DIALOGUE_ADAPTER_MODEL: "openrouter",
    OPENROUTER_API_KEY: "sk-or-v1-example-secret",
    OPENROUTER_MODEL_ID: "deepseek/deepseek-v4-pro",
  });
  assert.equal("modelId" in other ? other.modelId : undefined, "deepseek/deepseek-v4-pro");
});

test("an unknown model selection is rejected before any Dialogue Turn", () => {
  assert.throws(
    () => selectDialogueModel({ DIALOGUE_ADAPTER_MODEL: "gpt-by-hand" }),
    /DIALOGUE_ADAPTER_MODEL/,
  );
});
