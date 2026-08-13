import { type CommandLexicon, type HUDTheme } from "@asterixcapri/fondale";

import fontUrl from "./capri-pixel.ttf";
import cursorDownUrl from "./cursors/down.svg";
import cursorEnterUrl from "./cursors/enter.svg";
import cursorLeftUrl from "./cursors/left.svg";
import cursorRightUrl from "./cursors/right.svg";
import cursorUpUrl from "./cursors/up.svg";

export const italianCommandLexicon = ({
  inventory: { select: "Prendi {noun}", deselect: "Riponi {noun}" },
  verbs: {
    open: "Apri",
    "pick-up": "Raccogli",
    push: "Spingi",
    close: "Chiudi",
    "look-at": "Guarda",
    pull: "Tira",
    give: "Dai",
    "talk-to": "Parla con",
    use: "Usa",
  },
  patterns: {
    unary: "{verb} {noun}",
    give: "{verb} {first} a {second}",
    use: "{verb} {first} con {second}",
  },
} satisfies CommandLexicon);

export const italianCommandFallbacks = {
  open: { text: "Non c'è niente da aprire qui." },
  "pick-up": { text: "Meglio lasciarlo dov'è." },
  push: { text: "Non si muove di un dito." },
  close: { text: "Non c'è niente da chiudere." },
  "look-at": { text: "Non noto altro di utile." },
  pull: { text: "Tirare non servirebbe." },
  give: { text: "Non credo che lo vorrebbe." },
  "talk-to": { text: "Non sembra incline alla conversazione." },
  use: { text: "Non funzionerebbe così." },
} as const;

export const capriHudTheme = ({
  font: { family: "Capri Pixel", source: fontUrl },
  colors: {
    text: "#f4dfb4",
    preferred: "#f2ad62",
    selected: "#58d6d2",
    backing: "#0c1626",
    border: "#5c7182",
    inventoryWell: "#152536",
  },
  opacity: 0.9,
  maxSpeechWidth: 160,
  cursors: {
    left: cursorLeftUrl,
    right: cursorRightUrl,
    up: cursorUpUrl,
    down: cursorDownUrl,
    enter: cursorEnterUrl,
  },
  speechColors: {
    michele: "#f4dfb4",
    raffaele: "#f2ad62",
  },
} satisfies HUDTheme);
