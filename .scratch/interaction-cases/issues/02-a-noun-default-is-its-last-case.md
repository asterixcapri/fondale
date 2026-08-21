# 02 — A Noun's default for a Verb becomes its last case

**What to build:** An author declares everything a Noun does in one list, read
from the top. The separate per-Verb fallback map disappears: the answer a Noun
gives when nothing more specific applies is simply its final case for that Verb,
carrying no condition. Nothing a game could say before becomes unsayable, and
the Engine still refuses a game where some Verb on some Noun has no answer at
all — the rule is now "an unconditional case here, or a Command Fallback on the
Game Project", which continues to make a Command impossible to leave unanswered.

**Blocked by:** 01 — Extract the shared case outcome and its rules.

**Status:** ready-for-agent

- [ ] A Noun declares its reactions as one ordered list; the fallback map is
      gone from the authored contract and from the public exports.
- [ ] The first eligible case applies, as it does today.
- [ ] A Verb left with neither an unconditional case on the Noun nor a Game
      Project Command Fallback is refused, with the diagnostic that refuses it
      today.
- [ ] An unconditional case placed before a conditional one for the same Verb is
      refused by the shared ordering rule.
- [ ] The Interaction authoring guide, the contract index, the diagnostics
      reference and the public vocabulary describe the single list.
- [ ] The recipes and the Example are migrated, and both play green.
- [ ] `npm run build` and `npm run verify` pass.
