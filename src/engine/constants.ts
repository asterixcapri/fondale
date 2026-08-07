/**
 * The room's logical resolution: 426x240, 16:9.
 *
 * This follows Thimbleweed Park rather than classic VGA — its rooms are
 * 320x128 / 428x172, wider and shorter than 320x200. Widescreen fills a modern
 * display with no bars, and the pixel budget stays low enough that a character
 * is ~100px tall in the foreground: the same animation cost as a VGA sprite,
 * which is the number that actually decides what the project can afford.
 *
 * Everything the game draws is authored against these coordinates. The viewport
 * scales them up by a whole number; nothing else needs to know the window size.
 */
export const ROOM_WIDTH = 426;
export const ROOM_HEIGHT = 240;
