import type { AuthoringDiagnostic } from "../game-project";

/** One true canonical proposition identified by its Narrative Fact registry key. */
export interface NarrativeFactDefinition {
  readonly proposition: string;
}

/** The initial Disclosure supported before guarded and secret policy is introduced. */
export interface OpenDisclosure {
  readonly level: "open";
}

/** One Character-specific reference to a declared Narrative Fact. */
export interface CharacterKnowledgeDefinition {
  readonly factId: string;
  readonly disclosure: OpenDisclosure;
}

/** Optional Knowledge-Driven Dialogue data authored beside a Character's World definition. */
export interface CharacterDialogueDefinition {
  readonly knowledge: readonly CharacterKnowledgeDefinition[];
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
  readonly factId: string;
}

/** Engine-authorised semantic payload for a Dialogue Provider to express. */
export interface DialogueVerbalizationRequest {
  readonly playerInput: string;
  readonly speaker: string;
  readonly listener: string;
  readonly fact: DialogueFactCandidate;
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
    readonly interpretations: Readonly<Record<string, string>>;
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
    if (!hasOwn(this.responses.verbalizations, request.fact.id)) {
      return Promise.reject(new Error("Fake Dialogue Provider has no matching verbalization."));
    }
    const response = this.responses.verbalizations[request.fact.id]!;
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

/** @internal Canonical Character Knowledge indexed by Character identity. */
export type CharacterKnowledgeState = Record<string, string[]>;

/** @internal Narrow authored view needed by Knowledge-Driven Dialogue validation. */
export interface KnowledgeDrivenDialogueProjectView {
  readonly narrativeFacts: Readonly<Record<string, NarrativeFactDefinition>>;
  readonly characters: Readonly<Record<string, {
    readonly dialogue?: CharacterDialogueDefinition;
  }>>;
}

/** @internal Character Knowledge lifecycle behind the capability interface. */
export interface KnowledgeDrivenDialogue {
  initialState(): CharacterKnowledgeState;
  requiresProvider(): boolean;
  hasProfile(character: string): boolean;
  respond(
    state: CharacterKnowledgeState,
    input: {
      readonly speaker: string;
      readonly listener: string;
      readonly playerInput: string;
    },
    provider: DialogueProvider,
  ): Promise<{
    readonly playerInput: string;
    readonly response: string;
    readonly operation: LearnNarrativeFactOperation;
  }>;
  learn(
    state: CharacterKnowledgeState,
    operation: LearnNarrativeFactOperation,
  ): CharacterKnowledgeState;
  isValidState(value: unknown): value is CharacterKnowledgeState;
}

/** Creates the in-process Knowledge-Driven Dialogue module for one compiled Game Project. */
export function createKnowledgeDrivenDialogue(
  project: KnowledgeDrivenDialogueProjectView,
): KnowledgeDrivenDialogue {
  return Object.freeze({
    initialState() {
      return Object.fromEntries(Object.entries(project.characters).map(([characterId, character]) => [
        characterId,
        character.dialogue?.knowledge.map(({ factId }) => factId) ?? [],
      ]));
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
      state: CharacterKnowledgeState,
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
      if (!hasOwn(project.characters, input.listener) || state[input.listener] === undefined) {
        throw new Error(`Unknown listening Character '${input.listener}'.`);
      }
      const knownFactIds = state[input.speaker];
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
      if (!isRecord(interpretation) || typeof interpretation.factId !== "string" ||
          !candidates.some(({ id }) => id === interpretation.factId)) {
        throw new Error("Dialogue Provider selected an unknown Narrative Fact.");
      }
      const fact = candidates.find(({ id }) => id === interpretation.factId)!;
      const response = await provider.verbalize(Object.freeze({
        playerInput,
        speaker: input.speaker,
        listener: input.listener,
        fact,
      }));
      if (typeof response !== "string" || !response.trim()) {
        throw new Error("Dialogue Provider returned an empty Line.");
      }
      return Object.freeze({
        playerInput,
        response: response.trim(),
        operation: Object.freeze({
          type: "learn-narrative-fact" as const,
          character: input.listener,
          factId: fact.id,
        }),
      });
    },
    learn(state: CharacterKnowledgeState, operation: LearnNarrativeFactOperation) {
      if (!hasOwn(project.characters, operation.character)) {
        throw new Error(`Unknown Character '${operation.character}'.`);
      }
      if (!hasOwn(project.narrativeFacts, operation.factId)) {
        throw new Error(`Unknown Narrative Fact '${operation.factId}'.`);
      }
      const knownFacts = state[operation.character];
      if (!knownFacts) {
        throw new Error(`Character Knowledge for '${operation.character}' is missing.`);
      }
      if (knownFacts.includes(operation.factId)) return state;
      return {
        ...state,
        [operation.character]: [...knownFacts, operation.factId],
      };
    },
    isValidState(value: unknown): value is CharacterKnowledgeState {
      if (!isRecord(value) || !sameKeys(value, project.characters)) return false;
      return Object.entries(value).every(([characterId, knowledge]) => {
        if (!Array.isArray(knowledge) ||
            !knowledge.every((factId): factId is string =>
              typeof factId === "string" && hasOwn(project.narrativeFacts, factId)
            ) ||
            new Set(knowledge).size !== knowledge.length) return false;
        const initialKnowledge = project.characters[characterId]!.dialogue?.knowledge ?? [];
        return initialKnowledge.every(({ factId }) => knowledge.includes(factId));
      });
    },
  });
}

/** @internal Narrows a Game Operation to the Character Knowledge operation owned here. */
export function isLearnNarrativeFactOperation(
  operation: { readonly type: string },
): operation is LearnNarrativeFactOperation {
  return operation.type === "learn-narrative-fact";
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
    const seen = new Set<string>();
    character.dialogue?.knowledge.forEach((knowledge, index) => {
      const path = `characters.${characterId}.dialogue.knowledge[${index}].factId`;
      if (!hasOwn(project.narrativeFacts, knowledge.factId)) {
        diagnostics.push({
          code: "reference.character-knowledge.fact",
          family: "reference",
          owner: "dialogue",
          path,
          message: `Narrative Fact '${knowledge.factId}' does not exist.`,
        });
      }
      if (!isRecord(knowledge.disclosure) || knowledge.disclosure.level !== "open") {
        diagnostics.push({
          code: "definition.character-knowledge.disclosure",
          family: "definition",
          owner: "dialogue",
          path: `characters.${characterId}.dialogue.knowledge[${index}].disclosure.level`,
          message: "Character Knowledge Disclosure must be open.",
        });
      }
      if (seen.has(knowledge.factId)) {
        diagnostics.push({
          code: "definition.character-knowledge.duplicate",
          family: "definition",
          owner: "dialogue",
          path,
          message: `Character Knowledge already references Narrative Fact '${knowledge.factId}'.`,
        });
      }
      seen.add(knowledge.factId);
    });
  }

  return diagnostics;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(value: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function sameKeys(left: Record<string, unknown>, right: object): boolean {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) => key === rightKeys[index]);
}
