# 06 — Offer mixed dialogue in the Capri Example

**What to build:** The canonical Capri 1535 Example demonstrates the feature.
The Player talks to a Character of the prologue and sees the authored questions
and the free-form field together — the authored path carrying the prologue
exactly as it does today, the free-form path answering from what that Character
actually knows.

The Example stops treating free-form dialogue as an optional mode. The
`?dialogue=local` switch goes away: a Player has one experience, played against
the local dialogue adapter and PostgreSQL, which become part of what it takes
to run the game.

This is a change to what the Player can choose, not to how the game is
assembled. The Dialogue Provider is selected when the Example is built, not by
a query parameter a Player can type: the ordinary build uses the adapter, and
the test build injects a deterministic provider. So the acceptance suite keeps
opening the real game — the same entry point a Player opens — while needing no
database, model or network.

The bulk of this ticket is authorial, not mechanical. The Example currently
declares a single Narrative Fact, so a Character given a Dialogue Profile would
have almost nothing to say however well its portrayal is written. The prologue's
knowledge — the friars' work, the winch handle in the well, the jammed pulley,
the lookout — has to exist as Narrative Facts before free-form dialogue is
worth having.

Mixed dialogue stays a per-Character choice: a Character with no Dialogue
Profile keeps authored dialogue alone, unchanged.

**Blocked by:** 02 — Present authored alternatives in a Conversation; 05 — Set a
Game Variable when a Narrative Fact is learned.

**Status:** ready-for-human

- [x] The prologue's knowledge is declared as Narrative Facts with propositions in the Example's ubiquitous language.
- [x] Raffaele and Brother Elia receive Dialogue Profiles with biography, personality, voice, behaviour and the Facts each knows, with Disclosure where a Fact should not be freely given.
- [x] The existing engagement and well conversations are offered as authored alternatives, keeping their exact wording, their branching and the Game Operations that drive the prologue.
- [x] Talking to either Character presents authored alternatives and the free-form field together, from the first click, with no unlock.
- [x] The `?dialogue=local` query switch is removed; a Player has no way to choose a Dialogue Provider.
- [x] The Dialogue Provider is selected at build time: the ordinary build uses the local adapter, and a test build injects a deterministic provider.
- [x] Running the Example requires the adapter process and PostgreSQL, and the README states this as a prerequisite rather than an optional extra.
- [x] Starting without a reachable adapter fails with an explanation a human can act on, and never leaks server configuration or credentials into the browser.
- [x] The acceptance suite keeps opening the game's real entry point, and still runs with no database, model or network.
- [x] The prologue remains completable end to end through the authored path alone, without typing a single free-form question.
- [x] Michele's Reflection reports the prologue knowledge he has actually acquired, by either path.
- [x] The Example's verification covers the prologue route and the mixed presentation.
- [x] Repository-root `npm run build` and `npm run verify` still require neither PostgreSQL nor adapter configuration, since they verify the Engine rather than the Example.
- [x] `npm run build` in the Example passes, including its project verification.

## Comments

Implemented. Notes worth carrying forward:

- The prologue's knowledge is seven Narrative Facts with Italian propositions,
  following the live-dialogue fixture rather than the single English one the
  Example carried; registry keys stay English identifiers.
- `cloister-pulley-is-jammed` declares `setsVariable: pulleyTroubleKnown`, and
  that variable is what makes Frate Elia's second authored question eligible.
  Both paths set it: the authored alternative and the engagement Sequence carry
  `learn-narrative-fact`, so Reflection reports the same knowledge either way.
- The existing Sequences were kept and are directed from authored alternatives,
  as the spec's Out of Scope requires; only `learn-narrative-fact` operations
  were added to `raffaeleConversation`.
- Build-time selection is a Vite mode: `npm run dev:acceptance` injects
  `DeterministicDialogueProvider`. The acceptance Playwright port moved to 5273
  so the suite can never reuse an ordinary `npm run dev` server, and the
  ordinary build is served beside it on 5274 for the startup-failure test,
  which refuses the adapter address itself so its outcome never depends on
  whether a developer has the adapter running.
- The runnable adapter needed a change the checklist did not name: its default
  `DeterministicDialogueModel` has an empty interpretation map and appends a
  visible-history marker, so free-form dialogue would have answered nothing to
  a Player. `PrologueDialogueModel` now serves the default selection, sharing
  `src/prologue-knowledge.ts` with the acceptance provider;
  `DeterministicDialogueModel` stays the adapter suite's test device.
- Game Project version bumped to `7`: Character Knowledge and consumed
  alternatives changed shape for existing Characters.
- Not addressed: `vercel.json` still deploys a static build, which now cannot
  reach an adapter, so every visitor to the deployed demo meets the startup
  explanation instead of the game. Deciding what the deployment should be is
  not this ticket's call; it needs its own.
