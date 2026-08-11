import { AuthoringError, type AuthoringDiagnostic } from "../game-project";
import {
  conditionalOptionalValue,
  conditionalValue,
  type CommandLexicon,
  type NounDefinition,
  type InteractionInput,
  type InteractionStateView,
  type InventoryPresentation,
  type InventoryPresentationEntry,
  type Verb,
} from "../interaction";
import { sameWorldTarget, type Point, type WorldTarget } from "../world";

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

/** @internal Immutable Game State facts used to prepare the contextual HUD. */
export type HUDStateView = InteractionStateView;

/** @internal Narrow World and Interaction facts for one available Noun. */
export interface HUDNounView {
  readonly target: WorldTarget;
  readonly area: readonly Point[];
  readonly noun: NounDefinition;
  readonly direction?: PassageDirection;
}

/** @internal Inputs needed to derive one complete contextual HUD presentation. */
export interface HUDPresentationContext {
  readonly state: HUDStateView;
  readonly nouns: readonly HUDNounView[];
  readonly inventory: InventoryPresentation;
  readonly inventorySuspended?: boolean;
}

/** @internal */
export interface HUDActionPresentation {
  readonly text: string;
}

/** @internal */
export interface HUDNounPresentation {
  readonly target: WorldTarget;
  readonly area: readonly Point[];
  readonly label: string;
  readonly direction?: PassageDirection;
  readonly primary: HUDActionPresentation;
  readonly secondary?: HUDActionPresentation;
}

/** @internal */
export interface HUDInventoryEntryPresentation extends InventoryPresentationEntry {
  readonly primary: HUDActionPresentation;
  readonly secondary?: HUDActionPresentation;
}

/** @internal */
export interface HUDInventoryPresentation {
  readonly keyboardShortcutAvailable: boolean;
  readonly fillEmptySlots: boolean;
  readonly triggerVisible: boolean;
  readonly open: boolean;
  readonly page: number;
  readonly pageCount: number;
  readonly canGoPrevious: boolean;
  readonly canGoNext: boolean;
  readonly emptySlots: number;
  readonly entries: readonly HUDInventoryEntryPresentation[];
}

/** @internal */
export interface HUDPresentation {
  readonly nouns: readonly HUDNounPresentation[];
  readonly nounsRevealed: boolean;
  readonly nounRevealControl: "button" | "keyboard";
  readonly inventory: HUDInventoryPresentation;
}

/** @internal */
export type HUDInput =
  | { readonly type: "open-inventory" }
  | { readonly type: "close-inventory" }
  | { readonly type: "toggle-inventory" }
  | { readonly type: "change-inventory-page"; readonly amount: number }
  | { readonly type: "set-nouns-revealed"; readonly revealed: boolean }
  | {
      readonly type: "activate-noun";
      readonly target: WorldTarget;
      readonly action: "primary" | "secondary";
    }
  | {
      readonly type: "activate-inventory";
      readonly object: string;
      readonly action: "primary" | "secondary";
    };

/** @internal */
export interface HUDInputResult {
  readonly focus: "inventory" | "frame" | null;
  readonly interaction?: InteractionInput;
}

/** @internal Contextual HUD policy independent of DOM, PixiJS and browser focus APIs. */
export interface HUD {
  presentation(context: HUDPresentationContext): HUDPresentation;
  input(input: HUDInput, context: HUDPresentationContext): HUDInputResult;
}

/** Creates the contextual HUD capability over narrow World and Interaction views. */
export function createHUD(input: {
  readonly commandLexicon?: CommandLexicon;
  readonly inventoryPageSize?: number;
}): HUD {
  const pageSize = input.inventoryPageSize ?? 8;
  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new RangeError("Inventory page size must be a positive integer.");
  }
  let inventoryOpen = false;
  let inventoryPage = 0;
  let previousInventoryCount = 0;
  let nounsRevealed = false;

  const syncInventory = (context: HUDPresentationContext): void => {
    const count = context.inventory.entries.length;
    if (count > previousInventoryCount) inventoryPage = Math.floor((count - 1) / pageSize);
    previousInventoryCount = count;
    inventoryPage = Math.min(inventoryPage, maximumInventoryPage(count, pageSize));
    if (context.inventorySuspended) inventoryOpen = false;
  };

  const nounPresentation = (
    noun: HUDNounView,
    context: HUDPresentationContext,
  ): HUDNounPresentation => {
    const firstNoun = selectedInventoryEntry(context);
    const label = conditionalValue(noun.noun.labels, context.state).text;
    const preferredVerb = conditionalValue(noun.noun.preferredVerbs, context.state).verb;
    const primaryVerb = firstNoun
      ? conditionalOptionalValue(noun.noun.objectVerbs, context.state)?.verb ?? "use"
      : preferredVerb;
    const secondaryVerb = firstNoun
      ? preferredVerb
      : conditionalOptionalValue(noun.noun.secondaryVerbs, context.state)?.verb;
    const primary = commandPhrase(input.commandLexicon, primaryVerb, label, firstNoun?.label);
    const secondary = secondaryVerb && secondaryVerb !== primaryVerb
      ? commandPhrase(input.commandLexicon, secondaryVerb, label)
      : undefined;
    return deepFreeze({
      target: { ...noun.target },
      area: noun.area.map((point) => ({ ...point })),
      label,
      ...(noun.direction ? { direction: noun.direction } : {}),
      primary: { text: primary },
      ...(secondary ? { secondary: { text: secondary } } : {}),
    });
  };

  const inventoryEntryPresentation = (
    entry: InventoryPresentationEntry,
  ): HUDInventoryEntryPresentation => {
    const pattern = entry.selected
      ? input.commandLexicon?.inventory.deselect
      : input.commandLexicon?.inventory.select;
    const primary = pattern?.replace("{noun}", entry.label) ?? entry.label;
    const secondary = entry.secondaryVerb
      ? commandPhrase(input.commandLexicon, entry.secondaryVerb, entry.label)
      : undefined;
    return deepFreeze({
      ...entry,
      primary: { text: primary },
      ...(secondary ? { secondary: { text: secondary } } : {}),
    });
  };

  const presentation = (context: HUDPresentationContext): HUDPresentation => {
    syncInventory(context);
    const pageCount = Math.max(1, Math.ceil(context.inventory.entries.length / pageSize));
    const entries = context.inventory.entries
      .slice(inventoryPage * pageSize, inventoryPage * pageSize + pageSize)
      .map(inventoryEntryPresentation);
    return deepFreeze({
      nouns: context.nouns.map((noun) => nounPresentation(noun, context)),
      nounsRevealed,
      nounRevealControl: input.commandLexicon ? "keyboard" : "button",
      inventory: {
        keyboardShortcutAvailable: input.commandLexicon !== undefined,
        fillEmptySlots: input.commandLexicon !== undefined,
        triggerVisible: !context.inventorySuspended,
        open: inventoryOpen,
        page: inventoryPage,
        pageCount,
        canGoPrevious: inventoryPage > 0,
        canGoNext: inventoryPage < pageCount - 1,
        emptySlots: pageSize - entries.length,
        entries,
      },
    });
  };

  return {
    presentation,
    input(hudInput, context) {
      syncInventory(context);
      if (hudInput.type === "open-inventory") {
        inventoryOpen = true;
        return { focus: "inventory" };
      }
      if (hudInput.type === "close-inventory") {
        inventoryOpen = false;
        return { focus: "frame" };
      }
      if (hudInput.type === "toggle-inventory") {
        inventoryOpen = !inventoryOpen;
        return { focus: inventoryOpen ? "inventory" : "frame" };
      }
      if (hudInput.type === "change-inventory-page") {
        inventoryPage = Math.max(0, Math.min(
          maximumInventoryPage(context.inventory.entries.length, pageSize),
          inventoryPage + Math.sign(hudInput.amount),
        ));
        return { focus: null };
      }
      if (hudInput.type === "set-nouns-revealed") {
        nounsRevealed = hudInput.revealed;
        return { focus: null };
      }
      if (hudInput.type === "activate-inventory") {
        const entry = context.inventory.entries.find(({ object }) => object === hudInput.object);
        if (!entry || hudInput.action === "secondary" && !entry.secondaryVerb) return { focus: null };
        if (hudInput.action === "primary") inventoryOpen = false;
        return {
          focus: hudInput.action === "primary" ? "frame" : null,
          interaction: {
            type: "contextual-object",
            object: hudInput.object,
            action: hudInput.action,
          },
        };
      }
      const noun = context.nouns.find(({ target }) => sameWorldTarget(target, hudInput.target));
      if (!noun) return { focus: null };
      const prepared = nounPresentation(noun, context);
      if (hudInput.action === "secondary" && !prepared.secondary) return { focus: null };
      return {
        focus: null,
        interaction: noun.target.kind === "hotspot"
          ? { type: "contextual-hotspot", hotspot: noun.target.index, action: hudInput.action }
          : { type: "contextual-passage", passage: noun.target.index, action: hudInput.action },
      };
    },
  };
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

function selectedInventoryEntry(
  context: HUDPresentationContext,
): InventoryPresentationEntry | undefined {
  const object = context.state.command.firstNoun?.object;
  return object
    ? context.inventory.entries.find((entry) => entry.object === object)
    : undefined;
}

function commandPhrase(
  lexicon: CommandLexicon | undefined,
  verb: Verb | undefined,
  noun: string,
  firstNoun?: string,
): string {
  if (!verb || verb === "walk-to") return noun;
  const label = lexicon?.verbs[verb];
  if (!label) return noun;
  if (firstNoun && (verb === "give" || verb === "use")) {
    return lexicon.patterns[verb]
      .replace("{verb}", label)
      .replace("{first}", firstNoun)
      .replace("{second}", noun);
  }
  return lexicon.patterns.unary
    .replace("{verb}", label)
    .replace("{noun}", noun);
}

function maximumInventoryPage(count: number, pageSize: number): number {
  return Math.max(0, Math.ceil(count / pageSize) - 1);
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
