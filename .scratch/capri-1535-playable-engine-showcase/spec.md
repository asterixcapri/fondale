# Spec — Rebuild the Capri 1535 Example as a playable Fondale showcase

**Status:** ready-for-agent

## Problem Statement

The Capri 1535 Example no longer presents one coherent, trustworthy Game
Project. The registered project contains only the harbour, Michele and
Raffaele, while its documentation and browser acceptance coverage still
describe an older four-Scene prologue. Dormant definitions, obsolete Runtime
Assets and many exploratory Art Masters remain beside the active content. The
current puzzle is internally contradictory: dialogue says the winch handle is
trapped at the cloister while the registered Object is already lying in the
harbour.

The Example also fails as a compelling demonstration of Fondale. It exposes
individual Engine Capabilities, but it does not currently form a complete,
fun, visually coherent short adventure. Existing Scenes were authored for
different logical scales, stateful Scenery and Objects were not consistently
designed as part of their Scene compositions, and secondary Character artwork
is mixed with extensive abandoned generation experiments. A prospective
Player or Author therefore cannot use the Example to understand what a
finished Fondale Game Project feels like.

The user wants the Example rebuilt cleanly as a playable narrative demo. It
must demonstrate the meaningful Player-facing capabilities of Fondale through
the natural requirements of story and puzzles, not as a gallery of technical
fixtures. Scene composition must originate from gameplay: when an Object is
hidden under fishing nets, the nets, the hidden Object and the state change
that reveals it must all exist visibly, at the correct scale, in the authored
Scene.

## Solution

Replace the current Capri 1535 Example with a four-Scene canonical prologue set
over one day in Capri in 1535:

1. At the harbour, Michele accepts a paid job from Raffaele to recover the
   missing handle of the harbour winch. Raffaele falsely claims that the friars
   took it without permission and gives Michele a sealed letter for Brother
   Elia. Michele may discover an oil flask hidden physically beneath fishing
   nets before or after learning that oil is needed.
2. At the cloister, Michele gives the letter to Brother Elia. Elia reveals that
   Raffaele voluntarily lent the handle in exchange for water. The handle is
   trapped on the loaded, seized well mechanism. Michele oils the dry pulley
   support and then pulls the rope, freeing the mechanism and allowing him to
   collect the handle.
3. Back at the harbour, Michele installs the handle in a choreographed
   Sequence, confronts or indulges Raffaele's lie, and restores the winch. This
   unlocks travel to the coastal fortification.
4. Michele climbs the fortification while the Camera follows the vertical
   Scene, spots a boat drifting toward the rocks and reaches it in a final
   playable Scene. Environmental clues lead him to a wounded sailor who once
   sailed with Michele's father. The sailor recognises the family resemblance,
   gives Michele an oilskin-wrapped broken ship seal and registry fragment, and
   loses consciousness. Michele opens the bundle, ending the demo at the
   inciting incident of the larger missing-ship story.

The Game Project uses a `1280×720` Logical Resolution and one coherent world
scale. The harbour is a wide horizontally scrolling Scene, the cloister is a
focused fixed Scene, the fortification is a vertically scrolling Scene, and
the drifting boat is a close, atmospheric final Scene. Light progresses from
morning through afternoon and golden hour to dusk, carrying the tone from
workaday comedy into mystery.

Michele alone demonstrates complete four-Facing Character presentation and
directional movement. Every other Character uses exactly one static Runtime
image with no Facing, movement, speaking or breathing variant. Raffaele and
Brother Elia retain their current approved static image; the wounded sailor
receives one newly produced static image for the final encounter. The Example uses
authored dialogue for exact story and puzzle progress, Knowledge-Driven
Dialogue for optional exploration, and Reflection for hints derived only from
Michele's committed Character Knowledge.

All new production artwork is built as packages rather than isolated images.
Each Scene begins with a full-size playable composition and exact geometry.
Stateful or depth-sensitive elements are separated into Scenery or Object Art
Masters only after their scale, placement, lighting and occlusion work in the
complete composition. Every Appearance preserves its intended Ground Point,
Visual Anchor and footprint. Existing exploratory PNGs and disconnected
content are removed only after their verified replacements exist.

## User Stories

1. As a Player, I want the Example to begin with a clear ordinary goal, so that I immediately understand what Michele wants and why I should act.
2. As a Player, I want Michele to be motivated by earning money for his own boat, so that the adventure begins personally rather than with a heroic destiny.
3. As a Player, I want the demo to tell a complete short story, so that it feels like a game rather than a technical sandbox.
4. As a Player, I want the conclusion to open a larger mystery, so that completing the demo leaves me excited about the full Capri story.
5. As a Player, I want humour to arise from Raffaele, Brother Elia and Michele, so that the historical setting remains credible rather than becoming a parody.
6. As a Player, I want the mood to move from morning comedy to dusk mystery, so that the story gains emotional momentum across the four Scenes.
7. As a Player, I want every Scene to have a distinct narrative purpose, so that no location feels like a disposable corridor.
8. As a Player, I want to move directly between the harbour and cloister, so that travel remains concise without an unnecessary town-square hub.
9. As a Player, I want the fortification to unlock after repairing the winch, so that story progress visibly changes the available world.
10. As a Player, I want the drifting boat to be a playable Scene, so that the inciting incident is experienced rather than merely narrated from a distance.
11. As a Player, I want environmental clues aboard the boat to build tension, so that discovering the wounded sailor feels earned.
12. As a Player, I want the sailor to recognise Michele's father, so that the missing-ship mystery becomes personal without making Michele predestined.
13. As a Player, I want the sailor's identity to remain unknown, so that the demo preserves a meaningful unanswered question.
14. As a Player, I want the sailor's fate to remain unresolved, so that the full story can decide whether he survives.
15. As a Player, I want to receive a broken ship seal and registry fragment instead of a treasure map, so that the mystery concerns reconstructing history rather than following coordinates.
16. As a Player, I want to open the oilskin bundle at the end, so that the demo rewards me with a concrete discovery as well as a cliffhanger.
17. As a Player, I want the harbour winch problem to be visually obvious, so that Raffaele's job makes sense before he explains it.
18. As a Player, I want the oil flask to be physically concealed by visible fishing nets, so that finding it follows the Scene rather than an invisible flag.
19. As a Player, I want moving the nets to reveal the same flask that was already behind them, so that Objects do not appear magically.
20. As a Player, I want to discover the oil before or after learning its purpose, so that curiosity is rewarded without creating a different solution.
21. As a Player, I want Raffaele's hint to identify the nets when I need help, so that the puzzle remains recoverable.
22. As a Player, I want to give Raffaele's letter to Brother Elia, so that carrying and giving the Object has a genuine narrative purpose.
23. As a Player, I want Brother Elia to stop me from operating the well before receiving the letter, so that the social gate is understandable in the fiction.
24. As a Player, I want the letter to expose Raffaele's Cover Story, so that dialogue reveals character as well as instructions.
25. As a Player, I want oiling the pulley and pulling the rope to be separate actions, so that applying an Object prepares the mechanism rather than solving everything automatically.
26. As a Player, I want the well mechanism to visibly change from seized to lubricated to freed, so that each step has readable feedback.
27. As a Player, I want the handle to become collectible only after the well is freed, so that Object availability matches the depicted mechanism.
28. As a Player, I want installing the handle to remove it from Inventory and leave it visibly mounted on the winch, so that the persistent world state is credible.
29. As a Player, I want Michele's installation Animation and the winch response to meet at a visible contact Cue, so that the action feels physically connected.
30. As a Player, I want to choose whether to confront Raffaele, ignore the lie or demand better payment, so that the discovery has a character consequence.
31. As a Player, I want those choices to affect Trust, Testimony and Dialogue State without blocking completion, so that choice matters without creating a dead end.
32. As a Player, I want no death, lost essential Object or irreversible failure state, so that the demo is always completable.
33. As a Player, I want failed Object combinations to receive intentional feedback, so that experimentation never feels ignored.
34. As a Player, I want authored alternatives available in each Conversation, so that I can complete the story without guessing free-form prompts.
35. As a Player, I want to ask Raffaele, Brother Elia and the wounded sailor optional free-form questions, so that their authorised knowledge can deepen the world.
36. As a Player, I want Raffaele's false account represented as a Claim and Cover Story rather than a false Narrative Fact, so that the Engine never endorses his lie as truth.
37. As a Player, I want Brother Elia's account to add the true Narrative Fact to Michele's Character Knowledge, so that Reflection can distinguish knowledge from Testimony.
38. As a Player, I want guarded and secret information to remain unavailable until its authored condition is met, so that free-form dialogue cannot bypass puzzle progress.
39. As a Player, I want Reflection to use only facts Michele has learned, so that it helps without becoming an omniscient hint system.
40. As a Player, I want Reflection to remind me separately about the dry pulley, the oil near the nets and the handle's destination, so that hints remain diegetic and progressive.
41. As a Player, I want Conversations, Lines, Narrations and Choices to share a consistent presentation, so that authored and generated material feel like one game.
42. As a Player, I want Sequences to direct Character Animation, Scenery Animation, Motion and Camera together, so that important moments feel staged rather than assembled from messages.
43. As a Player, I want long Sequences to be skippable without losing their canonical outcome, so that presentation preferences never corrupt progress.
44. As a Player, I want the Camera to follow Michele horizontally at the harbour, so that a wide working port can be explored naturally.
45. As a Player, I want the Camera to follow Michele vertically at the fortification, so that the climb communicates Capri's height and geography.
46. As a Player, I want directed Camera cuts, moves, holds and follows during the boat arrival, so that Fondale's cinematic direction is demonstrated in play.
47. As a Player, I want Michele to walk, turn, speak, pick up Objects and operate mechanisms with scale-correct directional artwork, so that the Player Character remains convincing in every Scene.
48. As a Player, I want Raffaele and Brother Elia to remain visually stable in their authored positions, so that their simplified static presentation never calls attention to missing movement.
49. As a Player, I want Background, Characters, Scenery and Objects to share one world scale, so that nothing looks pasted in or enlarged by the renderer.
50. As a Player, I want an oil flask and winch handle that remain recognisable both in Scene Space and Inventory, so that Object identity survives the change of presentation scale.
51. As a Player, I want Scenery Appearances to preserve placement, contact shadows and lighting, so that state changes do not jump or reveal painted remnants.
52. As a Player, I want foreground elements to occlude Michele correctly, so that the illustrated world has convincing depth.
53. As a Player, I want persistent changes to survive Scene transitions and continuation, so that returning to the harbour or cloister shows what I already did.
54. As a Player, I want the browser to offer continuation of my latest committed Game State, so that reloading does not discard progress.
55. As a Player, I want mouse and keyboard interaction to complete the whole demo, so that the Example demonstrates the supported input baseline.
56. As a Player, I want Inventory and hotspot-reveal controls to remain usable throughout exploration, so that the HUD supports rather than obscures play.
57. As a Player, I want Inventory to be unavailable while narrative activities control play, so that I cannot interfere with a Line, Choice, Conversation or Sequence.
58. As a Player, I want actionable feedback if the Dialogue Server cannot be reached, so that an environment problem is not mistaken for a broken game.
59. As an Author evaluating Fondale, I want every showcased capability to serve the story or puzzle, so that I can understand how to use it in a real Game Project.
60. As an Author evaluating Fondale, I want the Example to use only the packaged public API, so that it represents what an external Game Project can actually author.
61. As an Author evaluating Fondale, I want focused definitions for Scenes, Characters, Objects, Sequences and narrative authority, so that the Example remains readable as reference material.
62. As an Author evaluating Fondale, I want Art Masters separated from Runtime Assets, so that the production workflow is clear and reproducible.
63. As an Author evaluating Fondale, I want source prompts or provenance retained only for final artwork, so that the Example is auditable without preserving abandoned experiments.
64. As an Author evaluating Fondale, I want the README, Game Project and acceptance behavior to describe the same demo, so that there is one authoritative example.
65. As a contributor, I want obsolete Scenes, Objects, Sequences and PNG experiments removed after replacement, so that the repository does not accumulate contradictory examples.
66. As a contributor, I want untracked experimental images removed only after explicit scope resolution and successful replacement, so that cleanup cannot destroy the only usable source.
67. As a contributor, I want browser verification to cover the complete critical path, so that future Engine changes cannot silently break the canonical Example.
68. As a contributor, I want the standard verification to use deterministic dialogue support, so that tests require no database, model key or network.
69. As a contributor, I want an opt-in live dialogue verification, so that Knowledge-Driven Dialogue can be exercised against the real Dialogue Server without destabilising the standard suite.
70. As a contributor, I want final visual assets inspected at actual play size, so that successful compilation cannot hide scale, alpha, occlusion or animation defects.

## Implementation Decisions

**Product boundary.** The work replaces the existing Capri 1535 Example; it
does not create a second demo beside it. The Example remains a self-contained
consumer of the packaged public Fondale API. It demonstrates meaningful
Player-facing Engine Capabilities, not every invalid authoring case or internal
API combination.

**Canonical narrative boundary.** The demo is the canonical prologue of the
larger missing-ship story. Michele begins with the ordinary desire to earn
money for his own boat. The drifting boat, wounded sailor, broken ship seal and
registry fragment are the inciting incident. The sailor once sailed with
Michele's father, recognises Michele through family resemblance, remains
unnamed and loses consciousness. His survival and full identity remain open.

**Four-Scene route.** The route is harbour to cloister, back to harbour, then
coastal fortification and drifting boat. The harbour and cloister have
bidirectional Passages. The fortification becomes eligible only after the
winch is repaired. Arrival at or observation from the fortification directs
the boat-arrival Sequence and then permits the final transition. There is no
town-square hub and no Travel Map.

**Logical and Scene scale.** The Game Project uses a `1280×720` Logical
Resolution and one Scene Space unit per Runtime Asset pixel. The intended Scene
sizes are `1920×720` for the horizontally scrolling harbour, `1280×720` for the
cloister, `1280×1440` for the vertically scrolling fortification and
`1280×720` for the drifting boat. These sizes may be adjusted only during
blocking if the final geometry proves a different exact size necessary; the
Logical Resolution and project-wide scale remain fixed.

**Reference Character.** Michele is the project reference Character. His
native Runtime cell is sized so that every reachable Perspective Scale displays
him at 1:1 or smaller, never enlarged. Scene architecture, doors, stairs,
Scenery and Objects are blocked around his actual near, middle and far
silhouettes before finished art is generated.

**Character production scope.** Michele retains his approved V3 visual design
and the current approved V3 Runtime sprites; implementation must reuse those
sprites without regenerating or creatively deriving replacements. They provide
the production-ready four-Facing idle, walking, speaking, pick-up and
mechanism-use Animations required by the Sequences. Every non-Michele Character
remains stationary and has exactly one static Runtime image. Raffaele and
Brother Elia retain their existing approved static image; the wounded sailor
receives one new static image. None of them receives a separate Speaking Role,
breathing Animation, directional presentation or walking production.

**Daylight progression.** The harbour begins in clear morning light, the
cloister uses early-afternoon light, the fortification moves into golden hour,
and the drifting boat plays toward dusk. Cross-Scene palette changes remain
part of one illustrated neo-retro visual language rather than four unrelated
styles.

**Harbour composition.** The harbour visibly contains the work area, winch,
gozzo, Raffaele, fishing nets and the concealed oil flask. It reserves a broad
connected Walkable Region, readable approaches and enough horizontal space to
demonstrate Camera following. The current harbour imagery may inform location
and design, but the production package is rebuilt as one accepted composition,
clean Background and separated stateful assets.

**Fishing-net reveal.** The nets are Scenery with stable `covering` and `moved`
Appearances. In the covering state their artwork and depth genuinely occlude
the oil flask. Pulling the nets runs Michele's directed Animation, changes the
nets' persistent Appearance and makes the already positioned oil-flask Object
visible and eligible. The reveal is not represented by a one-pixel fake asset
or a newly materialised Object.

**Cloister composition.** The cloister visibly contains Brother Elia, the well,
the seized pulley or windlass, rope, bucket and mounted winch handle. The
mechanical relationship must be plausible: the borrowed removable handle is
trapped while the loaded mechanism is seized under tension. The Scene reserves
clear visual states and approaches for inspection, oiling, pulling and
collection.

**Well state model.** Stateful well Scenery has at least `seized`,
`lubricated` and `freed` Appearances or equivalent explicit lasting states.
Using the oil changes only the lubrication state and consumes the selected
Object. Pulling the rope after lubrication runs the freeing Sequence and makes
the handle collectible. Pulling before lubrication produces authored feedback
without state change.

**Winch state model.** The harbour winch has explicit missing-handle and
installed-handle Appearances plus the transient Animations needed by the
installation Sequence. Installing the handle places that Object at the winch
with an installed Appearance rather than deleting it from the fiction. The
Michele Animation Cue and winch response share a visible contact moment. Skip
outcomes apply exactly the same persistent state.

**Boat arrival and final Scene.** The distant arriving boat is separated
Scenery with stable scale, transparent bounds, rocking Animation and directed
Motion. The fortification Sequence exercises Camera cut, move, hold and follow
without changing canonical Camera state. The final drifting-boat Scene depicts
cut rigging, a forced chest, an abraded name and blood leading toward the
wounded sailor. These are inspectable environmental clues, not an additional
blocking puzzle.

**Object registry.** The required persistent Objects are Raffaele's sealed
letter, the oil flask, the winch handle and the oilskin bundle. The opened
bundle presents the broken seal and registry fragment as its `opened`
Appearance because they have no independent use within the demo. Every Object
has a scale-correct Scene Appearance where relevant, a separately designed
Inventory Appearance, intentional Noun cases and a complete lifecycle through
Scene, Inventory, placement or consumption.

**Object order and recoverability.** The oil flask may be discovered before or
after Brother Elia reveals its purpose. The letter is required before Michele
may operate the cloister well. Applying oil and pulling the rope are separate
steps. Essential Objects cannot be consumed on unsupported targets, discarded
or left in an unrecoverable location. Unsupported combinations produce
authored feedback without Game State mutation.

**Dialogue authority.** Raffaele's assertion that the friars stole the handle
is a Claim used as a Cover Story for the Narrative Fact that he lent it
voluntarily. Brother Elia knows and may disclose the true Fact after receiving
the letter. Michele may remember Raffaele's Claim as Testimony and later learn
the conflicting Fact. Authored Conversation alternatives carry exact
puzzle-critical wording and Game Operations. Free-form Dialogue Turns may
explore only eligible Character Knowledge.

**Relationships and choices.** Delivering the letter may increase Brother
Elia's directional Trust toward Michele. After repairing the winch, authored
Choices allow Michele to accuse Raffaele, ignore the lie or request better
payment. They may change directional Trust, Raffaele's Dialogue State and later
Lines, but all branches converge on access to the fortification and cannot
make the demo unwinnable.

**Reflection as hints.** Narrative Facts are granular enough for Reflection to
compose progressive reminders: the well mechanism is dry, oil is or was near
the harbour nets, and the recovered handle belongs on the harbour winch.
Reflection never receives undiscovered facts and never applies a puzzle effect
by itself.

**Sequence coverage.** The authored prologue uses Character-bound Lines,
Narration, Choices, conditional Branches, explicit Operations, nested or handed
off Sequences where appropriate, Character and Scenery Animation directions,
Scenery Motion, Animation Cues and Camera direction. Significant Sequences are
skippable only when a complete `skipOutcome` commits the same canonical result
as ordinary playback.

**Persistence and HUD.** The Example retains Fondale's contextual commands,
Inventory, hotspot reveal, help and preference behavior, Reflection control,
Save Snapshot validation and browser continuation. Inventory remains suspended
during narrative activities. All Italian command labels, fallbacks, Lines and
Narrations remain Project-owned presentation.

**Dialogue environment.** The full Example requires the separately run
Dialogue Server because its Characters support Knowledge-Driven Dialogue. The
critical authored path never depends on model interpretation or generated
wording. Standard browser verification substitutes deterministic support at
the production HTTP seam; live Dialogue Server verification remains opt-in.

**Asset-package contract.** Each Scene ships an accepted Composition Art
Master, clean Background Art Master, separated Scenery Art Masters, fitted
Runtime Assets, definition and exact-size diagnostic geometry artifact. Each
Object or Character changed by this work ships its corresponding master,
Runtime presentation, Visual Anchor and actual-size diagnostic. Art Masters are
lossless; derived Runtime Assets never overwrite them.

All production artwork for the prologue's Scenes and Backgrounds, Scenery and
Objects is regenerated for this rebuild. Existing versions may be inspected as
design or location reference, but are not reused as final production artwork.
This regeneration rule does not override the explicit Character exceptions:
Michele reuses his current approved V3 Runtime sprites, while every other
Character is represented by exactly one static Runtime image; Raffaele and
Brother Elia retain theirs and the wounded sailor's is newly produced.

**Stateful artwork contract.** Every Appearance is designed in the full Scene
composition before separation. Compatible states retain exact position,
Baseline, Visual Anchor, world scale, perspective, illumination and union
footprint. Clean plates contain no holes, residual fragments or obsolete
shadows. Recomposing every state over its Background must reproduce the
accepted composition for that state at 1:1 pixels.

**Navigation-first blocking.** Each Scene begins with Michele silhouettes,
Walkable Region, Perspective Scale, entrances, passages, Hotspots, approaches,
Scenery footprints and HUD-safe focal areas at final Runtime dimensions.
Walkable Regions remain broad connected polygons without unnecessary obstacle
complexity. Geometry is measured from final 1:1 artwork rather than resized
previews.

**Repository cleanup.** Cleanup happens only after the replacement Game
Project builds and the new content passes relevant browser and visual checks.
Disconnected legacy Scene packages, obsolete Object and Sequence content,
superseded Runtime PNGs, abandoned Character generations, previews, candidate
outputs and temporary diagnostics are removed. Final Art Masters, production
Runtime Assets, prompt or provenance notes and current diagnostics remain.
Untracked experimental binaries are treated as non-recoverable and deleted
only when their replacement and lack of final references have been verified.

**Documentation coherence.** The Example README, authored Game Project,
narrative facts, Game Variables, tests and shipped media describe the same
four-Scene prologue. Obsolete references to the previous four-Scene route or
the temporary one-Scene registry are removed. The broader story handoff remains
the narrative source and is updated only where the accepted demo establishes
new canon.

## Testing Decisions

A good test observes Player-visible behavior through the highest available
seam. It starts the packaged Example, drives the same HUD and world interactions
a Player uses, and observes Scene identity, visible presentation, dialogue,
Inventory and final narrative outcome. It does not assert private Game State,
renderer implementation details, prompt text or asset-generation tooling.

**Primary seam — packaged Example browser acceptance.** The existing
Playwright acceptance harness is the primary and ideally only new behavioral
seam. One complete critical-path test covers accepting Raffaele's job, revealing
and collecting the oil flask, giving the letter, learning the truth, oiling and
operating the well, collecting and installing the handle, choosing a response
to Raffaele, climbing the fortification, following the boat and opening the
final bundle. Assertions use visible Lines, Inventory entries, Scene changes,
Scenery presentation and the final cliffhanger.

The same seam also covers the alternate valid order in which the Player finds
the oil before learning its purpose, verifies that ineligible actions provide
feedback without mutation, and proves that essential Objects remain available.
Focused acceptance cases cover horizontal and vertical Camera travel,
foreground occlusion, hotspot reveal, mouse and keyboard operation, Sequence
skipping with equivalent outcomes, Reflection with only learned facts, and
continuation after a reload at representative milestones.

**Dialogue determinism.** Standard acceptance intercepts the production HTTP
dialogue protocol with existing deterministic test support. It proves that
authored alternatives complete every required conversation, that free-form
answers never disclose an ineligible Fact, that Raffaele's Cover Story is
recorded as Testimony rather than learned truth, and that provider failure or
cancellation commits no partial progress. No standard build or verification
command requires PostgreSQL, a model key or network access.

**Live dialogue seam.** The existing opt-in live browser configuration remains
the only verification against the independently running Dialogue Server. It
checks exploratory conversation, continuity and authorised verbalisation, but
does not compare generated sentences verbatim and does not own puzzle
completion coverage.

**Startup and build validation.** The package build and Game Project startup
diagnostics prove that all definitions, registry references, assets, Animation
Sheets, Appearances, conditions, Operations, Sequences, passages and dialogue
authority resolve. No new low-level Engine seam is introduced unless the work
uncovers an Engine defect rather than an Example authoring error.

**Visual verification.** Automated browser screenshots are evidence, not
pixel-golden tests. Each Scene is inspected in the Engine at actual play size
with Michele at near, middle and far Perspective Scale stops. Review covers
world scale, native-resolution Character display, clean alpha, stable anchors,
state recomposition, contact shadows, occlusion, Camera limits, HUD-safe
composition and letterboxing. Every Scenery and Object Appearance is exercised.

**Animation verification.** Michele's four walking Facings are played for at
least three uninterrupted cycles at representative depths and checked for
foot planting, Ground Point stability, identity, scale and loop continuity.
Pick-up and mechanism-use Animations are observed with their Sequence Cues.
Stateful Scenery loops and the approaching boat are reviewed in motion; a still
screenshot cannot approve them.

**Cleanup verification.** After cleanup, repository searches must find no
source import, definition reference, documentation claim or test expectation
for removed content. The Example build and complete browser suite run again
from the cleaned tree. Final media inventory is compared with the Game Project
registries and retained provenance so that every shipped production asset has
an owner and every retained exploratory asset has an explicit reason.

## Out of Scope

- Completing the full missing-ship adventure beyond the prologue.
- Naming the wounded sailor or deciding whether he ultimately survives.
- Defining the full history, captain, crew, cargo, mutiny, antagonist or final
  location of the missing ship.
- Deciding the ultimate legal or moral owner of the lost cargo.
- Introducing Barbarossa as a direct antagonist or depicting a corsair raid.
- Adding Sorrento, Amalfi, Procida, Ischia, Naples or a Travel Map.
- Restoring the town square, alley, grotto, Monte Solaro or tavern as playable
  Scenes.
- Adding more puzzle solutions beyond the two valid discovery orders for the
  oil flask.
- Adding Player death, timed failure, essential-Object loss or unwinnable Game
  State.
- Giving Raffaele or Brother Elia new walking cycles or complete directional
  performance packages.
- Making the wounded sailor a freely moving Character.
- Treating every command verb or invalid API combination as a required demo
  beat when it does not serve the story.
- Changing Fondale public interfaces solely to accommodate Example content.
- Making model-generated language authoritative over Narrative Facts, Claims,
  puzzle outcomes or Game Operations.
- Making the standard verification suite depend on live model output,
  PostgreSQL, credentials or network access.
- Creating a second legacy-demo mode or retaining contradictory old content in
  the playable project.

## Further Notes

The broader narrative handoff is direction rather than a closed screenplay.
This spec intentionally establishes only the canon needed by the prologue: the
wounded sailor's connection to Michele's father, the broken ship seal and the
registry fragment. These decisions preserve the handoff's central principles:
Michele is an ordinary young Caprese pursuing money for a boat; the mystery is
about people and partial truths; the clue is not a map; historical events
remain background; and humour never trivialises real violence.

The current worktree contains extensive modified and untracked visual
experiments. Implementation must assume that existing files may represent
valuable user work until each candidate has been inspected against this spec.
The user's cleanup authorisation covers obsolete art and PNGs, but it does not
justify deleting unrelated environment configuration, documentation or source
material outside the rebuilt Example.

The visual skills materially shape this spec: correct scale is established
before generation; Background and separated subjects are authored as one
composition; stateful elements are accepted only through recomposition; and
Runtime build success alone cannot qualify art as production-ready.
