import { type HUDTheme } from "@asterixcapri/fondale";

export const exampleHUDTheme = ({
  font: { family: "Example Serif", source: "./example-serif.woff2" },
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
    left: "./cursor-left.svg",
    right: "./cursor-right.svg",
    up: "./cursor-up.svg",
    down: "./cursor-down.svg",
    enter: "./cursor-enter.svg",
  },
  speechColors: { host: "#f2ad62" },
} satisfies HUDTheme);
