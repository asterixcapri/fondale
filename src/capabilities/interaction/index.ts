import type { GameOperation } from "../game-project";
import { AuthoringError, type AuthoringDiagnostic } from "../game-project";
import type { Line } from "../sequence";
import type {
  Facing,
  HotspotDefinition,
  HotspotTarget,
  ObjectState,
  Point,
  WorldTarget,
} from "../world";
import { conditionMatchesState } from "./state-queries";
export { conditionMatchesState };

/** The semantic actions available to authored Commands. */
export const commandVerbs = [
  "open",
  "pick-up",
  "push",
  "close",
  "look-at",
  "pull",
  "give",
  "talk-to",
  "use",
] as const;

export type CommandVerb = (typeof commandVerbs)[number];
export type Verb = CommandVerb | "walk-to";

/** A proposition over the latest committed state used by Interaction policy. */
export type InteractionCondition =
  | { readonly variable: string; readonly equals: boolean }
  | { readonly hasObject: string };

/** Authored consequences that change Inventory membership or Object lifecycle. */
export type InventoryOperation =
  | { readonly type: "collect-target-object" }
  | {
      readonly type: "place-selected-object";
      readonly groundPoint: Point;
      readonly appearance?: string;
    }
  | {
      readonly type: "place-object";
      readonly object: string;
      readonly scene: string;
      readonly groundPoint: Point;
      readonly appearance?: string;
    }
  | { readonly type: "consume-selected-object" };

/** One state-dependent player-facing name, with an unconditional final variant. */
export interface NounLabel {
  readonly text: string;
  readonly when?: InteractionCondition;
}

/** One state-dependent Preferred Verb, with an unconditional final variant. */
export interface PreferredVerbCase {
  readonly verb: Verb;
  readonly when?: InteractionCondition;
}

/** One state-dependent Verb for a selected Inventory Object. */
export interface SelectedObjectVerbCase {
  readonly verb: "give" | "use";
  readonly when?: InteractionCondition;
}

/** Neutral explanatory text produced by a resolved Command. */
export interface CommandResponse {
  readonly text: string;
}

/** An ordered specific resolution with at most one textual outcome. */
export interface CommandCase {
  readonly verb: CommandVerb;
  readonly firstNoun?: string;
  readonly when?: InteractionCondition;
  readonly line?: Line;
  readonly response?: CommandResponse;
  readonly operations?: readonly GameOperation[];
  readonly sequence?: string;
}

/** A local guaranteed resolution used after all specific Command Cases. */
export interface CommandFallback {
  readonly response: CommandResponse;
  readonly operations?: readonly GameOperation[];
  readonly sequence?: string;
}

/** The common interaction definition used by every world and Inventory Noun. */
export interface NounDefinition {
  readonly labels: readonly NounLabel[];
  readonly preferredVerbs: readonly PreferredVerbCase[];
  readonly secondaryVerbs?: readonly PreferredVerbCase[];
  readonly objectVerbs?: readonly SelectedObjectVerbCase[];
  readonly cases: readonly CommandCase[];
  readonly fallbacks?: Readonly<Partial<Record<CommandVerb, CommandFallback>>>;
}

/** Creates and freezes one locally valid Noun Definition. */
export function defineNoun(input: NounDefinition): NounDefinition {
  const diagnostics: AuthoringDiagnostic[] = [];
  validateConditionalFallback(input.labels, "labels", "Noun Label", diagnostics);
  validateConditionalFallback(
    input.preferredVerbs,
    "preferredVerbs",
    "Preferred Verb",
    diagnostics,
  );
  if (input.secondaryVerbs) {
    validateConditionalFallback(
      input.secondaryVerbs,
      "secondaryVerbs",
      "Secondary Verb",
      diagnostics,
    );
  }
  if (input.objectVerbs) {
    validateConditionalFallback(
      input.objectVerbs,
      "objectVerbs",
      "Selected Object Verb",
      diagnostics,
    );
  }
  input.labels.forEach((label, index) => {
    if (!label.text.trim()) {
      diagnostics.push({
        code: "definition.noun-label.text",
        family: "definition", owner: "interaction",
        path: `labels[${index}].text`,
        message: "A Noun Label cannot be empty.",
      });
    }
  });
  input.cases.forEach((candidate, index) => {
    if (candidate.verb === "give" && candidate.firstNoun === undefined) {
      diagnostics.push({
        code: "definition.command-case.arity",
        family: "definition", owner: "interaction",
        path: `cases[${index}].firstNoun`,
        message: "Give Command Cases always require a first Noun.",
      });
    } else if (candidate.verb !== "give" && candidate.verb !== "use" && candidate.firstNoun !== undefined) {
      diagnostics.push({
        code: "definition.command-case.arity",
        family: "definition", owner: "interaction",
        path: `cases[${index}].firstNoun`,
        message: `The '${candidate.verb}' Verb is unary and cannot declare a first Noun.`,
      });
    }
    const sequenceOutcomes = (candidate.sequence ? 1 : 0) +
      (candidate.operations?.filter(({ type }) => type === "start-sequence").length ?? 0);
    const outcomeCount = Number(candidate.line !== undefined) +
      Number(candidate.response !== undefined) + sequenceOutcomes;
    if (outcomeCount > 1) {
      diagnostics.push({
        code: "definition.command-case.textual-outcome",
        family: "definition", owner: "interaction",
        path: `cases[${index}]`,
        message: "A Command Case can declare only one textual outcome: Line, Command Response, or Sequence.",
      });
    }
    if (!candidate.line && !candidate.response && !(candidate.operations?.length) && !candidate.sequence) {
      diagnostics.push({
        code: "definition.command-case.empty",
        family: "definition", owner: "interaction",
        path: `cases[${index}]`,
        message: "A Command Case must produce a Line, Command Response, Game Operation, or Sequence.",
      });
    }
    if (
      !candidate.line &&
      !candidate.response &&
      !candidate.sequence &&
      candidate.operations?.some(({ type }) =>
        type === "collect-target-object" ||
        type === "place-selected-object" ||
        type === "consume-selected-object"
      )
    ) {
      diagnostics.push({
        code: "definition.command-case.object-feedback",
        family: "definition", owner: "interaction",
        path: `cases[${index}]`,
        message: "A Command Case that moves or consumes an Object must provide a Line, Command Response, or Sequence.",
      });
    }
    if (candidate.line && !candidate.line.character.trim()) {
      diagnostics.push({
        code: "definition.line.character",
        family: "definition", owner: "interaction",
        path: `cases[${index}].line.character`,
        message: "A Line requires a Character.",
      });
    }
    if (candidate.line && !candidate.line.text.trim()) {
      diagnostics.push({
        code: "definition.line.text",
        family: "definition", owner: "interaction",
        path: `cases[${index}].line.text`,
        message: "A Line cannot be empty.",
      });
    }
    validateCommandResponse(candidate.response, `cases[${index}].response`, diagnostics);
  });
  for (const [verb, fallback] of Object.entries(input.fallbacks ?? {})) {
    validateCommandResponse(fallback.response, `fallbacks.${verb}.response`, diagnostics);
  }
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  const cloned = structuredClone(input);
  return deepFreeze({
    ...cloned,
    cases: cloned.cases.map((candidate, index) => {
      const sourceLine = input.cases[index]?.line;
      return sourceLine
        ? {
            ...candidate,
            line: {
              ...sourceLine,
              ...(sourceLine.audio instanceof URL ? { audio: new URL(sourceLine.audio.href) } : {}),
            },
          }
        : candidate;
    }),
  });
}

/** @internal Collects semantic Command Response diagnostics for composed definitions. */
export function validateCommandResponse(
  response: CommandResponse | undefined,
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  if (!response) return;
  if (!response.text.trim()) {
    diagnostics.push({
      code: "definition.command-response.text",
      family: "definition", owner: "interaction",
      path: `${path}.text`,
      message: "A Command Response cannot be empty.",
    });
  }
  if ("speaker" in response || "presentation" in response) {
    diagnostics.push({
      code: "definition.command-response.semantic",
      family: "definition", owner: "interaction",
      path,
      message: "A Command Response cannot declare a speaker or presentation.",
    });
  }
}

/** @internal The named definitions needed to validate Interaction-owned references. */
export interface InteractionReferenceView {
  readonly variables: ReadonlySet<string>;
  readonly objects: ReadonlySet<string>;
  readonly sequences: ReadonlySet<string>;
  readonly commandFallbacks?: Readonly<Partial<Record<CommandVerb, CommandResponse>>>;
}

/** @internal The composed definitions needed for Interaction-wide invariants. */
export interface InteractionCompositionView {
  readonly commandLexicon?: CommandLexicon;
  readonly scenes: Readonly<Record<string, {
    readonly scenery?: Readonly<Record<string, { readonly noun?: NounDefinition }>>;
    readonly hotspots?: readonly HotspotDefinition[];
    readonly passages?: readonly { readonly noun: NounDefinition }[];
  }>>;
  readonly characters: Readonly<Record<string, { readonly noun?: NounDefinition }>>;
  readonly objects: Readonly<Record<string, { readonly noun?: NounDefinition }>>;
}

/** Validates Interaction invariants that span composed World definitions. */
export function validateInteractionComposition(
  view: InteractionCompositionView,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  const missingOwnerNounPaths = new Set<string>();
  for (const [sceneId, scene] of Object.entries(view.scenes)) {
    for (const hotspot of scene.hotspots ?? []) {
      if (hotspot.target.kind === "background") continue;
      const owner = hotspot.target.kind === "character"
        ? view.characters[hotspot.target.character]
        : hotspot.target.kind === "object"
          ? view.objects[hotspot.target.object]
          : scene.scenery?.[hotspot.target.scenery];
      if (!owner || owner.noun) continue;
      const ownerPath = hotspot.target.kind === "character"
        ? `characters.${hotspot.target.character}.noun`
        : hotspot.target.kind === "object"
          ? `objects.${hotspot.target.object}.noun`
          : `scenes.${sceneId}.scenery.${hotspot.target.scenery}.noun`;
      if (missingOwnerNounPaths.has(ownerPath)) continue;
      missingOwnerNounPaths.add(ownerPath);
      diagnostics.push({
        code: "definition.hotspot.target-noun.required",
        family: "definition",
        owner: "interaction",
        path: ownerPath,
        message: "A target referenced by a Hotspot must own a Noun Definition.",
      });
    }
  }
  const hasNouns = Object.values(view.characters).some(({ noun }) => noun !== undefined) ||
    Object.values(view.objects).some(({ noun }) => noun !== undefined) ||
    Object.values(view.scenes).some((scene) =>
      Object.values(scene.scenery ?? {}).some(({ noun }) => noun !== undefined) ||
      scene.hotspots?.some((hotspot) => hotspot.target.kind === "background") ||
      (scene.passages?.length ?? 0) > 0
    );
  if (hasNouns && !view.commandLexicon) {
    diagnostics.push({
      code: "definition.command-lexicon.required",
      family: "definition",
      owner: "interaction",
      path: "commandLexicon",
      message: "A Game Project with Nouns must define a Command Lexicon.",
    });
  }
  return diagnostics;
}

/** Validates one Interaction Condition against the composed Game Project names. */
export function validateInteractionConditionReference(
  condition: InteractionCondition | undefined,
  path: string,
  view: InteractionReferenceView,
): readonly AuthoringDiagnostic[] {
  if (!condition) return [];
  if ("variable" in condition && !view.variables.has(condition.variable)) {
    return [interactionReference(
      "reference.variable",
      path,
      `Game Variable '${condition.variable}' does not exist.`,
    )];
  }
  if ("hasObject" in condition && !view.objects.has(condition.hasObject)) {
    return [interactionReference(
      "reference.object",
      path,
      `Object '${condition.hasObject}' does not exist.`,
    )];
  }
  return [];
}

/** Validates the references and guaranteed outcomes owned by one Noun Definition. */
export function validateNounReferences(
  noun: NounDefinition,
  path: string,
  view: InteractionReferenceView,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  const conditionalVariants: readonly {
    readonly segment: string;
    readonly values: readonly { readonly when?: InteractionCondition }[];
  }[] = [
    { segment: "labels", values: noun.labels },
    { segment: "preferredVerbs", values: noun.preferredVerbs },
    { segment: "secondaryVerbs", values: noun.secondaryVerbs ?? [] },
    { segment: "objectVerbs", values: noun.objectVerbs ?? [] },
  ];
  conditionalVariants.forEach(({ segment, values }) => {
    values.forEach((value, index) => diagnostics.push(...validateInteractionConditionReference(
      value.when,
      `${path}.${segment}[${index}].when`,
      view,
    )));
  });
  noun.cases.forEach((candidate, index) => {
    const candidatePath = `${path}.cases[${index}]`;
    diagnostics.push(...validateInteractionConditionReference(
      candidate.when,
      `${candidatePath}.when`,
      view,
    ));
    if (candidate.firstNoun !== undefined && !view.objects.has(candidate.firstNoun)) {
      diagnostics.push(interactionReference(
        "reference.object",
        `${candidatePath}.firstNoun`,
        `Object '${candidate.firstNoun}' does not exist.`,
      ));
    }
    if (candidate.sequence !== undefined && !view.sequences.has(candidate.sequence)) {
      diagnostics.push(interactionReference(
        "reference.sequence",
        `${candidatePath}.sequence`,
        `Sequence '${candidate.sequence}' does not exist.`,
      ));
    }
    validateCommandResponse(candidate.response, `${candidatePath}.response`, diagnostics);
  });
  for (const verb of commandVerbs) {
    const fallback = noun.fallbacks?.[verb];
    if (!fallback && !view.commandFallbacks?.[verb]) {
      diagnostics.push({
        code: "definition.command.silent",
        family: "definition",
        owner: "interaction",
        path: `${path}.fallbacks.${verb}`,
        message: `Noun '${path}' needs a local or global '${verb}' Command Fallback.`,
      });
    }
    if (!fallback) continue;
    validateCommandResponse(fallback.response, `${path}.fallbacks.${verb}.response`, diagnostics);
    if (fallback.sequence !== undefined && !view.sequences.has(fallback.sequence)) {
      diagnostics.push(interactionReference(
        "reference.sequence",
        `${path}.fallbacks.${verb}.sequence`,
        `Sequence '${fallback.sequence}' does not exist.`,
      ));
    }
  }
  return diagnostics;
}

export interface CommandLexicon {
  readonly verbs: Readonly<Record<CommandVerb, string>>;
  readonly inventory: {
    readonly select: string;
    readonly deselect: string;
  };
  readonly patterns: {
    readonly unary: string;
    readonly give: string;
    readonly use: string;
  };
}

/** Creates and freezes the localized labels and sentence patterns for Commands. */
export function defineCommandLexicon(input: CommandLexicon): CommandLexicon {
  const diagnostics: AuthoringDiagnostic[] = [];
  for (const verb of commandVerbs) {
    if (!input.verbs[verb]?.trim()) {
      diagnostics.push({
        code: "definition.command-lexicon.label",
        family: "definition", owner: "interaction",
        path: `verbs.${verb}`,
        message: `The Command Lexicon needs a non-empty label for '${verb}'.`,
      });
    }
  }
  validatePattern(input.inventory.select, ["{noun}"], "inventory.select", diagnostics);
  validatePattern(input.inventory.deselect, ["{noun}"], "inventory.deselect", diagnostics);
  validatePattern(input.patterns.unary, ["{verb}", "{noun}"], "patterns.unary", diagnostics);
  validatePattern(input.patterns.give, ["{verb}", "{first}", "{second}"], "patterns.give", diagnostics);
  validatePattern(input.patterns.use, ["{verb}", "{first}", "{second}"], "patterns.use", diagnostics);
  if (diagnostics.length > 0) throw new AuthoringError(diagnostics);
  return deepFreeze(structuredClone(input));
}

/** @internal */
export interface InteractionStateView {
  readonly currentScene: string;
  readonly variables: Readonly<Record<string, boolean>>;
  readonly inventory: { readonly objects: readonly string[] };
  readonly command: CommandState;
}

/** @internal The committed Command currently being constructed by the Player. */
export interface CommandState {
  readonly verb: Verb;
  readonly firstNoun: null | { readonly kind: "object"; readonly object: string };
}

/** @internal The Interaction-owned meaning retained while the Player approaches a Noun. */
export type PlayerIntent =
  | { readonly kind: "move" }
  | {
      readonly kind: "interaction";
      readonly scene: string;
      readonly hotspot: number;
      readonly command?: PendingCommand;
    }
  | {
      readonly kind: "passage-command";
      readonly scene: string;
      readonly passage: number;
      readonly command: PendingCommand;
    }
  | { readonly kind: "passage"; readonly scene: string; readonly passage: number };

/** @internal */
export interface PendingCommand {
  readonly verb: CommandVerb;
  readonly firstNoun?: string;
  /** Keeps the Player's prior Command State after this convenient input resolves. */
  readonly preserveState?: boolean;
}

/** @internal The Game Activity state needed to resume a Player Intent after World movement. */
export interface PlayerIntentState {
  readonly type: "player-intent";
  readonly animationStartedTick: number;
  readonly destination: Point;
  readonly finalFacing?: Facing;
  readonly fast?: true;
  readonly intent: PlayerIntent;
}

/** @internal */
export interface InteractionProjectView {
  readonly scenes?: Readonly<Record<string, {
    readonly scenery?: Readonly<Record<string, { readonly noun?: NounDefinition }>>;
  }>>;
  readonly characters?: Readonly<Record<string, { readonly noun?: NounDefinition }>>;
  readonly objects: Readonly<Record<string, {
    readonly noun?: NounDefinition;
    readonly inventoryAppearance?: URL | string;
  }>>;
  readonly commandFallbacks?: Readonly<Partial<Record<CommandVerb, CommandResponse>>>;
}

/** @internal The committed Object and Command facts changed by Inventory consequences. */
export interface InventoryLifecycleState {
  readonly currentScene: string;
  readonly objects: Readonly<Record<string, Readonly<ObjectState>>>;
  readonly inventory: { readonly objects: readonly string[] };
  readonly command: CommandState;
}

/** @internal Context retained while applying one Inventory consequence. */
export interface InventoryOperationContext {
  readonly target: HotspotTarget;
  readonly firstNounObject?: string;
}

/** @internal Capability interfaces consulted without duplicating their policy. */
export interface InventoryAuthorities {
  readonly canPlaceObject: (scene: string, point: Point) => boolean;
  readonly objectHasAppearance: (object: string, appearance: string) => boolean;
}

/** @internal Authoring context in which one Inventory operation is declared. */
export interface InventoryOperationValidationContext {
  readonly target?: HotspotTarget;
  readonly scenes?: readonly string[];
}

/** @internal Validation interfaces supplied by World and Animation. */
export interface InventoryOperationValidationAuthorities {
  readonly objects: ReadonlySet<string>;
  readonly scenes: ReadonlySet<string>;
  readonly validatePlacement: (
    scenes: readonly string[],
    point: Point,
    path: string,
  ) => readonly AuthoringDiagnostic[];
  readonly validateObjectAppearance: (
    object: string,
    appearance: string,
    path: string,
  ) => readonly AuthoringDiagnostic[];
}

/** Reports whether a Game Operation belongs to the Inventory lifecycle. */
export function isInventoryOperation(operation: GameOperation): operation is InventoryOperation {
  return operation.type === "collect-target-object" ||
    operation.type === "place-selected-object" ||
    operation.type === "place-object" ||
    operation.type === "consume-selected-object";
}

/** Validates one authored Inventory consequence through capability-owned interfaces. */
export function validateInventoryOperation(
  operation: InventoryOperation,
  path: string,
  context: InventoryOperationValidationContext,
  authorities: InventoryOperationValidationAuthorities,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (operation.type === "collect-target-object") {
    if (context.target?.kind !== "object") {
      diagnostics.push({
        code: "definition.operation.collect-target",
        family: "definition",
        owner: "interaction",
        path,
        message: "collect-target-object requires an Object Hotspot target.",
      });
    }
    return diagnostics;
  }
  if (operation.type === "place-selected-object") {
    diagnostics.push(...authorities.validatePlacement(
      context.scenes ?? [...authorities.scenes],
      operation.groundPoint,
      `${path}.groundPoint`,
    ));
    return diagnostics;
  }
  if (operation.type === "consume-selected-object") return diagnostics;

  if (!authorities.objects.has(operation.object)) {
    diagnostics.push(interactionReference(
      "reference.object",
      `${path}.object`,
      `Object '${operation.object}' does not exist.`,
    ));
  }
  if (!authorities.scenes.has(operation.scene)) {
    diagnostics.push(interactionReference(
      "reference.scene",
      `${path}.scene`,
      `Scene '${operation.scene}' does not exist.`,
    ));
  } else {
    diagnostics.push(...authorities.validatePlacement(
      [operation.scene],
      operation.groundPoint,
      `${path}.groundPoint`,
    ));
  }
  if (authorities.objects.has(operation.object) && operation.appearance !== undefined) {
    diagnostics.push(...authorities.validateObjectAppearance(
      operation.object,
      operation.appearance,
      `${path}.appearance`,
    ));
  }
  return diagnostics;
}

/** @internal Explicit result returned to Game Session for atomic commit. */
export type InventoryOperationResult =
  | { readonly status: "applied"; readonly state: Omit<InventoryLifecycleState, "currentScene"> }
  | { readonly status: "invalid"; readonly message: string };

interface InventoryLifecycleDraft {
  objects: Record<string, ObjectState>;
  inventory: { objects: string[] };
  command: CommandState;
}

/** @internal One carried Object prepared for presentation by the HUD. */
export interface InventoryPresentationEntry {
  readonly object: string;
  readonly label: string;
  readonly inventoryAppearance: string;
  readonly preferredVerb?: Verb;
  readonly secondaryVerb?: Verb;
  readonly selected: boolean;
}

/** @internal Immutable Inventory facts consumed without aggregate project or state queries. */
export interface InventoryPresentation {
  readonly entries: readonly InventoryPresentationEntry[];
}

/** @internal */
export interface InteractionTargetView {
  readonly kind: "hotspot" | "passage";
  readonly scene: string;
  readonly index: number;
  readonly noun: NounDefinition;
  readonly target: HotspotTarget;
}

/** @internal */
export type InteractionInput =
  | { readonly type: "select-verb"; readonly verb: CommandVerb }
  | { readonly type: "activate-hotspot"; readonly hotspot: number }
  | { readonly type: "quick-hotspot"; readonly hotspot: number; readonly verb?: Verb }
  | { readonly type: "contextual-hotspot"; readonly hotspot: number; readonly action: "primary" | "secondary" }
  | { readonly type: "activate-passage"; readonly passage: number; readonly fast?: boolean; readonly forceWalk?: boolean }
  | { readonly type: "quick-passage"; readonly passage: number; readonly verb?: Verb }
  | { readonly type: "contextual-passage"; readonly passage: number; readonly action: "primary" | "secondary" }
  | { readonly type: "activate-object"; readonly object: string }
  | { readonly type: "select-object"; readonly object: string }
  | { readonly type: "contextual-object"; readonly object: string; readonly action: "primary" | "secondary" }
  | { readonly type: "escape" };

type WorldTargetInteractionInput = Extract<
  InteractionInput,
  { readonly hotspot: number } | { readonly passage: number }
>;

interface TargetCommand {
  readonly verb: Verb;
  readonly firstNoun?: string;
  readonly preserveCommandState: boolean;
}

/** @internal */
export type InteractionDecision =
  | { readonly type: "ignored" }
  | {
      readonly type: "command";
      readonly command: CommandState;
      readonly cancelActivity?: true;
    }
  | {
      readonly type: "request-approach";
      readonly target: WorldTarget;
      readonly intent: PlayerIntent;
      readonly fast?: true;
    }
  | {
      readonly type: "resolve";
      readonly target: HotspotTarget;
      readonly firstNoun?: string;
      readonly commandStateDisposition: "preserve" | "reset";
      readonly resolution?: ResolvedInteraction;
    }
  | { readonly type: "passage"; readonly passage: number };

/** @internal Interaction policy over one narrow Game Project view. */
export interface Interaction {
  nounForHotspot(scene: string, hotspot: HotspotDefinition): NounDefinition | undefined;
  input(
    input: InteractionInput,
    state: InteractionStateView,
    target?: InteractionTargetView,
  ): InteractionDecision;
  resume(
    intent: PlayerIntent,
    state: InteractionStateView,
    target?: InteractionTargetView,
  ): InteractionDecision;
  applyInventoryOperation(
    operation: InventoryOperation,
    state: InventoryLifecycleState,
    context: InventoryOperationContext,
  ): InventoryOperationResult;
  inventory(state: InteractionStateView): InventoryPresentation;
}

/** Creates the Interaction module that translates Player input into explicit intentions. */
export function createInteraction(
  view: InteractionProjectView,
  authorities: InventoryAuthorities = {
    canPlaceObject: () => false,
    objectHasAppearance: () => false,
  },
): Interaction {
  const resetCommand: CommandState = { verb: "walk-to", firstNoun: null };

  const resolve = (
    noun: NounDefinition,
    verb: CommandVerb,
    target: HotspotTarget,
    state: InteractionStateView,
    commandStateDisposition: "preserve" | "reset",
    firstNoun?: string,
  ): InteractionDecision => {
    const resolution = resolveCommandDefinition({
      noun,
      verb,
      ...(firstNoun ? { firstNoun } : {}),
      state,
      projectFallbacks: view.commandFallbacks,
    });
    return {
      type: "resolve",
      target,
      ...(firstNoun ? { firstNoun } : {}),
      commandStateDisposition,
      ...(resolution ? { resolution } : {}),
    };
  };

  const selectObject = (object: string, state: InteractionStateView): InteractionDecision => {
    if (!state.inventory.objects.includes(object)) return { type: "ignored" };
    return {
      type: "command",
      command: state.command.firstNoun?.object === object
        ? resetCommand
        : { verb: "use", firstNoun: { kind: "object", object } },
      cancelActivity: true,
    };
  };

  const requestApproach = (
    target: InteractionTargetView,
    intent: PlayerIntent,
    fast = false,
  ): InteractionDecision => ({
    type: "request-approach",
    target: { kind: target.kind, index: target.index },
    intent,
    ...(fast ? { fast: true } : {}),
  });

  const commandForTarget = (
    input: WorldTargetInteractionInput,
    state: InteractionStateView,
    target: InteractionTargetView,
  ): TargetCommand | undefined => {
    const activated = input.type === "activate-hotspot" || input.type === "activate-passage";
    if (activated && state.command.verb === "give" && !state.command.firstNoun) return undefined;
    const verb = input.type === "quick-hotspot" || input.type === "quick-passage"
      ? input.verb ?? conditionalValue(target.noun.preferredVerbs, state).verb
      : input.type === "contextual-hotspot" || input.type === "contextual-passage"
        ? contextualVerb(target.noun, input.action, state.command.firstNoun?.object, state)
        : state.command.verb;
    if (!verb) return undefined;
    const preserveCommandState = !activated;
    const firstNoun = preserveCommandState
      ? preferredFirstNoun(target.noun, verb, state.command.firstNoun?.object, state)
      : state.command.firstNoun?.object;
    return {
      verb,
      ...(firstNoun ? { firstNoun } : {}),
      preserveCommandState,
    };
  };

  const pendingCommand = (command: TargetCommand): PendingCommand => ({
    verb: command.verb as CommandVerb,
    ...(command.firstNoun ? { firstNoun: command.firstNoun } : {}),
    ...(command.preserveCommandState ? { preserveState: true } : {}),
  });

  const placeObject = (
    draft: InventoryLifecycleDraft,
    objectId: string,
    scene: string,
    groundPoint: Point,
    appearance?: string,
  ): string | undefined => {
    if (!authorities.canPlaceObject(scene, groundPoint)) {
      return "The placed Object Ground Point is outside the destination Scene Size.";
    }
    if (appearance !== undefined && !authorities.objectHasAppearance(objectId, appearance)) {
      return `Unknown Object Appearance '${appearance}'.`;
    }
    const object = draft.objects[objectId]!;
    object.location = {
      kind: "scene",
      scene,
      groundPoint: { ...groundPoint },
    };
    if (appearance !== undefined) object.appearance = appearance;
    draft.inventory.objects = draft.inventory.objects.filter((candidate) => candidate !== objectId);
    return undefined;
  };

  return {
    nounForHotspot(scene, hotspot) {
      if (hotspot.target.kind === "background") return hotspot.noun;
      if (hotspot.target.kind === "character") {
        return view.characters?.[hotspot.target.character]?.noun;
      }
      if (hotspot.target.kind === "object") {
        return view.objects[hotspot.target.object]?.noun;
      }
      return view.scenes?.[scene]?.scenery?.[hotspot.target.scenery]?.noun;
    },
    input(input, state, target) {
      if (input.type === "select-verb") {
        return {
          type: "command",
          command: { verb: input.verb, firstNoun: null },
          cancelActivity: true,
        };
      }
      if (input.type === "escape") {
        return { type: "command", command: resetCommand };
      }
      if (input.type === "select-object") return selectObject(input.object, state);
      if (input.type === "contextual-object") {
        if (input.action === "primary") return selectObject(input.object, state);
        const noun = view.objects[input.object]?.noun;
        if (!state.inventory.objects.includes(input.object) || !noun) {
          return { type: "ignored" };
        }
        const verb = conditionalOptionalValue(noun.secondaryVerbs, state)?.verb;
        if (!verb || verb === "walk-to") return { type: "ignored" };
        return resolve(noun, verb, { kind: "object", object: input.object }, state, "preserve");
      }
      if (input.type === "activate-object") {
        const noun = view.objects[input.object]?.noun;
        if (!state.inventory.objects.includes(input.object) || !noun || state.command.verb === "walk-to") {
          return { type: "ignored" };
        }
        if (state.command.verb === "give" && !state.command.firstNoun) {
          return {
            type: "command",
            command: { verb: "give", firstNoun: { kind: "object", object: input.object } },
            cancelActivity: true,
          };
        }
        if (
          state.command.verb === "use" &&
          !state.command.firstNoun &&
          !noun.cases.some((candidate) =>
            candidate.verb === "use" &&
            candidate.firstNoun === undefined &&
            conditionMatchesState(candidate.when, state)
          )
        ) {
          return selectObject(input.object, state);
        }
        return resolve(
          noun,
          state.command.verb,
          { kind: "object", object: input.object },
          state,
          "reset",
          state.command.firstNoun?.object,
        );
      }

      if (
        input.type === "activate-hotspot" ||
        input.type === "quick-hotspot" ||
        input.type === "contextual-hotspot"
      ) {
        if (!target || target.kind !== "hotspot" || target.index !== input.hotspot) {
          return { type: "ignored" };
        }
        const command = commandForTarget(input, state, target);
        if (!command) return { type: "ignored" };
        const intent: PlayerIntent = command.verb === "walk-to"
          ? { kind: "move" }
          : {
              kind: "interaction",
              scene: target.scene,
              hotspot: target.index,
              command: pendingCommand(command),
            };
        return requestApproach(target, intent);
      }

      if (!target || target.kind !== "passage" || target.index !== input.passage) {
        return { type: "ignored" };
      }
      const command = commandForTarget(input, state, target);
      if (!command) return { type: "ignored" };
      const shouldWalk = input.type === "activate-passage" &&
        (input.forceWalk || state.command.verb === "walk-to") || command.verb === "walk-to";
      const intent: PlayerIntent = shouldWalk
        ? { kind: "passage", scene: target.scene, passage: target.index }
        : {
            kind: "passage-command",
            scene: target.scene,
            passage: target.index,
            command: pendingCommand(command),
          };
      return requestApproach(
        target,
        intent,
        input.type === "activate-passage" && Boolean(input.fast),
      );
    },
    resume(intent, state, target) {
      if (intent.kind === "move" || intent.scene !== state.currentScene) {
        return { type: "ignored" };
      }
      if (intent.kind === "interaction") {
        if (
          !target ||
          target.kind !== "hotspot" ||
          target.scene !== intent.scene ||
          target.index !== intent.hotspot
        ) {
          return intent.command
            ? { type: "command", command: { verb: "walk-to", firstNoun: null } }
            : { type: "ignored" };
        }
        if (!intent.command) return { type: "ignored" };
        return resolve(
          target.noun,
          intent.command.verb,
          target.target,
          state,
          intent.command.preserveState ? "preserve" : "reset",
          intent.command.firstNoun,
        );
      }
      if (
        !target ||
        target.kind !== "passage" ||
        target.scene !== intent.scene ||
        target.index !== intent.passage
      ) {
        return intent.kind === "passage-command" && !intent.command.preserveState
          ? { type: "command", command: resetCommand }
          : { type: "ignored" };
      }
      if (intent.kind === "passage") return { type: "passage", passage: intent.passage };
      return resolve(
        target.noun,
        intent.command.verb,
        { kind: "background" },
        state,
        intent.command.preserveState ? "preserve" : "reset",
        intent.command.firstNoun,
      );
    },
    applyInventoryOperation(operation, state, context) {
      const next: InventoryLifecycleDraft = {
        objects: structuredClone(state.objects) as Record<string, ObjectState>,
        inventory: { objects: [...state.inventory.objects] },
        command: structuredClone(state.command),
      };
      if (operation.type === "collect-target-object") {
        if (context.target.kind !== "object") {
          return { status: "invalid", message: "Collect requires an Object target." };
        }
        const object = next.objects[context.target.object];
        if (!object || object.location.kind !== "scene" || object.location.scene !== state.currentScene) {
          return {
            status: "invalid",
            message: "The target Object is not present in the current Scene.",
          };
        }
        object.location = { kind: "inventory" };
        next.inventory.objects.push(context.target.object);
      } else if (operation.type === "consume-selected-object") {
        const selected = context.firstNounObject;
        if (!selected || !next.inventory.objects.includes(selected)) {
          return { status: "invalid", message: "No Object is selected." };
        }
        const object = next.objects[selected];
        if (!object) {
          return { status: "invalid", message: `Unknown Object '${selected}'.` };
        }
        object.location = { kind: "consumed" };
        next.inventory.objects = next.inventory.objects.filter((objectId) => objectId !== selected);
      } else if (operation.type === "place-selected-object") {
        const selected = context.firstNounObject;
        if (!selected || !next.inventory.objects.includes(selected)) {
          return { status: "invalid", message: "No Object is selected." };
        }
        const object = next.objects[selected];
        if (!object) {
          return { status: "invalid", message: `Unknown Object '${selected}'.` };
        }
        const failure = placeObject(
          next,
          selected,
          state.currentScene,
          operation.groundPoint,
          operation.appearance,
        );
        if (failure) return { status: "invalid", message: failure };
      } else if (operation.type === "place-object") {
        const object = next.objects[operation.object];
        if (!object) {
          return {
            status: "invalid",
            message: "Placed Object or destination Scene does not exist.",
          };
        }
        const failure = placeObject(
          next,
          operation.object,
          operation.scene,
          operation.groundPoint,
          operation.appearance,
        );
        if (failure) return { status: "invalid", message: failure };
      }
      if (
        next.command.firstNoun &&
        !next.inventory.objects.includes(next.command.firstNoun.object)
      ) {
        next.command = { verb: "walk-to", firstNoun: null };
      }
      return { status: "applied", state: next };
    },
    inventory(state) {
      const entries = state.inventory.objects.flatMap((object) => {
        const definition = view.objects[object];
        const noun = definition?.noun;
        const source = definition?.inventoryAppearance;
        if (!noun || source === undefined) return [];
        const preferredVerb = conditionalValue(noun.preferredVerbs, state).verb;
        const secondaryVerb = conditionalOptionalValue(noun.secondaryVerbs, state)?.verb;
        return [Object.freeze({
          object,
          label: conditionalValue(noun.labels, state).text,
          inventoryAppearance: source instanceof URL ? source.href : source,
          ...(preferredVerb ? { preferredVerb } : {}),
          ...(secondaryVerb ? { secondaryVerb } : {}),
          selected: state.command.firstNoun?.object === object,
        })];
      });
      return Object.freeze({ entries: Object.freeze(entries) });
    },
  };
}

/** @internal */
export interface ResolvedInteraction {
  readonly operations: readonly GameOperation[];
  readonly response?: CommandResponse;
  readonly line?: Line;
}

/** Interaction-owned selection of a Command Case or fallback. */
export function resolveCommandDefinition(input: {
  readonly noun: NounDefinition;
  readonly verb: CommandVerb;
  readonly firstNoun?: string;
  readonly state: InteractionStateView;
  readonly projectFallbacks?: Readonly<Partial<Record<CommandVerb, CommandResponse>>>;
}): ResolvedInteraction | undefined {
  const { noun, verb, firstNoun, state, projectFallbacks } = input;
  if (firstNoun && !state.inventory.objects.includes(firstNoun)) {
    const response = noun.fallbacks?.[verb]?.response ?? projectFallbacks?.[verb];
    return response ? { operations: [], response } : undefined;
  }
  const candidate = noun.cases.find((value) =>
    value.verb === verb &&
    value.firstNoun === firstNoun &&
    conditionMatchesState(value.when, state)
  );
  const fallback = candidate ? undefined : noun.fallbacks?.[verb];
  const resolution = candidate ?? fallback;
  if (!resolution) {
    const response = projectFallbacks?.[verb];
    return response ? { operations: [], response } : undefined;
  }
  return {
    operations: [
      ...(resolution.operations ?? []),
      ...(resolution.sequence
        ? [{ type: "start-sequence" as const, sequence: resolution.sequence }]
        : []),
    ],
    ...(resolution.response ? { response: resolution.response } : {}),
    ...("line" in resolution && resolution.line ? { line: resolution.line } : {}),
  };
}

export function conditionalValue<T extends { readonly when?: InteractionCondition }>(
  values: readonly T[],
  state: InteractionStateView,
): T {
  return values.find((value) => conditionMatchesState(value.when, state)) ?? values.at(-1)!;
}

export function conditionalOptionalValue<T extends { readonly when?: InteractionCondition }>(
  values: readonly T[] | undefined,
  state: InteractionStateView,
): T | undefined {
  return values?.find((value) => conditionMatchesState(value.when, state)) ?? values?.at(-1);
}

export function contextualVerb(
  noun: NounDefinition,
  action: "primary" | "secondary",
  selectedObject: string | undefined,
  state: InteractionStateView,
): Verb | undefined {
  if (selectedObject) {
    return action === "primary"
      ? conditionalOptionalValue(noun.objectVerbs, state)?.verb ?? "use"
      : conditionalValue(noun.preferredVerbs, state).verb;
  }
  return action === "primary"
    ? conditionalValue(noun.preferredVerbs, state).verb
    : conditionalOptionalValue(noun.secondaryVerbs, state)?.verb;
}

export function preferredFirstNoun(
  noun: NounDefinition,
  verb: Verb,
  selectedObject: string | undefined,
  state: InteractionStateView,
): string | undefined {
  if (!selectedObject || verb === "walk-to") return undefined;
  if (verb === "give") return selectedObject;
  if (verb !== "use") return undefined;
  return noun.cases.some((candidate) =>
    candidate.verb === "use" &&
    candidate.firstNoun === selectedObject &&
    conditionMatchesState(candidate.when, state)
  ) ? selectedObject : undefined;
}

function validateConditionalFallback(
  values: readonly { readonly when?: InteractionCondition }[],
  path: string,
  name: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  const unconditional = values
    .map((value, index) => value.when === undefined ? index : -1)
    .filter((index) => index >= 0);
  if (unconditional.length !== 1 || unconditional[0] !== values.length - 1) {
    diagnostics.push({
      code: "definition.conditional-fallback",
      family: "definition", owner: "interaction",
      path,
      message: `${name} variants require exactly one unconditional fallback in the final position.`,
    });
  }
}

function validatePattern(
  pattern: string,
  placeholders: readonly string[],
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  if (!pattern.trim() || placeholders.some((placeholder) => !pattern.includes(placeholder))) {
    diagnostics.push({
      code: "definition.command-lexicon.pattern",
      family: "definition", owner: "interaction",
      path,
      message: `The sentence pattern must contain ${placeholders.join(", ")}.`,
    });
  }
}

function interactionReference(
  code: string,
  path: string,
  message: string,
): AuthoringDiagnostic {
  return { code, family: "reference", owner: "interaction", path, message };
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
