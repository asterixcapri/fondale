import { Container, Graphics, Rectangle, Sprite, Texture } from "pixi.js";

import type { Polygon, Room } from "./room";

/**
 * The pieces of scenery a character can walk behind.
 *
 * Each one is the background itself, cut to the object's outline and drawn a
 * second time on top of the scene. Because the pixels come from the painting
 * rather than a separate export, a piece can never drift out of register with
 * what is underneath it, and costs nothing to produce.
 *
 * Two steps, and both are needed. The texture is cropped to the polygon's
 * bounding box, which is what puts the right pixels in the right place — a
 * texture *fill* stretches the whole painting across the shape instead. The
 * polygon then masks that crop down to the object's actual outline, so the
 * piece does not cover its neighbours with a rectangle.
 *
 * Depth is left to the display list. The piece carries its baseline as a
 * zIndex and the character carries their feet, so a character standing further
 * away than the object's footing is covered by it and one standing nearer
 * passes in front — with no per-frame comparisons, and no special case for
 * several objects or several actors.
 */

function boundingBox(shape: Polygon): Rectangle {
  const xs = shape.map((p) => p.x);
  const ys = shape.map((p) => p.y);
  const x = Math.floor(Math.min(...xs));
  const y = Math.floor(Math.min(...ys));
  return new Rectangle(x, y, Math.ceil(Math.max(...xs)) - x, Math.ceil(Math.max(...ys)) - y);
}

export function buildForeground(room: Room, background: Texture): Container[] {
  return room.foreground.map((mask) => {
    const box = boundingBox(mask.shape);

    const piece = new Sprite(
      new Texture({ source: background.source, frame: box }),
    );
    piece.position.set(box.x, box.y);

    const outline = new Graphics().poly(mask.shape.flatMap(({ x, y }) => [x, y])).fill(0xffffff);
    piece.mask = outline;

    // A mask only takes effect while it is in the display list, so it travels
    // with the piece it clips rather than being parented separately — which
    // would also sort it independently of the thing it belongs to.
    const group = new Container();
    group.label = `foreground:${mask.id}`;
    group.zIndex = mask.baseline;
    group.addChild(outline, piece);

    return group;
  });
}
