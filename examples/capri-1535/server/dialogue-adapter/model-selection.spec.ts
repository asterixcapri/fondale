import assert from "node:assert/strict";
import { test } from "node:test";

import { selectDialogueModel } from "./model-selection";
import { defaultDialogueModelId } from "./live-dialogue-model";
import { ScriptedDialogueModel } from "./scripted-dialogue-model";

test("the adapter answers from its script unless asked for the live model", () => {
  assert(selectDialogueModel({}) instanceof ScriptedDialogueModel);
  assert(selectDialogueModel({
    DIALOGUE_ADAPTER_MODEL: "scripted",
    DIALOGUE_MODEL_API_KEY: "sk-or-v1-example-secret",
  }) instanceof ScriptedDialogueModel);
});

test("one server-side setting selects the live model", () => {
  const live = selectDialogueModel({
    DIALOGUE_ADAPTER_MODEL: "live",
    DIALOGUE_MODEL_API_KEY: "sk-or-v1-example-secret",
  });
  assert.equal("modelId" in live ? live.modelId : undefined, defaultDialogueModelId);

  const other = selectDialogueModel({
    DIALOGUE_ADAPTER_MODEL: "live",
    DIALOGUE_MODEL_API_KEY: "sk-or-v1-example-secret",
    DIALOGUE_MODEL_ID: "deepseek/deepseek-v4-pro",
  });
  assert.equal("modelId" in other ? other.modelId : undefined, "deepseek/deepseek-v4-pro");
});

test("an unknown model selection is rejected before any Dialogue Turn", () => {
  assert.throws(
    () => selectDialogueModel({ DIALOGUE_ADAPTER_MODEL: "gpt-by-hand" }),
    /DIALOGUE_ADAPTER_MODEL/,
  );
});
