# Fondale

Shared glossary for the adventure game engine. It names the concepts through
which a game project defines its world and the player interacts with it.

## Product language

**Engine**:
The reusable system that interprets a Game Project and makes its adventure
playable without requiring changes to the engine's internals.
_Avoid_: Game, generic framework

**Engine Capability**:
Reusable behavior that Fondale guarantees to Game Projects through its public
interface.
_Avoid_: Capri feature, renderer detail

**Game Setting**:
A choice or value through which a Game Project adapts an Engine Capability to
its artistic direction and behavior.
_Avoid_: Engine constant, internal interface

**Logical Resolution**:
The width and height of the shared visual space in which every Scene of a Game
Project is authored.
_Avoid_: Window size, renderer resolution, per-Scene resolution

**Author**:
The web developer who builds a Game Project through Fondale's public interface
without depending on the engine's internals.
_Avoid_: Player, end user

**Player**:
The person who controls a Game Session and expresses intentions through the
game's supported input.
_Avoid_: Author, Game Project

**Game Project**:
The self-contained collection of content, settings, and behaviors that defines
a particular adventure built with Fondale.
_Avoid_: Engine, demo

**Game Definition**:
The declarative description of an adventure element, kept separate from
exceptional behavior written specifically for a Game Project.
_Avoid_: Engine class, generic configuration

**Game Behavior**:
A rule specific to an adventure that complements its Game Definitions without
changing the engine's internals.
_Avoid_: Engine patch, plugin

**Example**:
A Game Project distributed with Fondale to demonstrate and verify supported
Engine Capabilities; Capri 1535 is the first Example.
_Avoid_: Engine code, throwaway demo

## Playthrough language

**Game Session**:
An isolated execution of a Game Project, from starting a new game or restoring
one until it is stopped.
_Avoid_: Game Project, renderer, global game

**Game State**:
The canonical facts that describe the current progress of a Game Session and
determine how its world may evolve.
_Avoid_: Game Project, renderer state, transient activity

**Game Operation**:
A validated request that moves a Game Session atomically from one valid Game
State to the next.
_Avoid_: Direct mutation, renderer event, callback side effect

**Game Activity**:
Runtime behavior that progresses over logical time, such as a Player Intent or
a controlled sequence; at most one Game Activity controls play at a time.
_Avoid_: Animation frame, ambient rendering, unmanaged task

## Interaction language

**Scene**:
The explorable unit of the world that the Engine presents as one space. It may
represent an interior or an outdoor location; it is not a controlled sequence
of actions.
_Avoid_: Room, sequence

**Scene Space**:
The logical coordinate space shared by a Scene's background, placed elements,
and authored geometry.
_Avoid_: Screen coordinates, CSS pixels, window space

**Background**:
The visual base that spans the whole Scene Space. A local element that needs
its own position, depth, or behavior is Scenery instead.
_Avoid_: Scenery, visual layer

**Ground Point**:
The point where a Character or Object meets the walkable surface and from
which its position, depth, and perspective are interpreted.
_Avoid_: Sprite origin, center point

**Visual Anchor**:
The point within a visual asset that aligns it to a Ground Point or Baseline
and remains consistent across its animation frames.
_Avoid_: Pivot, sprite origin

**Baseline**:
The Scene Space depth at which Scenery meets the ground and joins the world's
visual ordering.
_Avoid_: z-index, rendering layer

**Perspective Scale**:
The Scene-defined relationship between a Ground Point's depth and the visual
size of a Character or Object placed there.
_Avoid_: Camera zoom, sprite scale

**Character**:
A persistent entity capable of acting in the world, controlled by either the
Player or the game. Its definition does not belong to a Scene; a Scene may only
specify its initial position.
_Avoid_: Actor, sprite

**Scenery**:
The non-collectible visual elements local to a Scene and defined separately
from its background when they need their own position, depth, or behavior.
_Avoid_: Object, Hotspot, details embedded in the background

**Hotspot**:
The surface that makes part of the Scenery, an Object present in the Scene, or
a background region interactive. It has no identity apart from what it makes
interactive.
_Avoid_: Interactive object, world entity, clickable point

**Object**:
A persistent entity the Player can collect. Its definition belongs to the Game
Project; a Scene may specify its initial position but does not own it.
_Avoid_: Scenery, synonym for Hotspot

**Interaction**:
A meaningful response of the world to a Player Intent; a Scene freely defines
its label, such as Look, Talk, Knock, or Pay.
_Avoid_: Verb, command

**Primary Action**:
The default Interaction of a Hotspot when no inventory Object is selected.
_Avoid_: Contextual click, default action

**Player Intent**:
The complete request to reach a target, face it, and perform an Interaction. A
new Player Intent replaces one still in progress.
_Avoid_: Click, queued movement

**Inventory Use**:
The attempt to apply a selected Object to a target. Failure preserves the
selection; success ends it.
_Avoid_: Drag-and-drop, Use verb
