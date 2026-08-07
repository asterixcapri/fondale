import backgroundUrl from "../../art/rooms/vicolo-capri.png";

import type { Room } from "../engine/room";

/**
 * A stepped alley in Capri town, looking down towards the sea and the
 * Faraglioni, with a bell tower on the right and an archway at the far end.
 *
 * Coordinates were read off the 426x240 background against a plotted grid and
 * then checked by drawing them back over the painting — see the debug overlay.
 */
export const vicoloCapri: Room = {
  id: "vicolo-capri",
  background: backgroundUrl,

  // The cobbles, narrowing towards the archway. The stone bench, the baskets
  // and the doorway steps are all outside it: the character walks the street,
  // not the furniture.
  walkable: [
    [
      { x: 55, y: 240 },
      { x: 108, y: 205 },
      { x: 140, y: 172 },
      { x: 172, y: 152 },
      { x: 186, y: 146 },
      { x: 228, y: 146 },
      { x: 250, y: 158 },
      { x: 300, y: 190 },
      { x: 340, y: 216 },
      { x: 352, y: 240 },
    ],
  ],

  // The archway is roughly two thirds of the way up the frame, and a figure
  // standing there reads as small; at the bottom edge they are at full height.
  scale: [
    { y: 146, scale: 0.55 },
    { y: 240, scale: 1.0 },
  ],

  // The tall jar sitting out on the cobbles: the character passes behind it
  // when further away than its own footing.
  foreground: [
    {
      id: "giara",
      shape: [
        { x: 239, y: 158 },
        { x: 262, y: 158 },
        { x: 263, y: 189 },
        { x: 238, y: 189 },
      ],
      baseline: 189,
    },
  ],

  hotspots: [
    {
      id: "giara",
      name: "Giara",
      shape: [
        { x: 239, y: 158 },
        { x: 262, y: 158 },
        { x: 263, y: 189 },
        { x: 238, y: 189 },
      ],
      approach: { x: 232, y: 196 },
    },
    {
      id: "porta-bottega",
      name: "Porta",
      shape: [
        { x: 283, y: 116 },
        { x: 305, y: 116 },
        { x: 305, y: 187 },
        { x: 283, y: 187 },
      ],
      approach: { x: 280, y: 196 },
    },
  ],

  exits: [
    {
      id: "arco",
      name: "Arco",
      shape: [
        { x: 186, y: 118 },
        { x: 232, y: 118 },
        { x: 232, y: 150 },
        { x: 186, y: 150 },
      ],
      to: "marina-grande",
      entrance: "dal-paese",
      approach: { x: 208, y: 150 },
    },
  ],

  entrances: {
    "dall-arco": { at: { x: 208, y: 152 }, facing: "front" },
    "dal-basso": { at: { x: 200, y: 236 }, facing: "back" },
  },
};
