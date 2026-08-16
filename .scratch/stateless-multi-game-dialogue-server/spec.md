# Spec — Stateless multi-game Dialogue Server with automatic continuation

**Status:** ready-for-agent

## Problem Statement

The Dialogue Server is intended to serve every Character in every Game Project,
but its current live-model configuration fixes one language and one fictional
setting for the whole process. It also retains a map of Game Session-specific
Dialogue Provider instances in process. These choices make one running server
behave like infrastructure for one Game Project even though the Engine already
sends the authorised material for each Dialogue Turn and the server never loads
Game Project files.

Dialogue continuity is also split across two lifecycles. PostgreSQL owns the
provider's non-canonical Conversation and Reflection memory, while the browser
keeps the random session identity that can retrieve it only in memory. A browser
reload loses that identity. The current manual Save Slot stores only a Save
Snapshot and restores it by resetting provider memory, so a Player can recover
canonical puzzle progress but not the conversational continuity associated with
that progress.

From the Player's perspective, browser reload should not create selective
amnesia. From the Author's perspective, one Game Project should need only a
Dialogue Server URL and its own Narrative Context. From the local operator's
perspective, one running Dialogue Server should serve any number of local Game
Projects and Game Sessions without per-game environment configuration.

## Solution

Fondale runs one local, multi-game Dialogue Server whose HTTP compute is
stateless. Every provider operation carries a random session identity, the
Character identity already present in the provider request, and the Game
Project's Narrative Context. The server uses the session identity, dialogue
mode and Character identity to load and update provider-owned memory in
PostgreSQL. It keeps no Game Session or Conversation memory in process.

Each Game Project declares one Narrative Context. The browser sends it with
every interpretation, verbalisation and Reflection operation. The server no
longer requires deployment-wide dialogue language or fictional-setting
configuration. Explicit language configuration and multiple localisations are
not part of the current Support Baseline.

Fondale replaces Player-managed Save Slots with one automatic Continuation
State per Project Identity. The Continuation State pairs the latest compatible
Save Snapshot with the provider session identity. The browser updates it after
stable committed progress. On a later browser load, Continue restores the Game
State and constructs the HTTP Dialogue Provider with the retained identity, so
PostgreSQL supplies the corresponding Conversation and Reflection context. New
Game replaces the Continuation State and starts with a new random identity.

The local design deliberately does not solve public hosting. Authentication,
tenant registration, quotas, billing, hostile-client isolation and
multi-instance cancellation remain deployment work for a later phase.

## User Stories

1. As a Player, I want to continue my latest game after reloading the browser, so that I do not lose completed puzzles or collected Objects.
2. As a Player, I want Characters to retain the conversations associated with my continued game, so that a browser reload does not make them appear to forget me.
3. As a Player, I want Continue to recover both canonical Game State and non-canonical dialogue context, so that the resumed experience is coherent.
4. As a Player, I want the game to save progress automatically, so that I do not have to decide when to save.
5. As a Player, I want autosave to occur after stable committed progress, so that a completed Interaction or Dialogue Turn survives a reload.
6. As a Player, I want an in-progress Animation, Motion or model request not to create a misleading partial save, so that Continue resumes a valid state.
7. As a Player, I want one clear Continue action, so that I do not have to manage named Save Slots.
8. As a Player, I want one clear New Game action, so that I can deliberately discard the current continuation and begin again.
9. As a Player, I want New Game to start with empty provider memory, so that Characters do not remember a previous playthrough.
10. As a Player, I want failed or cancelled Dialogue Turns to remain absent from both Game State and provider memory, so that Continue never restores a half-turn.
11. As a Player, I want accepted Dialogue Turns to retain the exact visible exchange, so that later model calls receive the conversation I actually saw.
12. As a Player, I want Conversations with different Characters to remain separate, so that one Character does not receive another Character's transcript.
13. As a Player, I want Reflection memory to remain separate from Conversations, so that inner reflection is not presented as dialogue spoken to another Character.
14. As a Player running two browser games, I want their continuations to remain separate, so that one Game Project never overwrites another Game Project's progress.
15. As an Author, I want Continuation State keyed by Project Identity, so that the stable identity I already declare isolates browser persistence.
16. As an Author, I want Fondale to own automatic continuation, so that my game entry point does not implement localStorage, Save Snapshot validation or Dialogue Provider identity recovery.
17. As an Author, I want to declare a Narrative Context on my Game Project, so that generated phrasing remains coherent with the game's fictional setting.
18. As an Author, I want Narrative Context to guide portrayal without authorising Narrative Facts, so that it cannot bypass Character Knowledge or Disclosure.
19. As an Author, I want the Dialogue Server to load no Game Project files, so that authored content and Engine authority remain in the browser.
20. As an Author, I want to configure only the Dialogue Server URL at startup, so that server implementation details remain outside game source.
21. As an Author, I want no dialogue language setting in the current Game Project interface, so that Fondale does not pretend to support localisation before the complete game can be localised.
22. As an Author, I want existing Character Voice, Personality, Biography and Dialogue State to keep their current responsibilities, so that Narrative Context does not replace portrayal definitions.
23. As a local operator, I want one Dialogue Server to serve all locally running Game Projects, so that I do not start one process per game.
24. As a local operator, I want PostgreSQL to remain the sole durable owner of provider memory, so that restarting Node does not erase active Conversation context.
25. As a local operator, I want model credentials and model selection to remain server configuration, so that secrets never enter the browser.
26. As a local operator, I want project-specific Narrative Context to arrive in requests, so that deployment environment variables do not bind the server to one game.
27. As a local operator, I want a non-mutating readiness check, so that starting or reloading a game does not erase an existing continuation merely to test connectivity.
28. As a maintainer, I want each HTTP operation to contain the identity needed to find its external memory, so that no process-resident provider map is required.
29. As a maintainer, I want retries of one Dialogue Turn identified consistently, so that a transport retry cannot persist the same exchange twice.
30. As a maintainer, I want the browser persistence policy concentrated in one adapter, so that Game Operations, puzzle definitions and dialogue logic do not each know about autosave.
31. As a maintainer, I want the Core to expose a side-effect-free stable snapshot for automatic continuation, so that autosave never cancels an unrelated pending Dialogue Turn.
32. As a maintainer, I want ordinary verification to remain deterministic without PostgreSQL or a live model, so that contributors can run the standard suite in a fresh checkout.
33. As a maintainer, I want PostgreSQL integration verification to prove memory isolation and recovery separately, so that the stateful boundary is tested where it actually exists.
34. As a maintainer, I want existing Save Snapshot compatibility checks reused by Continue, so that invalid or incompatible browser data never enters a Game Session.
35. As a maintainer, I want invalid Continuation State treated as untrusted browser data, so that malformed localStorage produces a safe New Game path rather than a partial startup.
36. As a maintainer, I want public documentation to distinguish Save Snapshot, Continuation State and provider-owned memory, so that none is mistaken for another.
37. As a maintainer, I want the current local-only deployment constraint stated explicitly, so that this work is not mistaken for a secure public multi-tenant platform.
38. As a model adapter author, I want Narrative Context supplied to interpretation, verbalisation and Reflection, so that all generated phases share the same fictional frame.
39. As a model adapter author, I want no implicit generic language or setting fallback, so that missing required Game Project context is diagnosed rather than silently changing portrayal.
40. As an advanced host, I want low-level Dialogue Provider injection to remain available, so that deterministic and non-HTTP adapters remain supported.

## Implementation Decisions

**One local multi-game deployment.** The current target is one locally running
Dialogue Server serving all local Game Projects and Game Sessions. The server
package remains separately run from the browser and PostgreSQL. This expands
multi-game capability without claiming public multi-tenancy.

**Stateless HTTP compute, external provider memory.** PostgreSQL remains the
stateful boundary for Conversation transcripts, Reflection transcripts and
context-window memory. Each provider operation identifies its session. The
server derives an isolated memory thread from session identity, dialogue mode
and Character identity. It must not retain a session-to-provider map or other
Game Session memory between requests. Request-lifetime state, including an
AbortController for the request currently being served, is not conversational
memory and may remain local to that request.

**One shared live model.** A running server may share its configured model and
model credentials across Game Sessions and Game Projects. Model identity,
credentials, database connection and network settings remain deployment
configuration. Project-specific presentation does not.

**Narrative Context belongs to the Game Project.** The public Game Project
definition gains one required Narrative Context when Knowledge-Driven Dialogue
is used. It is brief authored prose describing the overall fictional setting.
It guides phrasing only and has no authority over Narrative Facts, Claims,
Character Knowledge, Disclosure, Testimony, Relationships or Game State.

**Narrative Context crosses every provider operation.** The shared Dialogue
Provider request contract and HTTP protocol carry Narrative Context for
interpretation, verbalisation and Reflection. The browser derives it from the
compiled Game Project; ordinary Authors do not repeat it at call sites. The
server continues to receive only the current turn's authorised semantic
material and never loads a Game Project or game files.

**Language remains implicit.** Deployment-wide dialogue language configuration
is removed. No replacement language property, locale registry or Player
Preference is added in this work. The model receives Player input, authored
propositions and portrayal text in the Game Project's current language and is
expected to answer consistently with that material. Full localisation is a
separate capability.

**Remove project presentation environment variables.** The live Dialogue Model
no longer reads or validates dialogue language or fictional setting from the
environment. Narrative Context supplied by the request replaces the setting
instruction. Environment examples, startup guidance, diagnostics and prompt
tests are updated accordingly.

**The session identity remains opaque and browser-owned.** The HTTP adapter
holds one cryptographically random session identity and includes it in every
provider operation. It does not identify a Character or Game Project. Character
identity remains explicit in interpretation, verbalisation and Reflection
requests. The server combines these values to address the correct PostgreSQL
memory.

**One Continuation State per Project Identity.** Browser persistence replaces
the global named Save Slot collection with one local record per Project
Identity. The record contains the latest Save Snapshot and the provider session
identity. The provider identity is continuation metadata, not Game State, and
does not enter the Save Snapshot.

**Continue reuses the provider session identity.** Browser startup reads and
validates the Project Identity-specific Continuation State before constructing
the HTTP Dialogue Provider. A compatible record restores its Save Snapshot and
reuses its provider identity. Absence of a record starts a new Game Session and
creates a fresh identity. Incompatible or malformed local data is never passed
to the Core.

**New Game replaces continuation.** Starting a new game creates a fresh
provider session identity, creates initial Game State and replaces the current
Continuation State for that Project Identity. Deleting old PostgreSQL memory
may be attempted through the existing reset behavior, but failure to clean up
old non-canonical memory must not prevent the new Game Session from starting.
Retention for identities orphaned by cleared browser storage is deferred.

**No manual Save Slot experience.** The Engine-owned HUD no longer presents a
named Save Slot list or manual Save and Load actions. The browser experience
offers Continue when compatible Continuation State exists and New Game. The
Save capability and Save Snapshot validation remain the persistence mechanism
behind automatic continuation; this work does not redefine canonical Game
State.

**Autosave belongs to the browser adapter.** Persistence remains outside the
Core. The browser loop already observes Core effects after deterministic steps;
it schedules a debounced continuation write after observable stable progress.
Game Operations, Interactions, Sequences and Dialogue do not call localStorage
or learn about continuation.

**Automatic snapshots are passive.** The Core must provide a way to obtain the
latest committed Save Snapshot without invalidating a pending provider turn.
The current manual snapshot behavior that cancels a turn must not be reused as
an autosave side effect. Automatic persistence does not itself change Game
State or provider memory.

**Persist completed Dialogue Turns.** A provider response is eligible for
automatic continuation only after the Engine accepts the Dialogue Turn and
commits its authorised Game Operations. Failed, cancelled, abandoned or late
turn results change neither canonical Game State nor the automatic
Continuation State. Existing provider behavior continues to remove a visible
exchange when persistence is cancelled before acceptance.

**Non-mutating startup readiness.** Reusing a continuation's provider identity
must not call reset as a connectivity probe. Browser startup uses a
non-mutating readiness operation or an equivalent non-destructive check.
Reset remains a memory lifecycle operation, not a health check.

**Turn identity remains the idempotency key.** Interpretation and
verbalisation remain separate logical provider operations because the Engine
applies Character Knowledge and Disclosure between them. Their shared Dialogue
Turn identity must prevent a retried operation from producing duplicate
persisted exchanges. The exact database constraint and transaction shape stay
inside the Dialogue Server implementation.

**Keep the existing Dialogue Provider seam.** Ordinary browser startup still
selects a Dialogue Server URL. Tests and advanced hosts may still inject a
low-level Dialogue Provider. The HTTP adapter changes transport details without
moving narrative authority or persistence into Game Project entry points.

**Update documentation as one conceptual migration.** Public concepts,
reference material and browser guidance replace Save Slot terminology with
Continuation State, explain Continue and New Game, document Narrative Context,
and remove project-specific dialogue environment configuration. Existing ADRs
0021–0023 govern stateless compute, automatic continuation and per-request
Narrative Context.

## Testing Decisions

A good test asserts behavior visible across a module's interface. It does not
assert private localStorage helper calls, prompt assembly helpers, provider-map
implementation details or PostgreSQL table layout. The highest seam should
cover several responsibilities at once; lower seams exist only where a browser
stand-in cannot prove durable PostgreSQL behavior.

**Primary seam — browser startup and continuation.** Browser tests start an
authored Game Project through the ordinary Dialogue Server URL and observe the
production HTTP protocol through a deterministic network stand-in. They prove:

- a new game creates a random provider session identity;
- stable Game State changes create or replace one Project Identity-specific
  Continuation State;
- a browser reload offers or performs Continue with the compatible Save
  Snapshot and the same provider session identity;
- two Project Identities on one origin retain independent continuation data;
- New Game replaces the current continuation and uses a new identity;
- malformed or incompatible continuation data does not partially start a Game
  Session;
- no named Save Slot or manual Save/Load presentation remains;
- startup readiness does not send reset for a continued identity;
- interpretation, verbalisation and Reflection send Narrative Context;
- a failed or cancelled Dialogue Turn is not captured as completed progress;
- an accepted Dialogue Turn is captured only after its Engine commit.

The existing browser tests for declarative Dialogue Server connection,
unreachable-server diagnostics, save controls and Knowledge-Driven Dialogue are
the prior art. This seam is preferred because it observes the Author-facing
startup declaration, browser persistence, HTTP adapter and Core restoration
together.

**Secondary seam — public Dialogue Server with PostgreSQL.** PostgreSQL-backed
integration tests prove what the browser stand-in cannot: two independently
constructed request handlers recover the same session's visible history;
different sessions never share memory; different Characters and dialogue modes
within one session remain separate; accepted exchanges survive server restart;
cancelled exchanges leave no half-turn; and operation retry does not duplicate
an exchange. Existing Dialogue Provider integration tests for session
isolation, restart recovery, reset and the 100-message context window are the
prior art.

**Live model seam — provider request behavior.** Unit tests at the live Dialogue
Model interface prove that Narrative Context reaches interpretation,
verbalisation and Reflection, remains presentation-only, and requires no
language or setting environment variables. Tests observe generated model call
instructions through the existing deterministic Mastra model adapter rather
than testing private prompt helpers.

**Save and validation seam.** Save capability tests continue to prove that Save
Snapshots contain only canonical Game State and compatibility identities.
Browser tests prove that provider session identity is adjacent Continuation
State metadata and never enters the Save Snapshot. Existing Save Snapshot
validation tests are prior art.

**Repository gates.** The library build and type check, Dialogue Server unit
verification, architecture checks, documentation checks and browser
verification must pass without PostgreSQL or a model. PostgreSQL-backed
verification remains an explicit integration command. The opt-in live dialogue
suite continues to cover the real provider without becoming a standard gate.

## Out of Scope

- A public Fondale-hosted Dialogue Server.
- Authentication, Author accounts, tenant registration or tenant isolation.
- Rate limiting, quotas, billing and model-cost allocation by Game Project.
- Hostile-client protection beyond the current local development assumptions.
- Horizontal deployment guarantees, distributed cancellation or cross-instance
  active-turn coordination.
- Production retention policy for orphaned PostgreSQL dialogue memory.
- Manual Save Slots, named saves, arbitrary Load or rollback to historical Game
  State.
- Dialogue-memory checkpoints or branching save histories.
- Cloud save, cross-device continuation or synchronising localStorage between
  browsers.
- Multiple languages, locale selection, translated Game Project definitions or
  language as a Player Preference.
- Inferring a language from browser settings and sending an explicit language
  instruction to the model.
- Changing the configured model, model vendor, reasoning policy or credential
  ownership.
- Moving Narrative Facts, Claims, Character Knowledge, Disclosure, Testimony,
  Relationships or any other Game State authority into the Dialogue Server.
- Loading, registering or caching Game Project files on the Dialogue Server.
- Making provider-owned transcripts canonical or embedding them in Save
  Snapshots.
- Guaranteeing recovery after the Player clears browser site data or the
  operator deletes PostgreSQL memory.
- Designing the final production deployment topology.

## Further Notes

The design distinguishes three things that must not collapse into one another:
a Save Snapshot is canonical Game State, a Continuation State is the browser's
single automatic record for Continue, and PostgreSQL provider memory is
non-canonical Conversation and Reflection context. The provider session
identity joins the latter two without placing generated speech inside Game
State.

The current implementation's global Save Slot storage, reset-on-restore
behavior, process-resident provider map and deployment-wide language/setting
variables intentionally conflict with this target and are migration points,
not compatibility requirements.

The spec assumes local development deployment, as agreed. A later production
design may retain the same request and persistence model, but must revisit
authentication, tenancy, cancellation, retention and cost controls before one
public endpoint can safely serve unrelated Authors.
