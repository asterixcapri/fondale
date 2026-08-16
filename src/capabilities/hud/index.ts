import {
  type AuthoringDiagnostic,
  type LogicalResolution,
} from "../game-project";
import type { CameraPresentation } from "../camera";
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
import {
  sameWorldTarget,
  type Point,
  type WorldPresentation,
  type WorldTarget,
} from "../world";

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
  readonly narrative?: HUDNarrativeFacts;
  readonly world?: WorldPresentation;
  readonly camera?: CameraPresentation;
  readonly audioAvailable?: boolean;
  readonly speakerSilhouetteTops?: Readonly<Record<string, number>>;
  readonly sequenceActive?: boolean;
}

/** @internal Technical facts supplied by browser adapters when presenting HUD. */
export type HUDAdapterFacts = Pick<
  HUDPresentationContext,
  "audioAvailable" | "speakerSilhouetteTops"
>;

/** @internal Sequence or Game Session narrative facts prepared for HUD policy. */
export type HUDNarrativeFacts =
  | {
      readonly kind: "line";
      readonly source: "line" | "sequence" | "conversation" | "reflection";
      readonly character: string;
      readonly text: string;
      readonly audio?: URL | string;
    }
  | { readonly kind: "narration"; readonly text: string }
  | {
      readonly kind: "choice";
      readonly alternatives: readonly { readonly index: number; readonly text: string }[];
    };

/** @internal Player-owned HUD preferences; storage remains an adapter concern. */
export interface PlayerPreferences {
  readonly textSpeed: "slow" | "normal" | "fast";
  readonly speechText: boolean;
  readonly audioVolume: number;
}

/** @internal Lower-lane text placement prepared without DOM knowledge. */
export interface HUDLowerTextLayout {
  readonly kind: "lower";
  readonly maxWidth: number;
  readonly availableRight: number;
  readonly bottom: number;
}

/** @internal Narrative presentation prepared without DOM or PixiJS knowledge. */
export type HUDNarrativePresentation =
  | {
      readonly kind: "line";
      readonly text: string;
      readonly speaker: string;
      readonly audio?: URL | string;
      readonly visible: boolean;
      readonly color: string;
      readonly durationMilliseconds: number;
      readonly layout: {
        readonly kind: "speech";
        readonly anchor: Point;
        readonly maxWidth: number;
        readonly safeArea: { readonly left: number; readonly top: number; readonly right: number; readonly bottom: number };
      } | null;
      readonly focus: "frame";
    }
  | {
      readonly kind: "narration";
      readonly text: string;
      readonly visible: boolean;
      readonly color: string;
      readonly durationMilliseconds: number;
      readonly layout: HUDLowerTextLayout;
      readonly focus: "frame";
    }
  | {
      readonly kind: "choice";
      readonly color: string;
      readonly alternatives: readonly {
        readonly index: number;
        readonly number: number;
        readonly label: string;
      }[];
      readonly focus: "first-choice";
    };

/** @internal Transient Command Response presentation owned by HUD. */
export interface HUDCommandResponsePresentation {
  readonly id: number;
  readonly text: string;
  readonly visible: boolean;
  readonly durationMilliseconds: number;
  readonly color: string;
  readonly layout: HUDLowerTextLayout;
}

/** @internal */
export type HUDModalKind = "options" | "help";

/** @internal System overlay presentation independent of DOM and localStorage. */
export interface HUDSystemPresentation {
  readonly blocksWorldInput: boolean;
  readonly preferences: PlayerPreferences;
  readonly modal:
    | null
    | {
        readonly kind: "options";
        readonly title: "Options";
        readonly focus: "first-control";
        readonly audioAvailable: boolean;
      }
    | {
        readonly kind: "help";
        readonly title: "Help";
        readonly focus: "first-control";
        readonly text: string;
      };
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
  readonly narrative: HUDNarrativePresentation | null;
  readonly commandResponse: HUDCommandResponsePresentation | null;
  readonly system: HUDSystemPresentation;
  readonly sequenceActive: boolean;
}

/** @internal */
export type HUDInput =
  | { readonly type: "open-inventory" }
  | { readonly type: "close-inventory" }
  | { readonly type: "toggle-inventory" }
  | { readonly type: "change-inventory-page"; readonly amount: number }
  | { readonly type: "set-nouns-revealed"; readonly revealed: boolean }
  | { readonly type: "advance-activity" }
  | { readonly type: "choose"; readonly alternative: number }
  | { readonly type: "skip-sequence" }
  | { readonly type: "dismiss-response" }
  | { readonly type: "restore-preferences"; readonly value: unknown }
  | { readonly type: "change-preferences"; readonly change: Partial<PlayerPreferences> }
  | { readonly type: "open-modal"; readonly modal: HUDModalKind }
  | { readonly type: "close-modal" }
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
  readonly focus: "inventory" | "frame" | "modal" | "restore" | null;
  readonly interaction?: InteractionInput;
  readonly session?:
    | { readonly type: "advance-line" }
    | { readonly type: "advance-conversation-line" }
    | { readonly type: "advance-reflection-line" }
    | { readonly type: "advance-sequence" }
    | { readonly type: "choose"; readonly alternative: number }
    | { readonly type: "skip-sequence" };
  readonly preferences?: PlayerPreferences;
}

/** @internal Contextual HUD policy independent of DOM, PixiJS and browser focus APIs. */
export interface HUD {
  presentation(context: HUDPresentationContext): HUDPresentation;
  input(input: HUDInput, context: HUDPresentationContext): HUDInputResult;
  notify(notification: { readonly type: "command-response"; readonly text: string }): void;
}

/** @internal Authored settings needed to derive HUD presentation and intentions. */
export interface HUDProjectView {
  readonly commandLexicon?: CommandLexicon;
  readonly inventoryPageSize?: number;
  readonly logicalResolution?: LogicalResolution;
  readonly playerCharacter?: string;
  readonly theme?: HUDTheme;
}

/** Creates the contextual HUD capability over narrow World and Interaction views. */
export function createHUD(input: HUDProjectView): HUD {
  const pageSize = input.inventoryPageSize ?? 8;
  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new RangeError("Inventory page size must be a positive integer.");
  }
  let inventoryOpen = false;
  let inventoryPage = 0;
  let previousInventoryCount = 0;
  let nounsRevealed = false;
  let preferences: PlayerPreferences = {
    textSpeed: "normal",
    speechText: true,
    audioVolume: 1,
  };
  let modal: HUDModalKind | null = null;
  let responseText: string | null = null;
  let responseId = 0;

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
    if (context.narrative) responseText = null;
    const pageCount = Math.max(1, Math.ceil(context.inventory.entries.length / pageSize));
    const entries = context.inventory.entries
      .slice(inventoryPage * pageSize, inventoryPage * pageSize + pageSize)
      .map(inventoryEntryPresentation);
    const narrative = narrativePresentation(context, input, preferences, inventoryOpen);
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
      narrative,
      commandResponse: commandResponsePresentation(
        responseText,
        responseId,
        context,
        input,
        preferences,
        inventoryOpen,
      ),
      system: {
        blocksWorldInput: modal !== null || inventoryOpen,
        preferences: { ...preferences },
        modal: modalPresentation(modal, context),
      },
      sequenceActive: context.sequenceActive ?? false,
    });
  };

  return {
    presentation,
    notify(notification) {
      if (notification.type === "command-response") {
        responseText = notification.text;
        responseId += 1;
      }
    },
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
      if (hudInput.type === "advance-activity") {
        const narrative = context.narrative;
        if (narrative?.kind === "line") {
          return {
            focus: null,
            session: {
              type: narrative.source === "line"
                ? "advance-line"
                : narrative.source === "conversation"
                  ? "advance-conversation-line"
                  : narrative.source === "reflection"
                    ? "advance-reflection-line"
                    : "advance-sequence",
            },
          };
        }
        return narrative?.kind === "narration"
          ? { focus: null, session: { type: "advance-sequence" } }
          : { focus: null };
      }
      if (hudInput.type === "choose") {
        const eligible = context.narrative?.kind === "choice" &&
          context.narrative.alternatives.some(({ index }) => index === hudInput.alternative);
        return eligible
          ? { focus: null, session: { type: "choose", alternative: hudInput.alternative } }
          : { focus: null };
      }
      if (hudInput.type === "skip-sequence") {
        return context.sequenceActive
          ? { focus: null, session: { type: "skip-sequence" } }
          : { focus: null };
      }
      if (hudInput.type === "dismiss-response") {
        const dismissed = responseText !== null;
        responseText = null;
        return { focus: dismissed ? "frame" : null };
      }
      if (hudInput.type === "restore-preferences") {
        preferences = normalizedPreferences(hudInput.value);
        return { focus: null, preferences: { ...preferences } };
      }
      if (hudInput.type === "change-preferences") {
        preferences = normalizedPreferences({ ...preferences, ...hudInput.change });
        return { focus: null, preferences: { ...preferences } };
      }
      if (hudInput.type === "open-modal") {
        inventoryOpen = false;
        modal = hudInput.modal;
        return { focus: "modal" };
      }
      if (hudInput.type === "close-modal") {
        modal = null;
        return { focus: "restore" };
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

function commandResponsePresentation(
  text: string | null,
  id: number,
  context: HUDPresentationContext,
  input: { readonly logicalResolution?: LogicalResolution; readonly theme?: HUDTheme },
  preferences: PlayerPreferences,
  inventoryOpen: boolean,
): HUDCommandResponsePresentation | null {
  if (text === null || context.narrative) return null;
  const resolution = input.logicalResolution ?? { width: 426, height: 240 };
  const maxWidth = input.theme?.maxSpeechWidth ?? 150;
  return {
    id,
    text,
    visible: preferences.speechText,
    durationMilliseconds: textDuration(text, preferences.textSpeed),
    color: "#ffffff",
    layout: {
      kind: "lower",
      maxWidth,
      availableRight: inventoryOpen ? resolution.width - 170 : resolution.width,
      bottom: 4,
    },
  };
}

function modalPresentation(
  modal: HUDModalKind | null,
  context: HUDPresentationContext,
): HUDSystemPresentation["modal"] {
  if (modal === null) return null;
  if (modal === "options") {
    return { kind: "options", title: "Options", focus: "first-control", audioAvailable: context.audioAvailable ?? false };
  }
  if (modal === "help") {
    return {
      kind: "help",
      title: "Help",
      focus: "first-control",
      text: "Mouse: left main action, right secondary action when shown, middle skip Line or Command Response. Bag or I opens Inventory. Tab reveals Nouns. 1–6 selects a Choice. F5 Options. Period skips a Line or Command Response. Escape closes Inventory, deselects an Object, or skips a skippable Sequence.",
    };
  }
  return null;
}

function normalizedPreferences(value: unknown): PlayerPreferences {
  if (!value || typeof value !== "object") {
    return { textSpeed: "normal", speechText: true, audioVolume: 1 };
  }
  const candidate = value as Partial<PlayerPreferences>;
  return {
    textSpeed: candidate.textSpeed === "slow" || candidate.textSpeed === "fast"
      ? candidate.textSpeed
      : "normal",
    speechText: typeof candidate.speechText === "boolean" ? candidate.speechText : true,
    audioVolume: typeof candidate.audioVolume === "number" &&
        Number.isFinite(candidate.audioVolume) && candidate.audioVolume >= 0 && candidate.audioVolume <= 1
      ? candidate.audioVolume
      : 1,
  };
}

function narrativePresentation(
  context: HUDPresentationContext,
  input: {
    readonly logicalResolution?: LogicalResolution;
    readonly playerCharacter?: string;
    readonly theme?: HUDTheme;
  },
  preferences: PlayerPreferences,
  inventoryOpen: boolean,
): HUDNarrativePresentation | null {
  const narrative = context.narrative;
  if (!narrative) return null;
  const resolution = input.logicalResolution ?? { width: 426, height: 240 };
  const maxSpeechWidth = input.theme?.maxSpeechWidth ?? 150;
  if (narrative.kind === "line") {
    const character = context.world?.characters.find(({ id }) => id === narrative.character);
    const anchor = character && context.camera
      ? {
          x: character.groundPoint.x - context.camera.origin.x,
          y: context.speakerSilhouetteTops?.[narrative.character] ??
            character.groundPoint.y - context.camera.origin.y - 24 * character.scale,
        }
      : undefined;
    return {
      kind: "line",
      text: narrative.text,
      speaker: narrative.character,
      ...(narrative.audio ? { audio: cloneAsset(narrative.audio) } : {}),
      visible: preferences.speechText && anchor !== undefined,
      color: input.theme?.speechColors[narrative.character] ??
        input.theme?.colors.text ?? "#f4dfb4",
      durationMilliseconds: textDuration(narrative.text, preferences.textSpeed),
      layout: anchor
        ? {
            kind: "speech",
            anchor,
            maxWidth: maxSpeechWidth,
            safeArea: { left: 2, top: 4, right: resolution.width - 2, bottom: resolution.height - 4 },
          }
        : null,
      focus: "frame",
    };
  }
  if (narrative.kind === "narration") {
    const width = Math.min(resolution.width - 40, Math.round(maxSpeechWidth * 1.6));
    return {
      kind: "narration",
      text: narrative.text,
      visible: preferences.speechText,
      color: input.theme?.colors.text ?? "#f4dfb4",
      durationMilliseconds: textDuration(narrative.text, preferences.textSpeed),
      layout: {
        kind: "lower",
        maxWidth: width,
        availableRight: inventoryOpen ? resolution.width - 170 : resolution.width,
        bottom: 4,
      },
      focus: "frame",
    };
  }
  return {
    kind: "choice",
    color: (input.playerCharacter
      ? input.theme?.speechColors[input.playerCharacter]
      : undefined) ?? input.theme?.colors.text ?? "#f4dfb4",
    alternatives: narrative.alternatives.map((alternative, index) => ({
      index: alternative.index,
      number: index + 1,
      label: `${index + 1}. ${alternative.text}`,
    })),
    focus: "first-choice",
  };
}

function textDuration(text: string, speed: PlayerPreferences["textSpeed"]): number {
  const millisecondsPerCharacter = { slow: 130, normal: 80, fast: 25 }[speed];
  const minimumDuration = { slow: 7_000, normal: 4_000, fast: 600 }[speed];
  return Math.max(minimumDuration, text.length * millisecondsPerCharacter);
}

/** Reports every local HUD Theme Authoring Diagnostic without a Game Project. */
export function validateHUDTheme(
  input: HUDTheme,
  path = "",
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (!input.font.family.trim() || !assetReference(input.font.source)) {
    diagnostics.push(themeDiagnostic("definition.hud-theme.font", childPath(path, "font"), "HUD Theme font family and local source are required."));
  }
  for (const [name, color] of Object.entries(input.colors)) {
    if (!cssColor(color)) {
      diagnostics.push(themeDiagnostic("definition.hud-theme.color", childPath(path, `colors.${name}`), "HUD Theme colors must use a CSS hex color."));
    }
  }
  if (!Number.isFinite(input.opacity) || input.opacity < 0 || input.opacity > 1) {
    diagnostics.push(themeDiagnostic("definition.hud-theme.opacity", childPath(path, "opacity"), "HUD Theme opacity must be between zero and one."));
  }
  if (!Number.isFinite(input.maxSpeechWidth) || input.maxSpeechWidth <= 0) {
    diagnostics.push(themeDiagnostic("definition.hud-theme.speech-width", childPath(path, "maxSpeechWidth"), "Maximum speech width must be positive."));
  }
  for (const direction of ["left", "right", "up", "down", "enter"] as const) {
    if (!assetReference(input.cursors[direction])) {
      diagnostics.push(themeDiagnostic("definition.hud-theme.cursor", childPath(path, `cursors.${direction}`), `A '${direction}' cursor asset is required.`));
    }
  }
  for (const [character, color] of Object.entries(input.speechColors)) {
    if (!character.trim() || !cssColor(color)) {
      diagnostics.push(themeDiagnostic("definition.hud-theme.speech-color", childPath(path, `speechColors.${character}`), "Speech colors need a Character and CSS hex color."));
    }
  }
  return diagnostics;
}


/** Validates HUD Theme references that can be resolved only during Game Project composition. */
export function validateHUDProjectReferences(
  theme: HUDTheme | undefined,
  characters: ReadonlySet<string>,
): readonly AuthoringDiagnostic[] {
  return Object.keys(theme?.speechColors ?? {}).flatMap((character) =>
    characters.has(character)
      ? []
      : [{
          code: "reference.character",
          family: "reference" as const,
          owner: "hud" as const,
          path: `hudTheme.speechColors.${character}`,
          message: `Character '${character}' does not exist.`,
        }],
  );
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

function childPath(path: string, child: string): string {
  return path ? `${path}.${child}` : child;
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
