# Dialogue

## What dialogue is in Fondale

A Character does not have a dialogue tree. It has **knowledge**, and a policy
for who may hear what.

You declare the game's canonical truths as **Narrative Facts**. You give each
Character the subset it knows, and for each known fact a **Disclosure**: open,
guarded, or secret. The Player asks in their own words; the Engine decides
whether that Character may answer, and only then is anything phrased.

Two paths exist side by side in one Conversation. **Authored alternatives** are
questions you wrote, with answers you wrote — deterministic, and reached
without any provider. **Free-form input** is the Player typing, interpreted
against that Character's known facts.

The Engine never lets generated text change the world. A provider selects which
declared fact is being asked about, and later phrases an authorised answer.
Every state change comes from authored operations.

## How you author it

```ts
import { type CharacterDialogueDefinition } from "fondale";

export const raffaeleDialogue = {
  biography: "Harbour keeper on Capri since before the raid.",
  personality: { talkativeness: "low", honesty: "medium", discretion: "high", suspiciousness: "high" },
  behavior: { withholding: "evade" },
  voice: { verbosity: "short", tone: "dry", vocabulary: "ordinary" },
  knowledge: [
    { factId: "boatIsAdrift", disclosure: { level: "open" } },
    { factId: "whoCutTheLine", disclosure: { level: "guarded", when: { trustAtLeast: "medium" } } },
    { factId: "theHiddenCove", disclosure: { level: "secret", when: { variable: "foundTheMap", equals: true } } },
  ],
  coverStories: [{ concealsFactId: "whoCutTheLine", claimId: "theWindDidIt" }],
  relationships: { michele: { trust: "low" } },
  alternatives: [
    { text: "Whose boat is that?", response: "Nobody's, now.", once: true },
  ],
} satisfies CharacterDialogueDefinition;
```

Declare Narrative Facts and Claims in the Game Project's `narrativeFacts` and
`claims` registries, and give the project a `narrativeContext` — a short
description of the fiction, used only to phrase dialogue.

### Disclosure

**Open** knowledge may be communicated whenever it is relevant.

**Guarded** knowledge requires either a minimum directional Trust
(`{ trustAtLeast }`) or a boolean Game Variable (`{ variable, equals }`).

**Secret** knowledge always requires an explicit Variable unlock. Trust alone
never opens a secret.

When a fact may not be disclosed, the Character's `behavior.withholding`
decides what happens instead: `withhold`, `evade`, or `refuse`. If a **Cover
Story** associates that fact with a declared Claim, the Character may tell the
Claim instead — a lie you authored, remembered as **Testimony** attributed to
its speaker, never treated as truth.

### What is qualitative

`personality`, `voice`, `state` and Trust are qualitative — `low`, `medium`,
`high`, and small named vocabularies. There is no numeric simulation, no
hidden score to tune. They shape how something is said, never whether it may
be said: that is Disclosure's job alone, and it is deterministic.

### Authored alternatives

An alternative declares its displayed `text`, an optional eligibility
condition, an optional `spoken` flag (default true), and the exact `response`.
It may carry `operations` committed atomically with the selection, and it may
name a `sequence` with an explicit `close` or `resume` outcome.

At most six alternatives may be eligible at once. Ineligible ones are hidden,
not shown as unavailable. An alternative declaring `once` is consumed by the
selection that asks it; every other stays repeatable while eligible.

The alternatives and the free-form field are presented together for the whole
Conversation — except while an alternative's Sequence is playing, when the
field is withdrawn.

### Cases

A Character declares in `cases` the Interaction Cases with which its
Conversation gives way to an exact authored scene. Each case names a Sequence
and whether the Conversation `close`s or `resume`s afterwards, under an optional
condition. The list is read from the top and the first eligible case applies, so
a last case carrying no condition is the Conversation's default.

Cases are evaluated after an accepted free-form turn's effects commit, and again
when the Player leaves the Conversation: an eligible case takes over instead of
closing it. They are how an exploratory conversation becomes an exact authored
scene at the right moment. The Engine chooses a case; the Player chooses an
alternative.

A case carrying no condition therefore applies every time, including when the
Player leaves. Declare one that `resume`s only where its Sequence changes the
Game State some earlier case is conditioned on, or the Player has no way out of
the Conversation.

### Reflection

The Player Character may reflect on what it knows: committed facts, remembered
Claims and their speakers, directional Relationships. Reflection has no
interlocutor, no Disclosure, no Cover Story and no Game Operation path. Its
summary, hypotheses and suggestions are presented as uncertain and never enter
Game State.

## Values and rules

| Field | Value | Rules |
| --- | --- | --- |
| `knowledge` | one entry per known fact | required; repeated references to the same fact are invalid |
| `coverStories` | fact-to-Claim pairs | the fact must be guarded or secret and actually known |
| `relationships` | Character-keyed Trust | directional: A's trust in B is not B's trust in A |
| `personality`, `voice`, `behavior`, `state`, `biography` | qualitative portrayal | optional |
| `alternatives` | authored questions | at most six eligible at once |
| `cases` | optional condition, Sequence, `close` or `resume` | read from the top, first eligible one applies; evaluated after an accepted turn commits |

A project with any Character dialogue profile must declare a non-empty
`narrativeContext` and supply exactly one provider connection —
`dialogueServerUrl` for ordinary games, or the low-level `dialogueProvider` for
tests and advanced hosts. Supplying both is invalid.

Player speech must be 1 to `dialogueInputMaxLength` (500) characters. Only one
Dialogue Turn may be pending; leaving or stopping the session aborts it and
ignores late results.

`FakeDialogueProvider` is the deterministic adapter for tests: it maps exact
Player formulations to declared fact IDs, and authorised facts, Claims or
strategies to responses, with no network, model or credential.

## Errors

| Code | Cause |
| --- | --- |
| `definition.narrative-context.required` | a dialogue profile exists without a Narrative Context |
| `definition.narrative-fact.identity`, `.proposition`, `.sets-variable` | an invalid Narrative Fact |
| `definition.claim.identity`, `.proposition` | an invalid Claim |
| `definition.character-knowledge.duplicate` | the same fact is declared twice for one Character |
| `definition.character-knowledge.disclosure` | an invalid or incomplete Disclosure |
| `definition.cover-story.disclosure` | a Cover Story conceals an open fact |
| `definition.cover-story.duplicate` | two Cover Stories conceal the same fact |
| `definition.relationship.trust` | an invalid Trust level |
| `definition.dialogue.profile`, `.biography`, `.personality`, `.behavior`, `.voice`, `.state` | an invalid portrayal field |
| `definition.conversation-alternative.limit` | more than six alternatives may be eligible |
| `definition.conversation-alternative.sequence` | an alternative names a Sequence without an outcome |
| `reference.character-knowledge.fact`, `.character` | knowledge names a missing fact or Character |
| `reference.cover-story.fact`, `.knowledge`, `.claim` | a Cover Story does not resolve |
| `reference.relationship.character`, `.missing` | a Relationship names a missing Character |
| `reference.narrative-fact.variable` | `setsVariable` names an undeclared Variable |
| `environment.dialogue-connection.ambiguous` | both connection forms were supplied |
| `environment.dialogue-provider.missing` | dialogue is declared with no connection |
| `environment.dialogue-server.unreachable`, `.connection-failed` | the Dialogue Server did not answer at startup |

## Example

The recipe game answers with authored Command Cases rather than a Dialogue
Provider, so it declares no Character dialogue profile. For a game that does,
see the Dialogue Provider protocol and the fields listed above.

## See also

[Character](character.md) · [Game State](game-state.md) · [Sequence](sequence.md) · [Testing](testing.md)
