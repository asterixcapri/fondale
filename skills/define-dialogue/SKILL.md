---
name: define-dialogue
description: Define coherent Fondale dialogue, including Narrative Facts, Claims, Character Knowledge, Disclosure, Cover Stories, Relationships, Knowledge-Driven Dialogue profiles, authored alternatives, conversational Sequences, Game Operations, and verification. Use for creating or modifying conversations, character knowledge, dialogue choices, free-form dialogue behavior, lies, trust gates, or narrative information flow.
---

# Define Dialogue

Produce dialogue whose exact authored paths and exploratory generated speech
share one controlled narrative model without leaking authority to prose.

## Workflow

### 1. Inspect narrative authority

Read `CONTEXT.md`, the current Dialogue, Interaction, Sequence, and Game Project
interfaces, the Narrative Fact and Claim registries, Character definitions,
relevant Game Variables, Sequences, and dialogue tests. For a modification,
trace every affected proposition, stable identity, disclosure path, operation,
and Save-compatible ordered alternative.

Treat Biography, Personality, and Voice as stable portrayal owned with the
Character. Preserve them unless the request also invokes `$define-character`.
Finish when existing narrative authority and every affected consumer are mapped.

### 2. Grill the information flow

Invoke `$grilling`. Resolve what is canonically true, what may merely be claimed,
who initially knows each Narrative Fact, when each may disclose it, intentional
Cover Stories, directional Trust, exact authored exchanges, free-form topics,
state changes, and what the Player can learn. Do not implement until the frontier
is empty and the user confirms the dialogue contract.

### 3. Model propositions before wording

Follow [dialogue-package.md](references/dialogue-package.md). Define or reuse
stable Narrative Fact and Claim identities before writing lines. Map Character
Knowledge, Disclosure, Cover Stories, Relationships, and Game Operations.
Separate canonical propositions from expressive colour and Hypotheses.

Finish when every communicated proposition has exactly one authorised source
and every intended state effect has an explicit atomic Game Operation.

### 4. Author Conversation paths

Use authored alternatives and Sequences for exact wording, choreography,
branching, or operations. Use Knowledge-Driven Dialogue for exploratory asking
within authorised knowledge. Author Dialogue Behavior, Dialogue State,
handoffs, and alternative eligibility from qualitative profiles and ordinary
conditions. Preserve the index order of existing consumed alternatives.

Finish when every path has a response strategy, completion behavior, and
explicit canonical effect or an intentional absence of one.

### 5. Integrate and verify

Update registries, Character dialogue definitions, Sequences, variables, and
tests using current public interfaces. Validate references and run relevant
build and browser verification. Test open, guarded, and secret facts; Cover
Stories; ineligible alternatives; repeated and consumed alternatives; provider
failure; and late result invalidation where applicable.

Finish when every check in [dialogue-package.md](references/dialogue-package.md)
holds and neither authored nor generated speech can establish an unauthorised
Narrative Fact or mutate Game State implicitly.

## Handoff

Report proposition and disclosure changes, Character profiles, authored paths,
Game Operations, Save-compatibility considerations, verification, and deferred
provider or performance work.
