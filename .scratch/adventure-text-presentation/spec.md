# Fondale — Adventure text presentation

Status: ready-for-human

## Problem Statement

The Player currently encounters several text treatments whose meaning is not
clear from their appearance or location. Character speech can overlap the
speaker, action feedback can be confused with dialogue, narration can appear in
the middle of the Scene, and Dialogue Choices look like generic interface
buttons rather than phrases the Player Character is about to say.

The conceptual model has also allowed the same authored value to describe both
speech and narration. A `Line` could omit its Character, while a `Command
Response` could declare a speaker and a separate presentation mode. This makes
Authors and the renderer answer the same question in multiple, contradictory
ways. Introducing another term solely for the shared lower-screen styling would
make the model harder to understand rather than simpler.

## Solution

Fondale gives each existing narrative concept one clear meaning and one
recognisable visual role:

- A `Line` is a phrase spoken by a Character. It appears above the visible
  speaker in that Character's colour, without a panel and with a strong dark
  outline.
- A `Command Response` explains what happened when a Command resolved. It uses
  compact white text in a dark translucent panel at the lower edge.
- `Narration` is authored prose delivered by the narrator rather than a
  Character. It uses the lower area but has a wider measure and the HUD Theme's
  warm text colour.
- A `Choice` appears as a numbered LucasArts-style list of phrases the Player
  Character may say. The list uses the Player Character's speech typography
  over one shared translucent gradient, without individual button boxes.

No domain concept is introduced to name the lower-screen styling. Location is
determined by the presence of a visible speaker: spoken text belongs above that
Character; text without a visible speaker belongs at the lower edge. Story and
control text no longer appears in the centre of the Scene.

## User Stories

1. As a Player, I want every spoken phrase to appear above its speaker, so that I immediately know who is talking.
2. As a Player, I want spoken text to clear the Character's head and silhouette, so that speech never obscures the speaker.
3. As a Player, I want each Character's speech to retain its authored colour, so that recurring speakers become recognisable.
4. As a Player, I want Character speech to have a thick dark outline, so that it remains readable over bright, dark, or detailed Scene art.
5. As a Player, I want Character speech to appear without a rectangular panel, so that dialogue feels like a LucasArts adventure rather than a notification.
6. As a Player, I want a one-line reaction triggered by a Command to look like every other Line from that Character, so that presentation follows the speaker rather than the code path.
7. As a Player, I want action feedback to appear at the lower edge, so that it does not interrupt the action in the centre of the Scene.
8. As a Player, I want Command Response text to be white, so that it reads as neutral feedback rather than a Character's voice.
9. As a Player, I want a Command Response to use a compact translucent dark panel, so that it is readable without hiding too much Scene art.
10. As a Player, I want the Command Preview to disappear as soon as I execute its action, so that it cannot overlap the resulting Command Response.
11. As a Player, I want a Command Response to disappear according to my text-speed preference, so that feedback remains long enough to read without becoming permanent.
12. As a Player, I want to dismiss a Command Response deliberately, so that I can continue at my own pace.
13. As a Player, I want narration to appear at the lower edge, so that no unexplained story text appears in the centre of the Scene.
14. As a Player, I want narration to use a wider measure than action feedback, so that longer prose wraps into fewer lines.
15. As a Player, I want narration to use the HUD Theme's warm text colour, so that it is subtly distinct from white action feedback.
16. As a Player, I want narration and Command Responses to use the same general lower-screen visual language, so that the interface has few predictable reading zones.
17. As a Player, I want narration and Command Responses to remain recognisably different, so that prose does not look like a mechanical action notification.
18. As a Player, I want Dialogue Choices to appear as numbered phrases, so that they resemble classic LucasArts dialogue lists.
19. As a Player, I want Dialogue Choices to use the Player Character's speech colour, font scale, and outline, so that they preview how the selected phrase will appear when spoken.
20. As a Player, I want Dialogue Choices to be left-aligned and vertically stacked near the lower edge, so that I can scan them quickly.
21. As a Player, I want Dialogue Choices to avoid individual rectangular button backgrounds, so that they read as dialogue rather than a settings menu.
22. As a Player, I want one shared dark translucent backdrop behind the Choice list, so that every phrase remains readable while the Scene stays visible.
23. As a Player, I want the Choice backdrop to fade into the Scene and have no border, so that it does not recreate a permanent classic HUD band.
24. As a Player, I want the hovered or keyboard-focused Choice to become brighter, so that the current selection is unambiguous.
25. As a keyboard Player, I want the same Choice styling and selection feedback as a mouse Player, so that input method does not change meaning.
26. As a Player, I want the chosen phrase to reappear as a Line above the Player Character when spoken, so that selection and speech form one continuous interaction.
27. As a Player, I want Choices to temporarily own input, so that world actions and unrelated messages do not compete with the list.
28. As a Player, I want control instructions to remain in Help rather than appearing over the Scene, so that tutorial text cannot be confused with story text.
29. As a Player, I want no story or control text to use the centre of the Scene, so that the action remains visually unobstructed.
30. As a Player, I want lower text to avoid an open Inventory drawer, so that feedback and prose remain readable while inspecting carried Objects.
31. As an Author, I want `Line` to mean only a Character-spoken phrase, so that every Line has an explicit speaker.
32. As an Author, I want `Narration` to be distinct from a Line, so that narrator prose does not masquerade as speech without a Character.
33. As an Author, I want `Command Response` to mean an explanation of a Command outcome, so that it cannot also act as Character dialogue.
34. As an Author, I want a Command Case to produce a Line directly, so that a single spoken reaction does not require a one-step Sequence.
35. As an Author, I want a Command Case to expose at most one textual outcome, so that a Line, Command Response, and Narration cannot compete simultaneously.
36. As an Author, I want the Engine to validate the Character attached to a Line, so that spoken text is never silently attributed to the wrong speaker.
37. As an Author, I want the HUD Theme to remain the source of Character speech colours and the warm narration colour, so that the Game Project retains its visual identity.
38. As an Author, I want rendering structure and input ownership to remain Engine-owned, so that Game Projects do not need custom DOM or CSS callbacks.

## Implementation Decisions

- `Line`, `Narration`, and `Command Response` remain separate domain concepts.
  No concept named Bottom Message or equivalent is added to the public model or
  ubiquitous language.
- A `Line` always identifies the Character that speaks it. A speakerless Line is
  invalid authoring rather than an implicit Narration.
- `Narration` is an explicit Sequence step with text and no Character.
- A `Command Response` contains neutral explanatory text. It no longer declares
  a speaker or an independent speech-versus-narration presentation mode.
- A Command Case may produce a direct Line for a single Character reaction,
  avoiding a named one-step Sequence. A Sequence remains the mechanism for
  multiple ordered Lines, Narrations, Choices, conditions, or Game Operations.
- A Command Case may combine its one textual outcome with validated world
  operations, but it must not produce more than one of Line, Command Response,
  or Sequence.
- A visible Character determines Line placement. The renderer anchors the
  bottom of the text above the actual rendered Character silhouette rather than
  subtracting a fixed distance from the Ground Point.
- Lines use the speaker's HUD Theme colour, the established speech font scale,
  a two-logical-pixel dark outline, no panel, and no speaker-name label.
- Command Responses use compact white text in a rounded dark panel with partial
  transparency at the lower edge. They retain text-speed timing and explicit
  skip behavior.
- Narration uses the same lower area and translucent panel language, but a
  wider maximum measure and the HUD Theme's warm text colour.
- Lower text is centred within the currently available Scene width. An open
  Inventory drawer reduces that width so the text never sits beneath the
  drawer.
- Dialogue Choices use a numbered, left-aligned vertical list. Each phrase uses
  the Player Character's Line typography and colour; hover and keyboard focus
  brighten the selected phrase.
- Choice rows have no individual background or border. The whole list owns one
  borderless dark backdrop at approximately 65% opacity, fading upward into the
  Scene.
- Selecting a spoken Choice presents that phrase as a Player Character Line
  before the Sequence continues. An explicitly unspoken Choice remains
  unspoken.
- Choices temporarily block world interaction and hide the Inventory trigger.
- Control hints are removed from the live Scene. Help is the sole source of
  mouse, keyboard, Inventory, reveal, Choice, Line-advance, Options, Save, and
  Load instructions.
- Command Previews remain contextual to the pointer and are not part of this
  text model. Their smaller translucent treatment remains governed by the
  contextual-command specification.
- The full-frame Scene and contextual Command overlay accepted by ADR-0007
  remain unchanged; this feature does not reintroduce a permanent lower HUD
  band.

## Testing Decisions

- Tests assert external behavior and computed presentation through public
  browser output. They do not assert private renderer methods, exact DOM nesting,
  or duplicated CSS strings.
- The primary behavior seam is the existing Engine browser fixture. It covers
  Line placement relative to the speaker, speaker colour and outline, compact
  white Command Responses, wider warm Narration, Choice numbering and focus,
  disappearance timing, skip input, and absence of centred control hints.
- The existing public authoring seam covers the revised contracts: a Line
  requires a valid Character, Narration is explicit, Command Response cannot
  declare a speaker or presentation mode, and a Command Case cannot declare
  competing textual outcomes.
- The existing packaged Capri acceptance seam exercises the complete public
  package rather than Engine source: a direct Character Line, a Command
  Response, Narration, mouse-selected Choice, keyboard-selected Choice, and the
  layout with Inventory open.
- Existing command-overlay, speech, Choice, public-helper, and Capri acceptance
  tests are the prior art. No renderer-only unit seam or CSS snapshot suite is
  introduced.
- During visual tuning, the Author reviews the running Capri Example in real
  time without repeatedly launching the full suite. Once the implementation is
  accepted, the agent runs the final package and packaged-example verification.
- Final visual evidence covers the Porto, Aiano, and Boffe scene families at
  Support Baseline viewports, including bright and visually dense backgrounds.

## Out of Scope

- Reintroducing the classic opaque lower Verb and Inventory band.
- Moving Character speech into bottom subtitles or adding speaker-name labels.
- Speech bubbles, tails, portraits, or dialogue wheels.
- A public concept that exists only to name lower-screen styling.
- Changing Command Preview, Inventory Selection, Inventory pagination, Save,
  Load, or Options behavior beyond avoiding visual overlap.
- Inferring a speaker when an Author omits the Character.
- Off-screen Character speech or voice-over presentation; this requires a
  separate decision.
- Touch, gamepad, or keyboard-only world navigation.
- Authored dialogue, narration, or puzzle-content rewrites.

## Further Notes

- The design combines classic LucasArts speaker-coloured Lines and numbered
  Choices with ADR-0007's modern full-frame Scene. It borrows interaction
  principles, not copyrighted visual assets.
- Narration and Command Response may occupy the same lower area without becoming
  the same concept: Narration frames the story, while Command Response explains
  a resolved Command.
- The domain glossary already records the agreed meanings of Line, Narration,
  and Command Response. No new ADR is warranted because the visual treatments
  are reversible and do not replace ADR-0007's architectural decision.
