import { Assets, Rectangle, Texture } from "pixi.js";

import { AuthoringError, type AuthoringDiagnostic } from "../public/diagnostics";
import type {
  EntityAppearance,
  GameProjectData,
  StaticAppearance,
  WalkingAppearance,
} from "../public/definitions";

export interface LoadedAssets {
  readonly textures: ReadonlyMap<string, Texture>;
  readonly walkFrames: ReadonlyMap<string, readonly Texture[]>;
}

export function assetUrl(url: URL | string): string {
  return url instanceof URL ? url.href : url;
}

/** Loads and validates every PNG before a Game Session becomes observable. */
export async function loadProjectAssets(data: GameProjectData): Promise<LoadedAssets> {
  const references = new Map<string, string[]>();
  const add = (url: URL | string, path: string) => {
    const resolved = assetUrl(url);
    references.set(resolved, [...(references.get(resolved) ?? []), path]);
  };

  for (const [sceneId, scene] of Object.entries(data.scenes)) {
    add(scene.background, `scenes.${sceneId}.background`);
    for (const [sceneryId, scenery] of Object.entries(scene.scenery ?? {})) {
      for (const [appearanceId, appearance] of Object.entries(scenery.appearances)) {
        if (appearance.kind === "static") {
          add(appearance.image, `scenes.${sceneId}.scenery.${sceneryId}.appearances.${appearanceId}`);
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
      add(appearance.image, `objects.${objectId}.appearances.${appearanceId}`);
    }
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
            family: "asset",
            path,
            message: `PNG asset '${url}' could not be loaded and decoded.`,
            cause,
          });
        }
      }
    }),
  );

  for (const [sceneId, scene] of Object.entries(data.scenes)) {
    const background = textures.get(assetUrl(scene.background));
    if (
      background &&
      (background.width !== data.logicalResolution.width ||
        background.height !== data.logicalResolution.height)
    ) {
      diagnostics.push({
        code: "asset.background.dimensions",
        family: "asset",
        path: `scenes.${sceneId}.background`,
        message: `Background is ${background.width}×${background.height}; expected ${data.logicalResolution.width}×${data.logicalResolution.height}.`,
        suggestion: "Export the PNG at the project's exact Logical Resolution.",
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
        family: "asset",
        path: `objects.${objectId}.inventoryAppearance`,
        message: `Inventory Appearance is ${icon.width}×${icon.height}; expected ${data.inventoryAppearanceSize}×${data.inventoryAppearanceSize}.`,
      });
    }
  }

  const walkFrames = new Map<string, readonly Texture[]>();
  for (const [characterId, character] of Object.entries(data.characters)) {
    for (const [appearanceId, appearance] of Object.entries(character.appearances)) {
      if (appearance.kind === "walking") {
        validateWalkingAppearance(
          appearance,
          `characters.${characterId}.appearances.${appearanceId}`,
          textures,
          walkFrames,
          diagnostics,
        );
      } else {
        validateAnchor(appearance, textures.get(assetUrl(appearance.image)), `characters.${characterId}.appearances.${appearanceId}`, diagnostics);
      }
    }
  }

  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return { textures, walkFrames };
}

function addAppearance(
  appearance: EntityAppearance,
  path: string,
  add: (url: URL | string, path: string) => void,
): void {
  if (appearance.kind === "static") {
    add(appearance.image, path);
  } else {
    add(appearance.side.image, `${path}.side`);
    add(appearance.front.image, `${path}.front`);
    add(appearance.back.image, `${path}.back`);
  }
}

function validateWalkingAppearance(
  appearance: WalkingAppearance,
  path: string,
  textures: ReadonlyMap<string, Texture>,
  walkFrames: Map<string, readonly Texture[]>,
  diagnostics: AuthoringDiagnostic[],
): void {
  const strips = [appearance.side, appearance.front, appearance.back] as const;
  const heights = new Set<number>();
  const frameCounts = new Set<number>();
  for (const [index, strip] of strips.entries()) {
    const direction = ["side", "front", "back"][index]!;
    const texture = textures.get(assetUrl(strip.image));
    if (!texture) continue;
    frameCounts.add(strip.frames);
    heights.add(texture.height);
    if (!Number.isInteger(strip.frames) || strip.frames <= 0 || texture.width % strip.frames !== 0) {
      diagnostics.push({
        code: "asset.walk-strip.frames",
        family: "asset",
        path: `${path}.${direction}`,
        message: "A walking strip width must divide into its positive integer frame count.",
      });
      continue;
    }
    const frameWidth = texture.width / strip.frames;
    const frames = Array.from({ length: strip.frames }, (_, frame) =>
      new Texture({
        source: texture.source,
        frame: new Rectangle(frame * frameWidth, 0, frameWidth, texture.height),
      }),
    );
    walkFrames.set(`${path}.${direction}`, frames);
    validateAnchor(
      { kind: "static", image: strip.image, visualAnchor: appearance.visualAnchor },
      { width: frameWidth, height: texture.height } as Texture,
      path,
      diagnostics,
    );
  }
  if (heights.size > 1 || frameCounts.size > 1) {
    diagnostics.push({
      code: "asset.walk-strip.consistency",
      family: "asset",
      path,
      message: "Side, front, and back walking strips must share height and frame count.",
    });
  }
}

function validateAnchor(
  appearance: StaticAppearance,
  texture: Pick<Texture, "width" | "height"> | undefined,
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  const anchor = appearance.visualAnchor;
  if (!anchor || !texture) return;
  if (anchor.x < 0 || anchor.y < 0 || anchor.x > texture.width || anchor.y > texture.height) {
    diagnostics.push({
      code: "asset.visual-anchor.bounds",
      family: "asset",
      path: `${path}.visualAnchor`,
      message: "Visual Anchor must lie inside its PNG frame.",
    });
  }
}

