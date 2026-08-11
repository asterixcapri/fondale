import { Assets, Rectangle, Texture } from "pixi.js";

import { AuthoringError, type AuthoringDiagnostic } from "../capabilities/game-project";
import {
  isImageAnimationFrames,
  type Appearance,
} from "../capabilities/animation";
import type {
  EntityAppearance,
  GameProjectData,
  Point,
  SequenceStep,
} from "../capabilities/game-project";

export interface LoadedAssets {
  readonly textures: ReadonlyMap<string, Texture>;
  readonly animationFrames: ReadonlyMap<string, readonly Texture[]>;
  readonly audio: ReadonlyMap<string, HTMLAudioElement>;
}

export function assetUrl(url: URL | string): string {
  return url instanceof URL ? url.href : url;
}

/** Loads and validates every visual and Line audio asset before a Game Session becomes observable. */
export async function loadProjectAssets(data: GameProjectData): Promise<LoadedAssets> {
  const references = new Map<string, string[]>();
  const audioReferences = new Map<string, string[]>();
  const add = (url: URL | string, path: string) => {
    const resolved = assetUrl(url);
    references.set(resolved, [...(references.get(resolved) ?? []), path]);
  };

  for (const [sceneId, scene] of Object.entries(data.scenes)) {
    add(scene.background, `scenes.${sceneId}.background`);
    for (const [sceneryId, scenery] of Object.entries(scene.scenery ?? {})) {
      for (const [appearanceId, appearance] of Object.entries(scenery.appearances)) {
        if ("animations" in appearance) {
          addAnimatedAppearance(appearance, `scenes.${sceneId}.scenery.${sceneryId}.appearances.${appearanceId}`, add);
        }
      }
    }
  }
  for (const [characterId, character] of Object.entries(data.characters)) {
    for (const [appearanceId, appearance] of Object.entries(character.appearances)) {
      addAppearance(appearance, `characters.${characterId}.appearances.${appearanceId}`, add);
    }
  }
  for (const [objectId, object] of Object.entries(data.objects)) {
    add(object.inventoryAppearance, `objects.${objectId}.inventoryAppearance`);
    for (const [appearanceId, appearance] of Object.entries(object.appearances)) {
      addAppearance(appearance, `objects.${objectId}.appearances.${appearanceId}`, add);
    }
  }
  for (const [direction, cursor] of Object.entries(data.hudTheme?.cursors ?? {})) {
    add(cursor, `hudTheme.cursors.${direction}`);
  }
  for (const [sequenceId, sequence] of Object.entries(data.sequences)) {
    collectSequenceAudio(sequence.steps, `sequences.${sequenceId}.steps`, audioReferences);
  }

  const textures = new Map<string, Texture>();
  const diagnostics: AuthoringDiagnostic[] = [];
  await Promise.all(
    [...references].map(async ([url, paths]) => {
      try {
        const texture = await Assets.load<Texture>(url);
        texture.source.scaleMode = "nearest";
        textures.set(url, texture);
      } catch (cause) {
        for (const path of paths) {
          diagnostics.push({
            code: "asset.load.failed",
            family: "asset", owner: "browser",
            path,
            message: `PNG asset '${url}' could not be loaded and decoded.`,
            cause,
          });
        }
      }
    }),
  );

  const audio = new Map<string, HTMLAudioElement>();
  await Promise.all([...audioReferences].map(([url, paths]) => new Promise<void>((resolve) => {
    const element = new Audio();
    element.preload = "metadata";
    element.addEventListener("loadedmetadata", () => {
      audio.set(url, element);
      resolve();
    }, { once: true });
    element.addEventListener("error", () => {
      for (const path of paths) {
        diagnostics.push({
          code: "asset.audio.load.failed",
          family: "asset", owner: "browser",
          path,
          message: `Audio asset '${url}' could not be loaded and decoded.`,
        });
      }
      resolve();
    }, { once: true });
    element.src = url;
    element.load();
  })));

  for (const [sceneId, scene] of Object.entries(data.scenes)) {
    const background = textures.get(assetUrl(scene.background));
    if (
      background &&
      (background.width !== scene.size.width ||
        background.height !== scene.size.height)
    ) {
      diagnostics.push({
        code: "asset.background.dimensions",
        family: "asset", owner: "browser",
        path: `scenes.${sceneId}.background`,
        message: `Background is ${background.width}×${background.height}; expected ${scene.size.width}×${scene.size.height}.`,
        suggestion: "Export the PNG at the Scene's exact Scene Size.",
      });
    }
  }
  for (const [objectId, object] of Object.entries(data.objects)) {
    const icon = textures.get(assetUrl(object.inventoryAppearance));
    if (
      icon &&
      data.inventoryAppearanceSize !== undefined &&
      (icon.width !== data.inventoryAppearanceSize || icon.height !== data.inventoryAppearanceSize)
    ) {
      diagnostics.push({
        code: "asset.inventory-appearance.dimensions",
        family: "asset", owner: "browser",
        path: `objects.${objectId}.inventoryAppearance`,
        message: `Inventory Appearance is ${icon.width}×${icon.height}; expected ${data.inventoryAppearanceSize}×${data.inventoryAppearanceSize}.`,
      });
    }
  }
  for (const [direction, cursor] of Object.entries(data.hudTheme?.cursors ?? {})) {
    const texture = textures.get(assetUrl(cursor));
    if (texture && (texture.width > 64 || texture.height > 64 || texture.width < 1 || texture.height < 1)) {
      diagnostics.push({
        code: "asset.cursor.dimensions",
        family: "asset", owner: "browser",
        path: `hudTheme.cursors.${direction}`,
        message: "A HUD cursor must fit within 64×64 pixels.",
      });
    }
  }

  if (data.hudTheme) {
    try {
      const source = assetUrl(data.hudTheme.font.source);
      const face = new FontFace(data.hudTheme.font.family, `url(${JSON.stringify(source)})`);
      await face.load();
      document.fonts.add(face);
    } catch (cause) {
      diagnostics.push({
        code: "asset.font.load.failed",
        family: "asset", owner: "browser",
        path: "hudTheme.font.source",
        message: "The HUD Theme font could not be loaded.",
        cause,
      });
    }
  }

  const animationFrames = new Map<string, readonly Texture[]>();
  for (const [characterId, character] of Object.entries(data.characters)) {
    for (const [appearanceId, appearance] of Object.entries(character.appearances)) {
      validateAnimatedAppearance(
        appearance,
        `characters.${characterId}.appearances.${appearanceId}`,
        textures,
        animationFrames,
        diagnostics,
      );
    }
  }

  for (const [sceneId, scene] of Object.entries(data.scenes)) {
    for (const [sceneryId, scenery] of Object.entries(scene.scenery ?? {})) {
      for (const [appearanceId, appearance] of Object.entries(scenery.appearances)) {
        if ("animations" in appearance) {
          validateAnimatedAppearance(
            appearance,
            `scenes.${sceneId}.scenery.${sceneryId}.appearances.${appearanceId}`,
            textures,
            animationFrames,
            diagnostics,
          );
        }
      }
    }
  }
  for (const [objectId, object] of Object.entries(data.objects)) {
    for (const [appearanceId, appearance] of Object.entries(object.appearances)) {
      validateAnimatedAppearance(
        appearance,
        `objects.${objectId}.appearances.${appearanceId}`,
        textures,
        animationFrames,
        diagnostics,
      );
    }
  }

  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return { textures, animationFrames, audio };
}

function collectSequenceAudio(
  steps: readonly SequenceStep[],
  path: string,
  references: Map<string, string[]>,
): void {
  steps.forEach((step, index) => {
    const stepPath = `${path}[${index}]`;
    if (step.type === "line" && step.audio) {
      const url = assetUrl(step.audio);
      references.set(url, [...(references.get(url) ?? []), `${stepPath}.audio`]);
    } else if (step.type === "choice") {
      step.alternatives.forEach((alternative, alternativeIndex) =>
        collectSequenceAudio(alternative.steps, `${stepPath}.alternatives[${alternativeIndex}].steps`, references),
      );
      collectSequenceAudio(step.fallback.steps, `${stepPath}.fallback.steps`, references);
    } else if (step.type === "branch") {
      step.cases.forEach((branch, branchIndex) =>
        collectSequenceAudio(branch.steps, `${stepPath}.cases[${branchIndex}].steps`, references),
      );
      collectSequenceAudio(step.fallback, `${stepPath}.fallback`, references);
    }
  });
}

function addAppearance(
  appearance: EntityAppearance,
  path: string,
  add: (url: URL | string, path: string) => void,
): void {
  addAnimatedAppearance(appearance, path, add);
}

function addAnimatedAppearance(
  appearance: Appearance,
  path: string,
  add: (url: URL | string, path: string) => void,
): void {
  for (const [animationId, animation] of Object.entries(appearance.animations)) {
    const animationPath = `${path}.animations.${animationId}.frames`;
    if (isImageAnimationFrames(animation.frames)) {
      animation.frames.forEach((image, index) => add(image, `${animationPath}[${index}]`));
    } else {
      for (const direction of ["side", "front", "back"] as const) {
        add(animation.frames[direction].image, `${animationPath}.${direction}`);
      }
    }
  }
}

function validateAnimatedAppearance(
  appearance: Appearance,
  path: string,
  textures: ReadonlyMap<string, Texture>,
  frames: Map<string, readonly Texture[]>,
  diagnostics: AuthoringDiagnostic[],
): void {
  for (const [animationId, animation] of Object.entries(appearance.animations)) {
    const animationPath = `${path}.animations.${animationId}`;
    if (isImageAnimationFrames(animation.frames)) {
      const animationTextures = animation.frames.flatMap((image) => {
        const texture = textures.get(assetUrl(image));
        return texture ? [texture] : [];
      });
      frames.set(animationPath, animationTextures);
      for (const texture of animationTextures) {
        validateAnchor(appearance.visualAnchor, texture, path, diagnostics);
      }
      continue;
    }
    const directionalFrameSizes: { direction: "side" | "front" | "back"; width: number; height: number }[] = [];
    for (const direction of ["side", "front", "back"] as const) {
      const strip = animation.frames[direction];
      const texture = textures.get(assetUrl(strip.image));
      if (!texture) continue;
      if (texture.width % strip.count !== 0) {
        diagnostics.push({
          code: "asset.animation-strip.frames",
          family: "asset", owner: "browser",
          path: `${animationPath}.frames.${direction}`,
          message: "An Animation strip width must divide into its frame count.",
        });
        continue;
      }
      const frameWidth = texture.width / strip.count;
      directionalFrameSizes.push({ direction, width: frameWidth, height: texture.height });
      frames.set(`${animationPath}.${direction}`, Array.from({ length: strip.count }, (_, frame) =>
        new Texture({ source: texture.source, frame: new Rectangle(frame * frameWidth, 0, frameWidth, texture.height) }),
      ));
      validateAnchor(appearance.visualAnchor, { width: frameWidth, height: texture.height } as Texture, path, diagnostics);
    }
    const expected = directionalFrameSizes[0];
    for (const size of directionalFrameSizes.slice(1)) {
      if (expected && size.height !== expected.height) {
        diagnostics.push({
          code: "asset.animation-strip.dimensions",
          family: "asset", owner: "browser",
          path: `${animationPath}.frames.${size.direction}`,
          message: "Directional Animation strips must produce frames with matching heights.",
        });
      }
    }
  }
}

function validateAnchor(
  anchor: Point | undefined,
  texture: Pick<Texture, "width" | "height"> | undefined,
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  if (!anchor || !texture) return;
  if (anchor.x < 0 || anchor.y < 0 || anchor.x > texture.width || anchor.y > texture.height) {
    diagnostics.push({
      code: "asset.visual-anchor.bounds",
      family: "asset", owner: "browser",
      path: `${path}.visualAnchor`,
      message: "Visual Anchor must lie inside its PNG frame.",
    });
  }
}
