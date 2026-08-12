import type { AuthoringDiagnostic } from "../game-project";

/** One true canonical proposition identified by its Narrative Fact registry key. */
export interface NarrativeFactDefinition {
  readonly proposition: string;
}

/** The three qualitative confidence levels used by Trust and Personality. */
export type QualitativeLevel = "low" | "medium" | "high";

/** The directional confidence one Character places in another. */
export type Trust = QualitativeLevel;

/** A boolean Game Variable condition authored as ordinary project data. */
export interface DialogueVariableCondition {
  readonly variable: string;
  readonly equals: boolean;
}

/** A condition that opens guarded Character Knowledge at a minimum Trust level. */
export interface DialogueTrustCondition {
  readonly trustAtLeast: Trust;
}

/** Character Knowledge that may be communicated whenever it is relevant. */
export interface OpenDisclosure {
  readonly level: "open";
}

/** Character Knowledge protected by either directional Trust or a Game Variable. */
export interface GuardedDisclosure {
  readonly level: "guarded";
  readonly when: DialogueTrustCondition | DialogueVariableCondition;
}

/** Character Knowledge protected by an explicit Game Variable unlock. */
export interface SecretDisclosure {
  readonly level: "secret";
  readonly when: DialogueVariableCondition;
}

/** Character-specific policy governing communication of one Narrative Fact. */
export type Disclosure = OpenDisclosure | GuardedDisclosure | SecretDisclosure;

/** One Character-specific reference to a declared Narrative Fact. */
export interface CharacterKnowledgeDefinition {
  readonly factId: string;
  readonly disclosure: Disclosure;
}

/** Qualitative portrayal traits without numeric simulation or state authority. */
export interface PersonalityDefinition {
  readonly talkativeness: QualitativeLevel;
  readonly honesty: QualitativeLevel;
  readonly discretion: QualitativeLevel;
  readonly suspiciousness: QualitativeLevel;
}

/** Engine-owned deterministic preference used when a fact cannot be disclosed. */
export interface DialogueBehaviorDefinition {
  readonly withholding: "withhold" | "evade" | "refuse";
}

/** Qualitative language settings that can shape only verbalisation. */
export interface VoiceDefinition {
  readonly verbosity: "short" | "medium" | "long";
  readonly tone: "warm" | "neutral" | "dry";
  readonly vocabulary: "simple" | "ordinary" | "formal";
}

/** Optional authored condition portrayed by dialogue without numeric simulation. */
export type DialogueState = "calm" | "afraid" | "angry" | "drunk";

/** One directional authored Relationship. */
export interface RelationshipDefinition {
  readonly trust: Trust;
}

/** Optional Knowledge-Driven Dialogue data authored beside a Character's World definition. */
export interface CharacterDialogueDefinition {
  readonly biography?: string;
  readonly personality?: PersonalityDefinition;
  readonly behavior?: DialogueBehaviorDefinition;
  readonly voice?: VoiceDefinition;
  readonly state?: DialogueState;
  readonly knowledge: readonly CharacterKnowledgeDefinition[];
  readonly relationships?: Readonly<Record<string, RelationshipDefinition>>;
}

/** Maximum Player speech accepted by one Dialogue Turn. */
export const dialogueInputMaxLength = 500;

/** One Narrative Fact offered to interpretation without granting state authority. */
export interface DialogueFactCandidate {
  readonly id: string;
  readonly proposition: string;
}

/** Untrusted Player speech and the only declared facts relevant to one Conversation. */
export interface DialogueInterpretationRequest {
  readonly playerInput: string;
  readonly speaker: string;
  readonly listener: string;
  readonly candidates: readonly DialogueFactCandidate[];
}

/** Structured technical output returned by a Dialogue Provider. */
export interface DialogueInterpretation {
  readonly factId: string | null;
}

/** Engine-selected semantic approach for one Dialogue Turn. */
export type ResponseStrategy = "answer" | "withhold" | "evade" | "refuse" | "clarify";

/** Qualitative portrayal context with no authority over response content. */
export interface DialoguePortrayalProfile {
  readonly biography?: string;
  readonly personality?: PersonalityDefinition;
  readonly voice?: VoiceDefinition;
  readonly state?: DialogueState;
}

/** Engine-authorised semantic payload for a Dialogue Provider to express. */
export interface DialogueVerbalizationRequest {
  readonly playerInput: string;
  readonly speaker: string;
  readonly listener: string;
  readonly strategy: ResponseStrategy;
  readonly fact?: DialogueFactCandidate;
  readonly profile: DialoguePortrayalProfile;
}

/** Provider-agnostic seam between Fondale and generated dialogue adapters. */
export interface DialogueProvider {
  interpret(request: DialogueInterpretationRequest): Promise<DialogueInterpretation>;
  verbalize(request: DialogueVerbalizationRequest): Promise<string>;
  reset(): Promise<void>;
}

/** Deterministic, dependency-free Dialogue Provider for tests and technical fixtures. */
export class FakeDialogueProvider implements DialogueProvider {
  constructor(private readonly responses: {
    readonly interpretations: Readonly<Record<string, string | null>>;
    readonly verbalizations: Readonly<Record<string, string>>;
  }) {}

  interpret(request: DialogueInterpretationRequest): Promise<DialogueInterpretation> {
    if (!hasOwn(this.responses.interpretations, request.playerInput)) {
      return Promise.reject(new Error("Fake Dialogue Provider has no matching interpretation."));
    }
    const factId = this.responses.interpretations[request.playerInput]!;
    return Promise.resolve({ factId });
  }

  verbalize(request: DialogueVerbalizationRequest): Promise<string> {
    const responseKey = request.fact?.id ?? request.strategy;
    if (!hasOwn(this.responses.verbalizations, responseKey)) {
      return Promise.reject(new Error("Fake Dialogue Provider has no matching verbalization."));
    }
    const response = this.responses.verbalizations[responseKey]!;
    return Promise.resolve(response);
  }

  reset(): Promise<void> {
    return Promise.resolve();
  }
}

/** Monotonic Game Operation that teaches one declared Narrative Fact to one Character. */
export interface LearnNarrativeFactOperation {
  readonly type: "learn-narrative-fact";
  readonly character: string;
  readonly factId: string;
}

/** Authored Game Operation that changes one directional Relationship. */
export interface SetTrustOperation {
  readonly type: "set-trust";
  readonly character: string;
  readonly towards: string;
  readonly trust: Trust;
}

/** Authored Game Operation that changes or clears one qualitative Dialogue State. */
export interface SetDialogueStateOperation {
  readonly type: "set-dialogue-state";
  readonly character: string;
  readonly state: DialogueState | null;
}

/** Game Operations whose policy belongs to Knowledge-Driven Dialogue. */
export type DialogueGameOperation = LearnNarrativeFactOperation
  | SetTrustOperation
  | SetDialogueStateOperation;

/** @internal Canonical Character Knowledge indexed by Character identity. */
export type CharacterKnowledgeState = Record<string, string[]>;

/** @internal Directional Relationship values indexed by source then target Character. */
export type RelationshipState = Record<string, Record<string, { trust: Trust }>>;

/** @internal Optional qualitative Dialogue State indexed by Character identity. */
export type CharacterDialogueState = Record<string, DialogueState | null>;

/** @internal Canonical state owned by Knowledge-Driven Dialogue. */
export interface KnowledgeDrivenDialogueState {
  readonly characterKnowledge: CharacterKnowledgeState;
  readonly relationships: RelationshipState;
  readonly dialogueStates: CharacterDialogueState;
}

/** @internal Narrow authored view needed by Knowledge-Driven Dialogue validation. */
export interface KnowledgeDrivenDialogueProjectView {
  readonly narrativeFacts: Readonly<Record<string, NarrativeFactDefinition>>;
  readonly variables: Readonly<Record<string, boolean>>;
  readonly characters: Readonly<Record<string, {
    readonly dialogue?: CharacterDialogueDefinition;
  }>>;
}

/** @internal Character Knowledge lifecycle behind the capability interface. */
export interface KnowledgeDrivenDialogue {
  initialState(): KnowledgeDrivenDialogueState;
  requiresProvider(): boolean;
  hasProfile(character: string): boolean;
  respond(
    state: KnowledgeDrivenDialogueState & { readonly variables: Record<string, boolean> },
    input: {
      readonly speaker: string;
      readonly listener: string;
      readonly playerInput: string;
    },
    provider: DialogueProvider,
  ): Promise<{
    readonly playerInput: string;
    readonly response: string;
    readonly operation?: LearnNarrativeFactOperation;
  }>;
  learn(
    state: KnowledgeDrivenDialogueState,
    operation: LearnNarrativeFactOperation,
  ): KnowledgeDrivenDialogueState;
  applyOperation(
    state: KnowledgeDrivenDialogueState,
    operation: DialogueGameOperation,
  ): KnowledgeDrivenDialogueState;
  isValidState(value: unknown): value is KnowledgeDrivenDialogueState;
}

/** Creates the in-process Knowledge-Driven Dialogue module for one compiled Game Project. */
export function createKnowledgeDrivenDialogue(
  project: KnowledgeDrivenDialogueProjectView,
): KnowledgeDrivenDialogue {
  return Object.freeze({
    initialState() {
      return {
        characterKnowledge: Object.fromEntries(
          Object.entries(project.characters).map(([characterId, character]) => [
            characterId,
            character.dialogue?.knowledge.map(({ factId }) => factId) ?? [],
          ]),
        ),
        relationships: Object.fromEntries(
          Object.entries(project.characters).map(([characterId, character]) => [
            characterId,
            Object.fromEntries(Object.entries(character.dialogue?.relationships ?? {}).map(
              ([targetId, relationship]) => [targetId, { trust: relationship.trust }],
            )),
          ]),
        ),
        dialogueStates: Object.fromEntries(
          Object.entries(project.characters).map(([characterId, character]) => [
            characterId,
            character.dialogue?.state ?? null,
          ]),
        ),
      };
    },
    requiresProvider() {
      return Object.keys(project.characters).some((character) =>
        project.characters[character]!.dialogue !== undefined
      );
    },
    hasProfile(character: string) {
      return hasOwn(project.characters, character) &&
        project.characters[character]!.dialogue !== undefined;
    },
    async respond(
      state: KnowledgeDrivenDialogueState & { readonly variables: Record<string, boolean> },
      input: {
        readonly speaker: string;
        readonly listener: string;
        readonly playerInput: string;
      },
      provider: DialogueProvider,
    ) {
      const playerInput = input.playerInput.trim();
      if (!playerInput || playerInput.length > dialogueInputMaxLength) {
        throw new Error(`Player speech must contain between 1 and ${dialogueInputMaxLength} characters.`);
      }
      if (!hasOwn(project.characters, input.speaker) ||
          project.characters[input.speaker]!.dialogue === undefined) {
        throw new Error(`Character '${input.speaker}' has no Dialogue Profile.`);
      }
      if (!hasOwn(project.characters, input.listener) ||
          state.characterKnowledge[input.listener] === undefined) {
        throw new Error(`Unknown listening Character '${input.listener}'.`);
      }
      const knownFactIds = state.characterKnowledge[input.speaker];
      if (!knownFactIds) {
        throw new Error(`Character Knowledge for '${input.speaker}' is missing.`);
      }
      const candidates = Object.freeze(knownFactIds.map((id) => Object.freeze({
        id,
        proposition: project.narrativeFacts[id]!.proposition,
      })));
      const request = Object.freeze({
        playerInput,
        speaker: input.speaker,
        listener: input.listener,
        candidates,
      });
      const interpretation = await provider.interpret(request);
      if (!isRecord(interpretation) ||
          (interpretation.factId !== null && typeof interpretation.factId !== "string")) {
        throw new Error("Dialogue Provider selected an unknown Narrative Fact.");
      }
      const profile = portrayalProfile(
        project.characters[input.speaker]!.dialogue!,
        state.dialogueStates[input.speaker] ?? null,
      );
      let strategy: ResponseStrategy;
      let fact: DialogueFactCandidate | undefined;
      if (interpretation.factId === null) {
        strategy = "clarify";
      } else {
        const candidate = candidates.find(({ id }) => id === interpretation.factId);
        if (!candidate) throw new Error("Dialogue Provider selected an unknown Narrative Fact.");
        const definition = project.characters[input.speaker]!.dialogue!.knowledge.find(
          ({ factId }) => factId === candidate.id,
        )!;
        if (disclosureAllows(
          definition.disclosure,
          state.relationships[input.speaker]?.[input.listener]?.trust,
          state.variables,
        )) {
          strategy = "answer";
          fact = candidate;
        } else {
          strategy = project.characters[input.speaker]!.dialogue!.behavior?.withholding ?? "withhold";
        }
      }
      const response = await provider.verbalize(Object.freeze({
        playerInput,
        speaker: input.speaker,
        listener: input.listener,
        strategy,
        ...(fact ? { fact } : {}),
        profile,
      }));
      if (typeof response !== "string" || !response.trim()) {
        throw new Error("Dialogue Provider returned an empty Line.");
      }
      return Object.freeze({
        playerInput,
        response: response.trim(),
        ...(fact ? {
          operation: Object.freeze({
            type: "learn-narrative-fact" as const,
            character: input.listener,
            factId: fact.id,
          }),
        } : {}),
      });
    },
    learn(state: KnowledgeDrivenDialogueState, operation: LearnNarrativeFactOperation) {
      if (!hasOwn(project.characters, operation.character)) {
        throw new Error(`Unknown Character '${operation.character}'.`);
      }
      if (!hasOwn(project.narrativeFacts, operation.factId)) {
        throw new Error(`Unknown Narrative Fact '${operation.factId}'.`);
      }
      const knownFacts = state.characterKnowledge[operation.character];
      if (!knownFacts) {
        throw new Error(`Character Knowledge for '${operation.character}' is missing.`);
      }
      if (knownFacts.includes(operation.factId)) return state;
      return {
        ...state,
        characterKnowledge: {
          ...state.characterKnowledge,
          [operation.character]: [...knownFacts, operation.factId],
        },
      };
    },
    applyOperation(state: KnowledgeDrivenDialogueState, operation: DialogueGameOperation) {
      if (operation.type === "learn-narrative-fact") return this.learn(state, operation);
      if (operation.type === "set-trust") {
        const relationship = state.relationships[operation.character]?.[operation.towards];
        if (!relationship) {
          throw new Error(
            `Relationship from '${operation.character}' towards '${operation.towards}' is missing.`,
          );
        }
        return {
          ...state,
          relationships: {
            ...state.relationships,
            [operation.character]: {
              ...state.relationships[operation.character],
              [operation.towards]: { trust: operation.trust },
            },
          },
        };
      }
      if (!hasOwn(state.dialogueStates, operation.character)) {
        throw new Error(`Unknown Character '${operation.character}'.`);
      }
      return {
        ...state,
        dialogueStates: {
          ...state.dialogueStates,
          [operation.character]: operation.state,
        },
      };
    },
    isValidState(value: unknown): value is KnowledgeDrivenDialogueState {
      if (!isRecord(value) ||
          !hasExactKeys(value, ["characterKnowledge", "relationships", "dialogueStates"]) ||
          !isRecord(value.characterKnowledge) || !sameKeys(value.characterKnowledge, project.characters) ||
          !isRecord(value.relationships) || !sameKeys(value.relationships, project.characters) ||
          !isRecord(value.dialogueStates) || !sameKeys(value.dialogueStates, project.characters)) return false;
      const validKnowledge = Object.entries(value.characterKnowledge).every(([characterId, knowledge]) => {
        if (!Array.isArray(knowledge) ||
            !knowledge.every((factId): factId is string =>
              typeof factId === "string" && hasOwn(project.narrativeFacts, factId)
            ) ||
            new Set(knowledge).size !== knowledge.length) return false;
        const initialKnowledge = project.characters[characterId]!.dialogue?.knowledge ?? [];
        return initialKnowledge.every(({ factId }) => knowledge.includes(factId));
      });
      if (!validKnowledge) return false;
      const validRelationships = Object.entries(value.relationships).every(([characterId, relationships]) => {
        const initial = project.characters[characterId]!.dialogue?.relationships ?? {};
        if (!isRecord(relationships) || !sameKeys(relationships, initial)) return false;
        return Object.values(relationships).every((relationship) =>
          isRecord(relationship) && hasExactKeys(relationship, ["trust"]) &&
          isQualitativeLevel(relationship.trust)
        );
      });
      if (!validRelationships) return false;
      return Object.entries(value.dialogueStates).every(([, dialogueState]) =>
        dialogueState === null || isDialogueState(dialogueState)
      );
    },
  });
}

function portrayalProfile(
  dialogue: CharacterDialogueDefinition,
  state: DialogueState | null,
): DialoguePortrayalProfile {
  return Object.freeze({
    ...(dialogue.biography === undefined ? {} : { biography: dialogue.biography }),
    ...(dialogue.personality === undefined ? {} : { personality: dialogue.personality }),
    ...(dialogue.voice === undefined ? {} : { voice: dialogue.voice }),
    ...(state === null ? {} : { state }),
  });
}

function disclosureAllows(
  disclosure: Disclosure,
  trust: Trust | undefined,
  variables: Readonly<Record<string, boolean>>,
): boolean {
  if (disclosure.level === "open") return true;
  if ("trustAtLeast" in disclosure.when) {
    return trust !== undefined && trustRank(trust) >= trustRank(disclosure.when.trustAtLeast);
  }
  return variables[disclosure.when.variable] === disclosure.when.equals;
}

function trustRank(trust: Trust): number {
  return { low: 0, medium: 1, high: 2 }[trust];
}

/** @internal Narrows a Game Operation to the Character Knowledge operation owned here. */
export function isLearnNarrativeFactOperation(
  operation: { readonly type: string },
): operation is LearnNarrativeFactOperation {
  return operation.type === "learn-narrative-fact";
}

/** @internal Narrows a Game Operation to policy owned by Knowledge-Driven Dialogue. */
export function isDialogueGameOperation(
  operation: { readonly type: string },
): operation is DialogueGameOperation {
  return operation.type === "learn-narrative-fact" ||
    operation.type === "set-trust" || operation.type === "set-dialogue-state";
}

/** Validates static references and values of one Dialogue-owned Game Operation. */
export function validateDialogueGameOperation(
  operation: DialogueGameOperation,
  path: string,
  project: KnowledgeDrivenDialogueProjectView,
): readonly AuthoringDiagnostic[] {
  if (operation.type === "learn-narrative-fact") {
    return validateLearnNarrativeFactOperation(operation, path, project);
  }
  const diagnostics: AuthoringDiagnostic[] = [];
  if (!hasOwn(project.characters, operation.character)) {
    diagnostics.push({
      code: "reference.dialogue-operation.character",
      family: "reference", owner: "dialogue", path: `${path}.character`,
      message: `Character '${operation.character}' does not exist.`,
    });
  }
  if (operation.type === "set-trust") {
    if (!hasOwn(project.characters, operation.towards)) {
      diagnostics.push({
        code: "reference.relationship.character",
        family: "reference", owner: "dialogue", path: `${path}.towards`,
        message: `Character '${operation.towards}' does not exist.`,
      });
    } else if (!project.characters[operation.character]?.dialogue?.relationships?.[operation.towards]) {
      diagnostics.push({
        code: "reference.relationship.missing",
        family: "reference", owner: "dialogue", path,
        message: `Relationship from '${operation.character}' towards '${operation.towards}' is not declared.`,
      });
    }
    if (!isQualitativeLevel(operation.trust)) {
      diagnostics.push({
        code: "definition.relationship.trust",
        family: "definition", owner: "dialogue", path: `${path}.trust`,
        message: "Relationship Trust must be low, medium or high.",
      });
    }
  } else if (operation.state !== null && !isDialogueState(operation.state)) {
    diagnostics.push({
      code: "definition.dialogue.state",
      family: "definition", owner: "dialogue", path: `${path}.state`,
      message: "Dialogue State must be calm, afraid, angry or drunk.",
    });
  }
  return diagnostics;
}

/** Validates the static references of one Character Knowledge operation. */
export function validateLearnNarrativeFactOperation(
  operation: LearnNarrativeFactOperation,
  path: string,
  project: KnowledgeDrivenDialogueProjectView,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (!hasOwn(project.characters, operation.character)) {
    diagnostics.push({
      code: "reference.character-knowledge.character",
      family: "reference",
      owner: "dialogue",
      path: `${path}.character`,
      message: `Character '${operation.character}' does not exist.`,
    });
  }
  if (!hasOwn(project.narrativeFacts, operation.factId)) {
    diagnostics.push({
      code: "reference.character-knowledge.fact",
      family: "reference",
      owner: "dialogue",
      path: `${path}.factId`,
      message: `Narrative Fact '${operation.factId}' does not exist.`,
    });
  }
  return diagnostics;
}

/** Reports capability-owned diagnostics for Narrative Facts and initial Character Knowledge. */
export function validateKnowledgeDrivenDialogueProject(
  project: KnowledgeDrivenDialogueProjectView,
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];

  for (const [factId, fact] of Object.entries(project.narrativeFacts)) {
    if (!factId.trim()) {
      diagnostics.push({
        code: "definition.narrative-fact.identity",
        family: "definition",
        owner: "dialogue",
        path: "narrativeFacts",
        message: "A Narrative Fact registry key cannot be empty.",
      });
    }
    if (typeof fact.proposition !== "string" || !fact.proposition.trim()) {
      diagnostics.push({
        code: "definition.narrative-fact.proposition",
        family: "definition",
        owner: "dialogue",
        path: `narrativeFacts.${factId}.proposition`,
        message: "A Narrative Fact proposition cannot be empty.",
      });
    }
  }

  for (const [characterId, character] of Object.entries(project.characters)) {
    const basePath = `characters.${characterId}.dialogue`;
    const dialogue = character.dialogue as unknown;
    if (dialogue === undefined) continue;
    if (!isRecord(dialogue)) {
      diagnostics.push(profileDiagnostic(
        "profile",
        basePath,
        "A Dialogue Profile must be an object.",
      ));
      continue;
    }
    const seen = new Set<string>();
    const knowledgeEntries = dialogue.knowledge;
    if (!Array.isArray(knowledgeEntries)) {
      diagnostics.push({
        code: "definition.character-knowledge.collection",
        family: "definition", owner: "dialogue", path: `${basePath}.knowledge`,
        message: "Character Knowledge must be an array.",
      });
    }
    for (const [index, knowledge] of (Array.isArray(knowledgeEntries) ? knowledgeEntries : []).entries()) {
      const itemPath = `${basePath}.knowledge[${index}]`;
      if (!isRecord(knowledge)) {
        diagnostics.push({
          code: "definition.character-knowledge.item",
          family: "definition", owner: "dialogue", path: itemPath,
          message: "A Character Knowledge entry must be an object.",
        });
        continue;
      }
      const path = `${itemPath}.factId`;
      if (typeof knowledge.factId !== "string" ||
          !hasOwn(project.narrativeFacts, knowledge.factId)) {
        diagnostics.push({
          code: "reference.character-knowledge.fact",
          family: "reference",
          owner: "dialogue",
          path,
          message: `Narrative Fact '${String(knowledge.factId)}' does not exist.`,
        });
      }
      if (!validDisclosure(knowledge.disclosure, project.variables)) {
        diagnostics.push({
          code: "definition.character-knowledge.disclosure",
          family: "definition",
          owner: "dialogue",
          path: `${itemPath}.disclosure`,
          message: "Character Knowledge Disclosure must be open, guarded by Trust or a Game Variable, or secret with a Game Variable unlock.",
        });
      }
      if (typeof knowledge.factId === "string" && seen.has(knowledge.factId)) {
        diagnostics.push({
          code: "definition.character-knowledge.duplicate",
          family: "definition",
          owner: "dialogue",
          path,
          message: `Character Knowledge already references Narrative Fact '${knowledge.factId}'.`,
        });
      }
      if (typeof knowledge.factId === "string") seen.add(knowledge.factId);
    }
    validateQualitativeProfile(dialogue as unknown as CharacterDialogueDefinition, basePath, diagnostics);
    const relationships = dialogue.relationships;
    if (relationships !== undefined && !isRecord(relationships)) {
      diagnostics.push({
        code: "definition.relationship.collection",
        family: "definition", owner: "dialogue", path: `${basePath}.relationships`,
        message: "Relationships must be an object indexed by Character identity.",
      });
    }
    for (const [targetId, relationship] of Object.entries(
      isRecord(relationships) ? relationships : {},
    )) {
      const path = `${basePath}.relationships.${targetId}`;
      if (!hasOwn(project.characters, targetId)) {
        diagnostics.push({
          code: "reference.relationship.character",
          family: "reference", owner: "dialogue", path,
          message: `Character '${targetId}' does not exist.`,
        });
      }
      if (!isRecord(relationship) || !hasExactKeys(relationship, ["trust"]) ||
          !isQualitativeLevel(relationship.trust)) {
        diagnostics.push({
          code: "definition.relationship.trust",
          family: "definition", owner: "dialogue", path: `${path}.trust`,
          message: "Relationship Trust must be low, medium or high.",
        });
      }
    }
  }

  return diagnostics;
}

function validDisclosure(
  value: unknown,
  variables: Readonly<Record<string, boolean>>,
): value is Disclosure {
  if (!isRecord(value) || typeof value.level !== "string") return false;
  if (value.level === "open") return hasExactKeys(value, ["level"]);
  if (!hasExactKeys(value, ["level", "when"]) || !isRecord(value.when)) return false;
  if (value.level === "guarded" && hasExactKeys(value.when, ["trustAtLeast"])) {
    return isQualitativeLevel(value.when.trustAtLeast);
  }
  if ((value.level === "guarded" || value.level === "secret") &&
      hasExactKeys(value.when, ["variable", "equals"])) {
    return typeof value.when.variable === "string" && hasOwn(variables, value.when.variable) &&
      typeof value.when.equals === "boolean";
  }
  return false;
}

function validateQualitativeProfile(
  dialogue: CharacterDialogueDefinition,
  path: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  if (dialogue.biography !== undefined &&
      (typeof dialogue.biography !== "string" || !dialogue.biography.trim())) {
    diagnostics.push(profileDiagnostic("biography", `${path}.biography`, "Biography must be non-empty text."));
  }
  if (dialogue.personality !== undefined &&
      (!isRecord(dialogue.personality) ||
       !hasExactKeys(dialogue.personality, ["talkativeness", "honesty", "discretion", "suspiciousness"]) ||
       !Object.values(dialogue.personality).every(isQualitativeLevel))) {
    diagnostics.push(profileDiagnostic("personality", `${path}.personality`, "Personality traits must be low, medium or high."));
  }
  if (dialogue.behavior !== undefined &&
      (!isRecord(dialogue.behavior) || !hasExactKeys(dialogue.behavior, ["withholding"]) ||
       !["withhold", "evade", "refuse"].includes(dialogue.behavior.withholding as string))) {
    diagnostics.push(profileDiagnostic("behavior", `${path}.behavior`, "Dialogue Behavior withholding must be withhold, evade or refuse."));
  }
  if (dialogue.voice !== undefined &&
      (!isRecord(dialogue.voice) || !hasExactKeys(dialogue.voice, ["verbosity", "tone", "vocabulary"]) ||
       !["short", "medium", "long"].includes(dialogue.voice.verbosity as string) ||
       !["warm", "neutral", "dry"].includes(dialogue.voice.tone as string) ||
       !["simple", "ordinary", "formal"].includes(dialogue.voice.vocabulary as string))) {
    diagnostics.push(profileDiagnostic("voice", `${path}.voice`, "Voice must use the qualitative verbosity, tone and vocabulary values."));
  }
  if (dialogue.state !== undefined && !["calm", "afraid", "angry", "drunk"].includes(dialogue.state)) {
    diagnostics.push(profileDiagnostic("state", `${path}.state`, "Dialogue State must be calm, afraid, angry or drunk."));
  }
}

function profileDiagnostic(
  subject: string,
  path: string,
  message: string,
): AuthoringDiagnostic {
  return {
    code: `definition.dialogue.${subject}`,
    family: "definition", owner: "dialogue", path, message,
  };
}

function isQualitativeLevel(value: unknown): value is QualitativeLevel {
  return value === "low" || value === "medium" || value === "high";
}

function isDialogueState(value: unknown): value is DialogueState {
  return value === "calm" || value === "afraid" || value === "angry" || value === "drunk";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(value: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return sameKeys(value, Object.fromEntries(keys.map((key) => [key, true])));
}

function sameKeys(left: Record<string, unknown>, right: object): boolean {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) => key === rightKeys[index]);
}
