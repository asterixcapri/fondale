import {
  type GameProject,
  type NounDefinition,
  type SceneDefinition,
  startGame,
} from "@asterixcapri/fondale";

import { brotherElia } from "../../src/characters/brother-elia";
import { michele } from "../../src/characters/michele";
import { italianCommandFallbacks, italianCommandLexicon } from "../../src/hud";
import { oilFlask } from "../../src/objects/oil-flask";
import { winchHandle } from "../../src/objects/winch-handle";
import { cloister } from "../../src/scenes/cloister";
import { freeWell } from "../../src/sequences/free-well";

const harbourStub = ({
  background: cloister.background,
  size: { width: 1280, height: 720 },
  walkableRegion: [
    { x: 0, y: 460 },
    { x: 1280, y: 460 },
    { x: 1280, y: 700 },
    { x: 0, y: 700 },
  ],
  entrances: {
    fromCloister: { groundPoint: { x: 1100, y: 620 }, facing: "left" },
  },
  passages: [{
    area: [
      { x: 1120, y: 460 },
      { x: 1280, y: 460 },
      { x: 1280, y: 700 },
      { x: 1120, y: 700 },
    ],
    approach: { groundPoint: { x: 1100, y: 620 }, facing: "right" },
    noun: ({
      labels: [{ text: "Passaggio verso il chiostro" }],
      preferredVerbs: [{ verb: "walk-to" }],
      cases: [],
    } satisfies NounDefinition),
    direction: "right",
    destination: { scene: "cloister", entrance: "fromHarbour" },
  }],
} satisfies SceneDefinition);

const isolatedProject = ({
  identity: "org.asterixcapri.capri-1535-cloister-fixture",
  version: "1",
  logicalResolution: { width: 1280, height: 720 },
  scenes: { cloister, harbour: harbourStub },
  characters: {
    michele: {
      ...michele,
      initialScene: "harbour",
      initialGroundPoint: { x: 1050, y: 620 },
      dialogue: undefined,
    },
    brotherElia: {
      ...brotherElia,
      noun: { ...brotherElia.noun, cases: [], fallbacks: undefined },
      dialogue: undefined,
    },
  },
  objects: {
    oilFlask: { ...oilFlask, initialGroundPoint: { x: 1000, y: 620 } },
    winchHandle,
  },
  sequences: { freeWell },
  variables: { letterDelivered: false, wellFreed: false, wellLubricated: false },
  playerCharacter: "michele",
  commandLexicon: italianCommandLexicon,
  commandFallbacks: italianCommandFallbacks,
  initialScene: "harbour",
} satisfies GameProject);

await startGame(isolatedProject, {
  target: document.querySelector<HTMLElement>("#game")!,
});
