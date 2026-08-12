import assert from "node:assert/strict";
import { test } from "node:test";

import { DeterministicDialogueModel } from "./dialogue-model";
import { selectDialogueModel } from "./model-selection";
import { defaultOpenRouterModelId } from "./openrouter-dialogue-model";

test("the adapter keeps the deterministic model unless the environment asks for OpenRouter", () => {
  assert(selectDialogueModel({}) instanceof DeterministicDialogueModel);
  assert(selectDialogueModel({
    DIALOGUE_ADAPTER_MODEL: "deterministic",
    OPENROUTER_API_KEY: "sk-or-v1-example-secret",
  }) instanceof DeterministicDialogueModel);
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
