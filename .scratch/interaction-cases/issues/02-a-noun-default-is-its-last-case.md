# 02 — A Noun's default for a Verb becomes its last case

**What to build:** An author declares everything a Noun does in one list, read
from the top. The separate per-Verb fallback map disappears: the answer a Noun
gives when nothing more specific applies is simply its final case for that Verb,
carrying no condition. Nothing a game could say before becomes unsayable, and
the Engine still refuses a game where some Verb on some Noun has no answer at
all — the rule is now "an unconditional case here, or a Command Fallback on the
Game Project", which continues to make a Command impossible to leave unanswered.

**Blocked by:** 01 — Extract the shared case outcome and its rules.

**Status:** resolved

- [x] A Noun declares its reactions as one ordered list; the fallback map is
      gone from the authored contract and from the public exports.
- [x] The first eligible case applies, as it does today.
- [x] A Verb left with neither an unconditional case on the Noun nor a Game
      Project Command Fallback is refused, with the diagnostic that refuses it
      today.
- [x] An unconditional case placed before a conditional one for the same Verb is
      refused by the shared ordering rule.
- [x] The Interaction authoring guide, the contract index, the diagnostics
      reference and the public vocabulary describe the single list.
- [x] The recipes and the Example are migrated, and both play green.
- [x] `npm run build` and `npm run verify` pass.

## Comments

Implemented. `NounDefinition.fallbacks` and the `CommandFallback` type are gone
from the authored contract and from `src/index.ts`; a Noun declares everything
it does in one ordered `cases` list. The answer a Verb gives when nothing more
specific applies is its case declared with neither a first Noun nor an
Interaction Condition — `defaultCommandCase` in
`src/capabilities/interaction/index.ts` — and `resolveCommandDefinition` still
selects the first eligible case exactly as before, falling to that default and
then to the Game Project's `commandFallbacks`.

Three decisions worth recording.

*The ordering rule applies per selector, not per Verb.* A Command Case selects
on a Verb **and** a first Noun, and resolution matches the first Noun exactly,
so `{ verb: "use" }` above `{ verb: "use", firstNoun: "handle", when: … }`
hides nothing and is accepted; two cases sharing one selector are checked with
the shared `validateConditionalFallbackOrder`, which is what refuses an
unconditional case above a conditional one. A selector with no unconditional
case at all is left alone: `definition.command.silent` is what reports a Verb
with neither a default here nor a Command Fallback on the Game Project, and it
keeps its code and family with a message naming both.

*A Give case may omit its first Noun when it is the Verb's default.* Three
Nouns in the Example refused a gift through `fallbacks.give`, which the old
arity rule would otherwise have made unsayable; a *conditional* Give case still
requires its first Noun.

*Selecting `use` and clicking an Inventory Object still holds it as a first
Noun.* Once the fold happened, a former `fallbacks.use` and an authored
unconditional bare `use` case became the same text, and the branch in
`createInteraction` that decides between using an Object alone and selecting it
had to choose one reading. It asks for a *conditional* bare case, so that the
oil flask keeps being usable on the winch; the Interaction guide says so. This
is the one place where the merge costs an author a distinction they had before.

Migrated: the lantern recipe, and in `capri-1535` Brother Elia, the oil flask,
the oilskin bundle, the sealed letter and the harbour's winch and fishing nets.
`examples/capri-1535/vendor/fondale-0.4.0.tgz` is repacked, as the README's
refresh procedure describes, because the Example consumes the published
artifact rather than the sources. Documentation: the Interaction guide (the
authored example, how a Command resolves, the field table and the
`definition.command.silent` cause), the contract index and the public
vocabulary — confined to the Noun's own contract, since ticket 03 is editing
the same pages.

Verification: `npm run build` passes (type-check, both packages, architecture,
release preparation, documentation gate); `npm run verify` passes with 363
tests; the Example's own suite passes with 24. One run of
`test/camera-scrolling.spec.ts` failed and passed on re-run, unrelated to this
change.
