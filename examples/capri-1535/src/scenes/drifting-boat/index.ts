import { type NounDefinition, type SceneDefinition } from "@asterixcapri/fondale";

import { rectangle } from "../../geometry";
import backgroundUrl from "./background.png";

const clue = (label: string, response: string) => ({
  labels: [{ text: label }],
  preferredVerbs: [{ verb: "look-at" as const }],
  cases: [{ verb: "look-at" as const, response: { text: response } }],
} satisfies NounDefinition);

export const sailorHandoff = {
  michele: { groundPoint: { x: 930, y: 570 }, facing: "right" as const },
  sailor: { groundPoint: { x: 1098, y: 602 }, facing: "left" as const },
  cameraCenter: { x: 1030, y: 430 },
} as const;

/** The fixed 1280×720 dusk stage; neighbouring Scenes are referenced only by registry key. */
export const driftingBoat = ({
  background: backgroundUrl,
  size: { width: 1280, height: 720 },
  walkableRegion: [
    { x: 80, y: 520 },
    { x: 1220, y: 480 },
    { x: 1220, y: 610 },
    { x: 80, y: 610 },
  ],
  perspectiveScale: [
    { y: 520, scale: 0.76 },
    { y: 565, scale: 0.86 },
    { y: 610, scale: 0.96 },
  ],
  scenery: {
    mastAndCutRigging: {
      baseline: 560,
      initialAppearance: "default",
      appearances: {
        default: {
          kind: "background-region",
          area: [
            { x: 0, y: 0 },
            { x: 410, y: 0 },
            { x: 410, y: 420 },
            { x: 390, y: 420 },
            { x: 390, y: 535 },
            { x: 300, y: 560 },
            { x: 210, y: 520 },
            { x: 210, y: 390 },
            { x: 0, y: 350 },
          ],
        },
      },
    },
    shelterRoof: {
      baseline: 615,
      initialAppearance: "default",
      appearances: {
        default: {
          kind: "background-region",
          area: [
            { x: 895, y: 35 },
            { x: 1280, y: 35 },
            { x: 1280, y: 255 },
            { x: 930, y: 255 },
          ],
        },
      },
    },
    shelterPost: {
      baseline: 615,
      initialAppearance: "default",
      appearances: {
        default: {
          kind: "background-region",
          area: rectangle(1180, 150, 1245, 615),
        },
      },
    },
    foregroundHull: {
      baseline: 625,
      initialAppearance: "default",
      appearances: {
        default: {
          kind: "background-region",
          area: [
            { x: 0, y: 580 },
            { x: 160, y: 600 },
            { x: 430, y: 615 },
            { x: 760, y: 605 },
            { x: 1020, y: 590 },
            { x: 1280, y: 575 },
            { x: 1280, y: 720 },
            { x: 0, y: 720 },
          ],
        },
      },
    },
  },
  hotspots: [{
    target: { kind: "background" },
    area: rectangle(70, 75, 270, 335),
    approach: { groundPoint: { x: 245, y: 545 }, facing: "back" },
    noun: clue(
      "Sartie recise",
      "Le sartie sono state tagliate di netto. Non è stato il vento a spezzarle.",
    ),
  }, {
    target: { kind: "background" },
    area: rectangle(375, 315, 600, 520),
    approach: { groundPoint: { x: 520, y: 550 }, facing: "back" },
    noun: clue(
      "Cassa forzata",
      "Il coperchio è stato forzato dall'interno della serratura. Qualcuno cercava qualcosa in fretta.",
    ),
  }, {
    target: { kind: "background" },
    area: rectangle(565, 285, 900, 395),
    approach: { groundPoint: { x: 760, y: 540 }, facing: "back" },
    noun: clue(
      "Nome abraso",
      "Il nome dipinto sul fasciame è stato abraso quasi del tutto. Restano soltanto ombre di lettere.",
    ),
  }, {
    target: { kind: "background" },
    area: rectangle(850, 420, 970, 555),
    approach: { groundPoint: { x: 940, y: 555 }, facing: "back" },
    noun: clue(
      "Traccia di sangue",
      "Il sangue, ormai scuro, attraversa il ponte e termina sotto il riparo di poppa.",
    ),
  }, {
    target: { kind: "character", character: "woundedSailor" },
    area: rectangle(980, 340, 1250, 605),
    approach: sailorHandoff.michele,
  }],
  entrances: {
    fromFortification: { groundPoint: { x: 155, y: 560 }, facing: "right" },
  },
  passages: [{
    area: rectangle(0, 430, 145, 610),
    approach: { groundPoint: { x: 155, y: 560 }, facing: "left" },
    noun: ({
      labels: [{ text: "Scaletta verso gli scogli" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "left",
    destination: { scene: "fortification", entrance: "fromDriftingBoat" },
  }],
} satisfies SceneDefinition);
