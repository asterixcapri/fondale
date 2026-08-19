# What the Player gets

The Engine owns the interface. You never write a control, a menu, a speech
bubble or an inventory drawer: you write the definitions of your game, and this
is what a Player receives around them.

Read it before authoring. Several of these facts constrain what your
definitions and your artwork can be.

## Controls

The mouse drives everything: world Nouns, Inventory, Lines, Narrations, Command
Responses, Choices, Options, Continue and New Game.

Hovering presents one primary Command phrase and, when authored, one secondary
phrase, in a callout that follows the pointer. Left click executes the primary
action. Right click executes the visible secondary action, and otherwise does
nothing.

Holding `Tab` reveals the active Nouns and the directional Scene Passages, and
nothing else.

`.` or a middle click advances a Line or a Narration and dismisses a Command
Response. Keys `1`–`6` choose a visible alternative.

A persistent bag, or `I`, opens the Inventory drawer. Arrows and the wheel
paginate it; Escape or a click outside closes it.

`F5` opens Options. Compatible automatic progress offers Continue at startup,
and New Game replaces it. Ordinary play has no manual Save or Load.

## What this constrains

**Six alternatives, at most.** Choices and Conversation alternatives are chosen
with `1`–`6`, so no more than six may be eligible at once.

**Eight Inventory slots per page.** The drawer paginates beyond that; design
puzzles knowing the Player pages rather than sees everything at once.

**The narration lane is reserved.** Character speech is drawn with a strong
text edge above its speaker and follows that Character through the Camera.
Narration is drawn in a backed lower lane, fixed in the viewport. Do not put
anything the Player must see under that lane.

**Everything stays inside the Logical Resolution.** Speech and narration are
clamped to it, and Inventory, Choices, Command Responses, Options and Help stay
fixed in it even when the Scene scrolls.

**The frame is scaled and letterboxed.** The logical frame is fitted uniformly
and letterboxed to the window. Scaling uses the largest fitting integer factor,
or a uniform nearest-neighbour reduction when the window is smaller than the
Logical Resolution. Your artwork is therefore shown either at exact multiples
of its own pixels or reduced — never stretched, never at a fractional
enlargement.

**The Camera clamps.** On an oversized Scene it follows the Player Character on
both axes, clamps at the Scene edges, and translates the world on whole logical
pixels. Mouse actions and revealed geometry are projected through that same
Camera, so a Scene edge is a hard edge: nothing is reachable beyond it.

## Focus and state

Keyboard focus uses the browser's own indicator. The selected first Noun is
marked with an outline, a check mark and a pressed-state label — never by
colour alone.

## Where this is verified

Fondale 0.4 alpha is verified against the latest stable Google Chrome desktop
with WebGL. A regression there is a Fondale bug.

Alpha makes no compatibility promise for earlier authoring contracts, older
Chrome versions, other browsers, touch, gamepads, keyboard-only world
navigation, screen readers, or general WCAG conformance. Those are boundaries,
not claims that Fondale cannot work in an unverified environment.

## See also

[HUD](authoring/hud.md) for the theme you supply ·
[Scene](authoring/scene.md) for composing within the Camera ·
[Interaction](authoring/interaction.md) for the Commands behind these controls
