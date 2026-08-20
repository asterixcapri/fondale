import {
  commandVerbs,
  type CommandLexicon,
  type CommandResponse,
  type HUDTheme,
} from "fondale";

/** The Engine never infers grammar: every word a Player reads is authored. */
export const commandLexicon = ({
  inventory: { select: "Hold {noun}", deselect: "Put back {noun}" },
  verbs: {
    open: "Open", "pick-up": "Pick up", push: "Push", close: "Close",
    "look-at": "Look at", pull: "Pull", give: "Give", "talk-to": "Talk to", use: "Use",
  },
  patterns: {
    unary: "{verb} {noun}",
    give: "{verb} {first} to {second}",
    use: "{verb} {first} with {second}",
  },
} satisfies CommandLexicon);

/** The last resort that guarantees every Command answers something. */
export const commandFallbacks: Readonly<Record<(typeof commandVerbs)[number], CommandResponse>> =
  Object.fromEntries(commandVerbs.map((verb) => [verb, { text: "That leads nowhere." }])) as
    Readonly<Record<(typeof commandVerbs)[number], CommandResponse>>;

/**
 * A complete HUD Theme, type-checked but not mounted by the recipe game.
 *
 * A Theme requires a local font file, and these recipes ship no font: adding
 * one to the published package means shipping its licence too. Copy this into
 * your own game and point `font.source` at a font you have the right to
 * redistribute.
 */
export const hudTheme = ({
  font: { family: "Your Font", source: new URL("./your-font.woff2", import.meta.url) },
  colors: {
    text: "#f4ece0",
    preferred: "#ffd479",
    selected: "#ffb347",
    backing: "#1b1a17",
    border: "#3a352c",
    inventoryWell: "#12110f",
  },
  opacity: 0.9,
  maxSpeechWidth: 520,
  cursors: {
    left: new URL("./lantern-inventory.png", import.meta.url),
    right: new URL("./lantern-inventory.png", import.meta.url),
    up: new URL("./lantern-inventory.png", import.meta.url),
    down: new URL("./lantern-inventory.png", import.meta.url),
    enter: new URL("./lantern-inventory.png", import.meta.url),
  },
  speechColors: { player: "#f4ece0", keeper: "#c8d9c0" },
} satisfies HUDTheme);
