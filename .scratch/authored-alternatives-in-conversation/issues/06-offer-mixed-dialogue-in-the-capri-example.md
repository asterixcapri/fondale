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

**Status:** ready-for-agent

- [ ] The prologue's knowledge is declared as Narrative Facts with propositions in the Example's ubiquitous language.
- [ ] Raffaele and Brother Elia receive Dialogue Profiles with biography, personality, voice, behaviour and the Facts each knows, with Disclosure where a Fact should not be freely given.
- [ ] The existing engagement and well conversations are offered as authored alternatives, keeping their exact wording, their branching and the Game Operations that drive the prologue.
- [ ] Talking to either Character presents authored alternatives and the free-form field together, from the first click, with no unlock.
- [ ] The `?dialogue=local` query switch is removed; a Player has no way to choose a Dialogue Provider.
- [ ] The Dialogue Provider is selected at build time: the ordinary build uses the local adapter, and a test build injects a deterministic provider.
- [ ] Running the Example requires the adapter process and PostgreSQL, and the README states this as a prerequisite rather than an optional extra.
- [ ] Starting without a reachable adapter fails with an explanation a human can act on, and never leaks server configuration or credentials into the browser.
- [ ] The acceptance suite keeps opening the game's real entry point, and still runs with no database, model or network.
- [ ] The prologue remains completable end to end through the authored path alone, without typing a single free-form question.
- [ ] Michele's Reflection reports the prologue knowledge he has actually acquired, by either path.
- [ ] The Example's verification covers the prologue route and the mixed presentation.
- [ ] Repository-root `npm run build` and `npm run verify` still require neither PostgreSQL nor adapter configuration, since they verify the Engine rather than the Example.
- [ ] `npm run build` in the Example passes, including its project verification.
