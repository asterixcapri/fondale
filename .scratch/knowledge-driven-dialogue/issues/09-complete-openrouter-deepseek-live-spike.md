# 09 — Complete the OpenRouter DeepSeek live spike

**What to build:** Connect the local adapter to OpenRouter and demonstrate the
approved Knowledge-Driven Dialogue experience with a technical Michele/Antonio
fixture. The live spike validates natural paraphrases, secrecy, controlled
deception, learning, long conversation, Load reset and Reflection without
making model output part of deterministic verification.

**Blocked by:** 04 — Model Cover Stories and remembered Testimony; 06 — Coordinate authored Conversation handoffs; 07 — Add Player Character Reflection; 08 — Build the local Mastra and PostgreSQL adapter.

**Status:** ready-for-human

- [x] OpenRouter is integrated server-side through its AI SDK provider and no API key is read, logged, committed or sent to the browser.
- [x] The configured initial model is `deepseek/deepseek-v4-flash-0731`, while changing one server-side setting can select another compatible model.
- [x] Interpretation uses a closed structured-output schema and Fondale validates every returned ID before authorising content.
- [x] The technical Michele/Antonio fixture remains separate from the Example's canonical story, Characters and authored dialogue.
- [x] Paraphrased questions identify the same relevant Narrative Fact and Antonio communicates an `open` fact naturally.
- [x] Antonio protects a locked `secret` and can use only the declared Cover Story, producing remembered Testimony rather than false Character Knowledge.
- [x] An Engine-selected communicated fact enters Michele's Character Knowledge and influences a later Dialogue Turn.
- [x] A long Conversation remains coherent through Mastra and PostgreSQL without adding transcript or summaries to Game State.
- [x] Loading a Save Snapshot resets provider memory and the next turn does not remember the earlier conversation.
- [x] Reflection summarises available Narrative Facts and Testimony while clearly distinguishing non-canonical Hypothesis.
- [x] The live verification is opt-in, documents local prerequisites and remains outside standard deterministic build and browser commands.
- [x] Live diagnostics may report model ID, latency and token cost outside Game State but never assert one exact generated sentence.
- [x] The complete standard deterministic suite still passes with FakeDialogueProvider and without network or database access.

## Comments

- Implemented test-first at two agreed seams: the OpenRouter Dialogue Model,
  driven deterministically through a mock language model, and the opt-in live
  spike, driven through the browser against the real model.
- `DIALOGUE_ADAPTER_MODEL=openrouter` selects the live model and
  `OPENROUTER_MODEL_ID` selects another one; the API key is read only by Node
  and never enters a diagnostic, an error message or a browser response.
- Interpretation asks for a closed schema built from the speaking Character's
  own Narrative Facts and can report `ambiguous`, so `clarify` stays reachable
  live. An undeclared or unparsable answer degrades to a harmless missing fact.
- Reasoning tokens are disabled, the spoken budget follows the authored Voice,
  and an empty first attempt is retried once with a roomier budget: the live
  model otherwise spends its whole budget before producing any visible Line.
- The Michele/Antonio fixture lives beside the Example's browser fixtures and
  shares no Narrative Fact, Claim, Character or Sequence with the canonical
  story.
- Live verification asserts canonical Game State and provider memory only, and
  prints the generated Lines for a human to read. Acceptance case 5 is observed
  as Reflection before and after learning, because Fondale offers a Character
  only its own knowledge during a Conversation; long-conversation coherence
  (case 6) is asserted as durable, transcript-free memory and read by a human.
- Verification: `npm run build` and `npm run verify` at the repository root
  (235 browser tests); `npm run build` and `npm run verify` in the Example
  without database or network; `npm run verify:dialogue-adapter` with local
  PostgreSQL (31 node tests); `npm run verify:dialogue-live` against
  `deepseek/deepseek-v4-flash-0731`.
- Two-axis code review completed; Standards and Spec findings were addressed,
  including removing the extra allowed-origin setting, reusing the browser test
  harness and the shared fixture background helper, observing provider memory
  through Mastra rather than raw SQL, refusing a Response Strategy without its
  authorised payload, and telling each phase what to do with untrusted speech.
