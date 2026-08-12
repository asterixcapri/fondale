import { expect, test } from "@playwright/test";

import * as Fondale from "../src/index";
import {
  AuthoringError,
  startGame,
  type CharacterDefinition,
  type CommandLexicon,
  type DirectionStep,
  type GameProject,
  type HUDTheme,
  type NounDefinition,
  type ObjectDefinition,
  type SaveSnapshot,
  type SceneDefinition,
  type SequenceDefinition,
} from "../src/index";

const scene = {
  background: "opening.png",
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 320, y: 0 },
    { x: 320, y: 180 },
    { x: 0, y: 180 },
  ],
} satisfies SceneDefinition;

const project = {
  identity: "example.typed-project",
  version: "1",
  logicalResolution: { width: 320, height: 180 },
  scenes: { opening: scene },
  initialScene: "opening",
} satisfies GameProject;

const focusedTypes = {
  character: null as unknown as CharacterDefinition,
  commandLexicon: null as unknown as CommandLexicon,
  direction: null as unknown as DirectionStep,
  hudTheme: null as unknown as HUDTheme,
  noun: null as unknown as NounDefinition,
  object: null as unknown as ObjectDefinition,
  save: null as unknown as SaveSnapshot,
  sequence: null as unknown as SequenceDefinition,
};

void focusedTypes;

test("the root API exposes declarative authoring types without legacy builders", () => {
  expect(project.scenes.opening).toBe(scene);
  for (const removed of [
    "defineGame",
    "defineCharacter",
    "defineObject",
    "defineScene",
    "defineSequence",
    "defineNoun",
    "defineCommandLexicon",
    "defineHUDTheme",
    "validateSaveSnapshot",
  ]) {
    expect(Fondale).not.toHaveProperty(removed);
  }
});

test("startGame reports aggregated project diagnostics before reading the target", async () => {
  let targetReads = 0;
  const options = {
    get target(): HTMLElement {
      targetReads += 1;
      throw new Error("target must remain untouched");
    },
  };

  const promise = startGame({
    ...project,
    identity: " ",
    version: " ",
    initialScene: "missing",
  }, options);

  await expect(promise).rejects.toMatchObject({
    diagnostics: [
      expect.objectContaining({ code: "definition.project.identity", path: "identity" }),
      expect.objectContaining({ code: "reference.scene.initial", path: "initialScene" }),
      expect.objectContaining({ code: "definition.project.version", path: "version" }),
    ],
  });
  expect(targetReads).toBe(0);
});

test("startGame validates an untrusted Save Snapshot before reading the target", async () => {
  let targetReads = 0;
  const options = {
    snapshot: { formatVersion: 999 },
    get target(): HTMLElement {
      targetReads += 1;
      throw new Error("target must remain untouched");
    },
  };

  const promise = startGame(project, options);
  await expect(promise).rejects.toBeInstanceOf(AuthoringError);
  await expect(promise).rejects.toMatchObject({
    diagnostics: expect.arrayContaining([
      expect.objectContaining({ owner: "save", code: "save.format.version" }),
      expect.objectContaining({ owner: "save", code: "save.state.invalid" }),
    ]),
  });
  expect(targetReads).toBe(0);
});
