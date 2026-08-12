# 09 — Complete the OpenRouter DeepSeek live spike

**What to build:** Connect the local adapter to OpenRouter and demonstrate the
approved Knowledge-Driven Dialogue experience with a technical Michele/Antonio
fixture. The live spike validates natural paraphrases, secrecy, controlled
deception, learning, long conversation, Load reset and Reflection without
making model output part of deterministic verification.

**Blocked by:** 04 — Model Cover Stories and remembered Testimony; 06 — Coordinate authored Conversation handoffs; 07 — Add Player Character Reflection; 08 — Build the local Mastra and PostgreSQL adapter.

**Status:** ready-for-agent

- [ ] OpenRouter is integrated server-side through its AI SDK provider and no API key is read, logged, committed or sent to the browser.
- [ ] The configured initial model is `deepseek/deepseek-v4-flash-0731`, while changing one server-side setting can select another compatible model.
- [ ] Interpretation uses a closed structured-output schema and Fondale validates every returned ID before authorising content.
- [ ] The technical Michele/Antonio fixture remains separate from the Example's canonical story, Characters and authored dialogue.
- [ ] Paraphrased questions identify the same relevant Narrative Fact and Antonio communicates an `open` fact naturally.
- [ ] Antonio protects a locked `secret` and can use only the declared Cover Story, producing remembered Testimony rather than false Character Knowledge.
- [ ] An Engine-selected communicated fact enters Michele's Character Knowledge and influences a later Dialogue Turn.
- [ ] A long Conversation remains coherent through Mastra and PostgreSQL without adding transcript or summaries to Game State.
- [ ] Loading a Save Snapshot resets provider memory and the next turn does not remember the earlier conversation.
- [ ] Reflection summarises available Narrative Facts and Testimony while clearly distinguishing non-canonical Hypothesis.
- [ ] The live verification is opt-in, documents local prerequisites and remains outside standard deterministic build and browser commands.
- [ ] Live diagnostics may report model ID, latency and token cost outside Game State but never assert one exact generated sentence.
- [ ] The complete standard deterministic suite still passes with FakeDialogueProvider and without network or database access.

## Comments
