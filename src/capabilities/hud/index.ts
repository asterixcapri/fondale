import { AuthoringError, type AuthoringDiagnostic } from "../game-project";

export type PassageDirection = "left" | "right" | "up" | "down" | "enter";

/** Declarative visual language for the stable Engine-owned overlay. */
export interface HUDTheme {
  readonly font: { readonly family: string; readonly source: URL | string };
  readonly colors: {
    readonly text: string;
    readonly preferred: string;
    readonly selected: string;
    readonly backing: string;
    readonly border: string;
    readonly inventoryWell: string;
  };
  readonly opacity: number;
  readonly maxSpeechWidth: number;
  readonly cursors: Readonly<Record<PassageDirection, URL | string>>;
  readonly speechColors: Readonly<Record<string, string>>;
}

/** Creates and freezes one complete local HUD Theme. */
export function defineHUDTheme(input: HUDTheme): HUDTheme {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (!input.font.family.trim() || !assetReference(input.font.source)) {
    diagnostics.push(themeDiagnostic("definition.hud-theme.font", "font", "HUD Theme font family and local source are required."));
  }
  for (const [name, color] of Object.entries(input.colors)) {
    if (!cssColor(color)) {
      diagnostics.push(themeDiagnostic("definition.hud-theme.color", `colors.${name}`, "HUD Theme colors must use a CSS hex color."));
    }
  }
  if (!Number.isFinite(input.opacity) || input.opacity < 0 || input.opacity > 1) {
    diagnostics.push(themeDiagnostic("definition.hud-theme.opacity", "opacity", "HUD Theme opacity must be between zero and one."));
  }
  if (!Number.isFinite(input.maxSpeechWidth) || input.maxSpeechWidth <= 0) {
    diagnostics.push(themeDiagnostic("definition.hud-theme.speech-width", "maxSpeechWidth", "Maximum speech width must be positive."));
  }
  for (const direction of ["left", "right", "up", "down", "enter"] as const) {
    if (!assetReference(input.cursors[direction])) {
      diagnostics.push(themeDiagnostic("definition.hud-theme.cursor", `cursors.${direction}`, `A '${direction}' cursor asset is required.`));
    }
  }
  for (const [character, color] of Object.entries(input.speechColors)) {
    if (!character.trim() || !cssColor(color)) {
      diagnostics.push(themeDiagnostic("definition.hud-theme.speech-color", `speechColors.${character}`, "Speech colors need a Character and CSS hex color."));
    }
  }
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return deepFreeze({
    ...input,
    font: { ...input.font, source: cloneAsset(input.font.source) },
    colors: { ...input.colors },
    cursors: {
      left: cloneAsset(input.cursors.left),
      right: cloneAsset(input.cursors.right),
      up: cloneAsset(input.cursors.up),
      down: cloneAsset(input.cursors.down),
      enter: cloneAsset(input.cursors.enter),
    },
    speechColors: { ...input.speechColors },
  });
}

function themeDiagnostic(code: string, path: string, message: string): AuthoringDiagnostic {
  return { code, family: "definition", owner: "hud", path, message };
}

function cssColor(value: string): boolean {
  return /^#[\da-f]{3}([\da-f]{3})?$/i.test(value);
}

function assetReference(value: URL | string | undefined): boolean {
  return value instanceof URL || typeof value === "string" && value.trim().length > 0;
}

function cloneAsset(value: URL | string): URL | string {
  return value instanceof URL ? new URL(value.href) : value;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !(value instanceof URL) && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
