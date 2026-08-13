# Fondale dialogue package

Use `CONTEXT.md` and current public interfaces as the source of truth.

## Authority checks

- Register true canonical propositions as Narrative Facts with stable identity.
- Register non-canonical authored propositions as Claims.
- Keep expressive generated detail and Hypotheses outside canonical state.
- Let Biography contextualise identity without authorising propositions.
- Let Personality and Voice affect portrayal only.
- Apply canonical effects through explicit Game Operations.

## Knowledge and disclosure checks

- Reference only declared Narrative Facts from Character Knowledge.
- Give every knowledge reference an open, guarded, or secret Disclosure.
- Use ordinary authored conditions for guarded knowledge and explicit unlocks
  for secrets; Trust alone never opens a secret.
- Pair every Cover Story with knowledge of its concealed Fact and a declared
  Claim.
- Treat Relationships as directional and qualitative.

## Conversation checks

- Use alternatives for exact authored answers and Sequences for choreography.
- Keep free-form input available only while no Sequence controls play.
- Keep at most six alternatives simultaneously eligible.
- Preserve existing alternative order when consumption state is stored by index.
- Declare whether a Sequence handoff closes or resumes the Conversation.
- Ensure authored alternatives never reach a Dialogue Provider.

## Turn checks

- Bound Player input and treat it as untrusted speech.
- Select authorised semantic content before verbalisation.
- Commit selected Fact or Claim operations atomically with a successful turn.
- Leave Game State unchanged on failure or cancellation.
- Ignore late provider results after leaving, loading, saving, stopping, or
  otherwise invalidating the turn.
