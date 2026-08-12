import { expect, test } from "@playwright/test";

import { AuthoringError } from "./diagnostics";
import { defineCharacter, defineScene } from "../world";
import {
  defineGame,
  getBrowserProjectView,
  getGameSessionCompositionView,
  getSaveCompositionView,
} from ".";

const opening = defineScene({
  background: "opening.png",
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 320, y: 0 },
    { x: 320, y: 180 },
    { x: 0, y: 180 },
  ],
});

test("Game Project supplies immutable consumer-specific composition views", () => {
  const variables = { gateOpen: false };
  const scenes = { opening };
  const player = defineCharacter({
    initialScene: "opening",
    initialGroundPoint: { x: 160, y: 90 },
    initialFacing: "front",
    initialAppearance: "normal",
    appearances: {
      normal: {
        animations: {
          idle: { frames: ["idle.png"], framesPerSecond: 1, loop: true },
          walk: { frames: ["walk.png"], framesPerSecond: 1, loop: true },
        },
        roles: { default: "idle", walking: "walk" },
      },
    },
    movementSpeed: 60,
  });
  const project = defineGame({
    identity: "example.composed-project",
    version: "2",
    logicalResolution: { width: 320, height: 180 },
    scenes,
    characters: { player },
    playerCharacter: "player",
    variables,
    initialScene: "opening",
  });

  variables.gateOpen = true;
  delete (scenes as Partial<typeof scenes>).opening;

  const session = getGameSessionCompositionView(project);
  const browser = getBrowserProjectView(project);
  const save = getSaveCompositionView(project);

  expect(session.gameProject.variables).toEqual({ gateOpen: false });
  expect(session.world.scenes.opening).toBeDefined();
  expect(session.animation.playerCharacter).toBe("player");
  expect(browser.startup.identity).toBe("example.composed-project");
  expect(Object.keys(browser.presentation).sort()).toEqual(["identity", "logicalResolution"]);
  expect(browser.assets.scenes.opening).toBeDefined();
  expect(save.gameProject.version).toBe("2");
  expect([
    session,
    session.gameProject,
    session.world,
    browser,
    browser.startup,
    browser.assets,
    browser.presentation,
    save,
    save.gameProject,
    save.world,
    save.animation,
  ].every(Object.isFrozen)).toBe(true);
});

test("Game Project delegates every local definition to capability validators", () => {
  try {
    defineGame({
      identity: "example.invalid-local-definition",
      version: "1",
      logicalResolution: { width: 320, height: 180 },
      initialScene: "opening",
      scenes: {
        opening: {
          background: "opening.png",
          walkableRegion: [{ x: Number.NaN, y: 0 }, { x: 1, y: 1 }],
        },
      },
      characters: {
        player: {
          initialScene: "opening",
          initialGroundPoint: { x: 0, y: 0 },
          initialFacing: "front",
          initialAppearance: "missing",
          appearances: {},
          movementSpeed: 0,
        },
      },
      sequences: {
        opening: { steps: [{ type: "narration", text: "" }] },
      },
    });
    throw new Error("expected invalid local definitions to be rejected");
  } catch (error) {
    expect(error).toBeInstanceOf(AuthoringError);
    expect((error as AuthoringError).diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ owner: "world", path: "scenes.opening.walkableRegion[0]" }),
      expect.objectContaining({ owner: "world", path: "characters.player.movementSpeed" }),
      expect.objectContaining({ owner: "animation", path: "characters.player.initialAppearance" }),
      expect.objectContaining({ owner: "sequence", path: "sequences.opening.steps[0].text" }),
    ]));
  }
});
