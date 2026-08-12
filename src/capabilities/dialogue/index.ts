import type { AuthoringDiagnostic } from "../game-project";
import type { InteractionCondition } from "../interaction";

/** One true canonical proposition identified by its Narrative Fact registry key. */
export interface NarrativeFactDefinition {
  readonly proposition: string;
}

/** One non-canonical proposition identified by its Claim registry key. */
export interface ClaimDefinition {
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

/** One authored false account used in place of a concealed Narrative Fact. */
export interface CoverStoryDefinition {
  readonly concealsFactId: string;
  readonly claimId: string;
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

/** Authored transition from exploratory Conversation to an exact Sequence. */
export interface ConversationHandoffDefinition {
  readonly when: InteractionCondition;
  readonly sequence: string;
  readonly after: "close" | "resume";
}

/** Optional Knowledge-Driven Dialogue data authored beside a Character's World definition. */
export interface CharacterDialogueDefinition {
  readonly biography?: string;
  readonly personality?: PersonalityDefinition;
  readonly behavior?: DialogueBehaviorDefinition;
  readonly voice?: VoiceDefinition;
  readonly state?: DialogueState;
  readonly knowledge: readonly CharacterKnowledgeDefinition[];
  readonly coverStories?: readonly CoverStoryDefinition[];
  readonly relationships?: Readonly<Record<string, RelationshipDefinition>>;
  readonly handoffs?: readonly ConversationHandoffDefinition[];
}

/** Maximum Player speech accepted by one Dialogue Turn. */
export const dialogueInputMaxLength = 500;

/** One Narrative Fact offered to interpretation without granting state authority. */
export interface DialogueFactCandidate {
  readonly id: string;
  readonly proposition: string;
}

/** One Engine-authorised Claim offered only for Cover Story verbalisation. */
export interface DialogueClaimCandidate {
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
export type DialogueInterpretation =
  | { readonly factId: string }
  | {
      readonly factId: null;
      readonly reason: "ambiguous" | "no-relevant-fact";
    };

/** Engine-selected semantic approach for one Dialogue Turn. */
export type ResponseStrategy = "answer" | "withhold" | "evade" | "refuse" | "clarify"
  | "cover-story";

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
  readonly claim?: DialogueClaimCandidate;
  readonly profile: DialoguePortrayalProfile;
}

/** Transient lifecycle context shared by both provider phases of one Dialogue Turn. */
export interface DialogueTurnContext {
  readonly turnId: string;
  readonly signal: AbortSignal;
}

/** Provider-agnostic seam between Fondale and generated dialogue adapters. */
export interface DialogueProvider {
  interpret(
    request: DialogueInterpretationRequest,
    context: DialogueTurnContext,
  ): Promise<DialogueInterpretation>;
  verbalize(
    request: DialogueVerbalizationRequest,
    context: DialogueTurnContext,
  ): Promise<string>;
  reset(): Promise<void>;
}

/** One deterministic deferred result configured on the Fake Dialogue Provider. */
export interface FakeDialoguePendingOutcome<T> {
  readonly outcome: "pending";
  readonly value: T;
  readonly ignoreCancellation?: boolean;
}

/** One deterministic rejection configured on the Fake Dialogue Provider. */
export interface FakeDialogueFailureOutcome {
  readonly outcome: "failure";
  readonly message: string;
}

type FakeDialogueOutcome<T> = T | FakeDialoguePendingOutcome<T> | FakeDialogueFailureOutcome;

interface PendingFakeDialogueControl {
  readonly release: () => void;
  readonly reject: (cause: Error) => void;
  readonly cancel?: () => void;
}

/** Deterministic, dependency-free Dialogue Provider for tests and technical fixtures. */
export class FakeDialogueProvider implements DialogueProvider {
  private readonly pending = new Map<string, PendingFakeDialogueControl>();
  private resets = 0;

  constructor(private readonly responses: {
    readonly interpretations: Readonly<Record<
      string,
      FakeDialogueOutcome<
        string | null | { readonly reason: "ambiguous" | "no-relevant-fact" }
      >
    >>;
    readonly verbalizations: Readonly<Record<string, FakeDialogueOutcome<string>>>;
  }) {}

  async interpret(
    request: DialogueInterpretationRequest,
    context: DialogueTurnContext,
  ): Promise<DialogueInterpretation> {
    if (!hasOwn(this.responses.interpretations, request.playerInput)) {
      throw new Error("Fake Dialogue Provider has no matching interpretation.");
    }
    const interpretation = await this.resolveOutcome(
      this.responses.interpretations[request.playerInput]!,
      context,
    );
    if (typeof interpretation === "string") return Promise.resolve({ factId: interpretation });
    return Promise.resolve({
      factId: null,
      reason: interpretation?.reason ?? "ambiguous",
    });
  }

  verbalize(
    request: DialogueVerbalizationRequest,
    context: DialogueTurnContext,
  ): Promise<string> {
    const responseKey = request.fact?.id ?? request.claim?.id ?? request.strategy;
    if (!hasOwn(this.responses.verbalizations, responseKey)) {
      return Promise.reject(new Error("Fake Dialogue Provider has no matching verbalization."));
    }
    return this.resolveOutcome(this.responses.verbalizations[responseKey]!, context);
  }

  reset(): Promise<void> {
    this.resets += 1;
    for (const [turnId, pending] of this.pending) {
      pending.cancel?.();
      pending.reject(new Error("Dialogue Provider memory was reset."));
      this.pending.delete(turnId);
    }
    return Promise.resolve();
  }

  /** Transient turn identities currently held by a configured pending outcome. */
  pendingTurnIds(): readonly string[] {
    return [...this.pending.keys()];
  }

  /** Releases one configured pending outcome, including a deliberately late result. */
  release(turnId: string): boolean {
    const pending = this.pending.get(turnId);
    if (!pending) return false;
    pending.cancel?.();
    this.pending.delete(turnId);
    pending.release();
    return true;
  }

  /** Number of provider-memory resets observed by this deterministic adapter. */
  resetCount(): number {
    return this.resets;
  }

  private resolveOutcome<T>(
    outcome: FakeDialogueOutcome<T>,
    context: DialogueTurnContext,
  ): Promise<T> {
    if (isFakeDialogueFailure(outcome)) return Promise.reject(new Error(outcome.message));
    if (!isFakeDialoguePending(outcome)) return Promise.resolve(outcome);
    return new Promise<T>((resolve, reject) => {
      if (context.signal.aborted && !outcome.ignoreCancellation) {
        reject(new Error("Dialogue Turn was cancelled."));
        return;
      }
      const cancel = outcome.ignoreCancellation
        ? undefined
        : () => {
            this.pending.delete(context.turnId);
            reject(new Error("Dialogue Turn was cancelled."));
          };
      if (cancel) context.signal.addEventListener("abort", cancel, { once: true });
      this.pending.set(context.turnId, {
        release: () => resolve(outcome.value),
        reject,
        ...(cancel ? {
          cancel: () => context.signal.removeEventListener("abort", cancel),
        } : {}),
      });
    });
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

/** Game Operation that remembers one Character communicating a declared Claim. */
export interface RecordTestimonyOperation {
  readonly type: "record-testimony";
  readonly speaker: string;
  readonly listener: string;
  readonly concealsFactId: string;
  readonly claimId: string;
}

/** Game Operations whose policy belongs to Knowledge-Driven Dialogue. */
export type DialogueGameOperation = LearnNarrativeFactOperation
  | SetTrustOperation
  | SetDialogueStateOperation
  | RecordTestimonyOperation;

/** @internal Canonical Character Knowledge indexed by Character identity. */
export type CharacterKnowledgeState = Record<string, string[]>;

/** @internal Directional Relationship values indexed by source then target Character. */
export type RelationshipState = Record<string, Record<string, { trust: Trust }>>;

/** @internal Optional qualitative Dialogue State indexed by Character identity. */
export type CharacterDialogueState = Record<string, DialogueState | null>;

/** One canonical remembered Claim, without generated wording or truth authority. */
export interface Testimony {
  readonly speaker: string;
  readonly listener: string;
  readonly claimId: string;
}

/** @internal Canonical state owned by Knowledge-Driven Dialogue. */
export interface KnowledgeDrivenDialogueState {
  readonly characterKnowledge: CharacterKnowledgeState;
  readonly relationships: RelationshipState;
  readonly dialogueStates: CharacterDialogueState;
  readonly testimonies: Testimony[];
}

/** @internal Narrow authored view needed by Knowledge-Driven Dialogue validation. */
export interface KnowledgeDrivenDialogueProjectView {
  readonly narrativeFacts: Readonly<Record<string, NarrativeFactDefinition>>;
  readonly claims?: Readonly<Record<string, ClaimDefinition>>;
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
  handoff(
    character: string,
    conditionMatches: (condition: InteractionCondition) => boolean,
  ): ConversationHandoffDefinition | undefined;
  hasResumableHandoff(character: string, sequence: string): boolean;
  respond(
    state: KnowledgeDrivenDialogueState & { readonly variables: Record<string, boolean> },
    input: {
      readonly speaker: string;
      readonly listener: string;
      readonly playerInput: string;
    },
    provider: DialogueProvider,
    context?: DialogueTurnContext,
  ): Promise<{
    readonly playerInput: string;
    readonly response: string;
    readonly operation?: LearnNarrativeFactOperation | RecordTestimonyOperation;
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
        testimonies: [],
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
    handoff(
      character: string,
      conditionMatches: (condition: InteractionCondition) => boolean,
    ) {
      const handoff = project.characters[character]?.dialogue?.handoffs?.find(({ when }) =>
        conditionMatches(when)
      );
      return handoff ? structuredClone(handoff) : undefined;
    },
    hasResumableHandoff(character: string, sequence: string) {
      return project.characters[character]?.dialogue?.handoffs?.some((handoff) =>
        handoff.sequence === sequence && handoff.after === "resume"
      ) ?? false;
    },
    async respond(
      state: KnowledgeDrivenDialogueState & { readonly variables: Record<string, boolean> },
      input: {
        readonly speaker: string;
        readonly listener: string;
        readonly playerInput: string;
      },
      provider: DialogueProvider,
      context: DialogueTurnContext = {
        turnId: "unmanaged-dialogue-turn",
        signal: new AbortController().signal,
      },
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
      const interpretation = await abortable(provider.interpret(request, context), context.signal);
      if (!isValidInterpretation(interpretation)) {
        throw new Error("Dialogue Provider selected an unknown Narrative Fact.");
      }
      const profile = portrayalProfile(
        project.characters[input.speaker]!.dialogue!,
        state.dialogueStates[input.speaker] ?? null,
      );
      let strategy: ResponseStrategy;
      let fact: DialogueFactCandidate | undefined;
      let claim: DialogueClaimCandidate | undefined;
      let concealedFactId: string | undefined;
      if (interpretation.factId === null) {
        strategy = interpretation.reason === "ambiguous"
          ? "clarify"
          : project.characters[input.speaker]!.dialogue!.behavior?.withholding ?? "withhold";
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
          const coverStory = project.characters[input.speaker]!.dialogue!.coverStories?.find(
            ({ concealsFactId }) => concealsFactId === candidate.id,
          );
          if (coverStory) {
            const claimDefinition = project.claims?.[coverStory.claimId];
            if (!claimDefinition) throw new Error("Cover Story selected an unknown Claim.");
            strategy = "cover-story";
            claim = Object.freeze({
              id: coverStory.claimId,
              proposition: claimDefinition.proposition,
            });
            concealedFactId = candidate.id;
          } else {
            strategy = project.characters[input.speaker]!.dialogue!.behavior?.withholding ?? "withhold";
          }
        }
      }
      const response = await abortable(provider.verbalize(Object.freeze({
        playerInput,
        speaker: input.speaker,
        listener: input.listener,
        strategy,
        ...(fact ? { fact } : {}),
        ...(claim ? { claim } : {}),
        profile,
      }), context), context.signal);
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
        } : claim && concealedFactId ? {
          operation: Object.freeze({
            type: "record-testimony" as const,
            speaker: input.speaker,
            listener: input.listener,
            concealsFactId: concealedFactId,
            claimId: claim.id,
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
      if (operation.type === "record-testimony") {
        if (!hasOwn(project.characters, operation.speaker)) {
          throw new Error(`Unknown speaking Character '${operation.speaker}'.`);
        }
        if (!hasOwn(project.characters, operation.listener)) {
          throw new Error(`Unknown listening Character '${operation.listener}'.`);
        }
        if (!hasOwn(project.claims ?? {}, operation.claimId)) {
          throw new Error(`Unknown Claim '${operation.claimId}'.`);
        }
        if (!hasCoverStory(
          project,
          operation.speaker,
          operation.claimId,
          operation.concealsFactId,
        )) {
          throw new Error("The Testimony does not match an authored Cover Story.");
        }
        if (state.testimonies.some((testimony) =>
          testimony.speaker === operation.speaker &&
          testimony.listener === operation.listener &&
          testimony.claimId === operation.claimId
        )) return state;
        return {
          ...state,
          testimonies: [...state.testimonies, {
            speaker: operation.speaker,
            listener: operation.listener,
            claimId: operation.claimId,
          }].sort(compareTestimony),
        };
      }
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
          !hasExactKeys(value, ["characterKnowledge", "relationships", "dialogueStates", "testimonies"]) ||
          !isRecord(value.characterKnowledge) || !sameKeys(value.characterKnowledge, project.characters) ||
          !isRecord(value.relationships) || !sameKeys(value.relationships, project.characters) ||
          !isRecord(value.dialogueStates) || !sameKeys(value.dialogueStates, project.characters) ||
          !Array.isArray(value.testimonies)) return false;
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
      const validDialogueStates = Object.entries(value.dialogueStates).every(([, dialogueState]) =>
        dialogueState === null || isDialogueState(dialogueState)
      );
      if (!validDialogueStates) return false;
      const testimonies: Testimony[] = [];
      for (const testimony of value.testimonies) {
        if (!isRecord(testimony) || !hasExactKeys(testimony, ["speaker", "listener", "claimId"]) ||
            typeof testimony.speaker !== "string" || !hasOwn(project.characters, testimony.speaker) ||
            typeof testimony.listener !== "string" || !hasOwn(project.characters, testimony.listener) ||
            typeof testimony.claimId !== "string" || !hasOwn(project.claims ?? {}, testimony.claimId) ||
            !hasCoverStory(project, testimony.speaker, testimony.claimId)) {
          return false;
        }
        if (testimonies.some((remembered) =>
          remembered.speaker === testimony.speaker &&
          remembered.listener === testimony.listener &&
          remembered.claimId === testimony.claimId
        )) return false;
        testimonies.push({
          speaker: testimony.speaker,
          listener: testimony.listener,
          claimId: testimony.claimId,
        });
      }
      return testimonies.every((testimony, index) =>
        index === 0 || compareTestimony(testimonies[index - 1]!, testimony) < 0
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

function isValidInterpretation(value: unknown): value is DialogueInterpretation {
  if (!isRecord(value)) return false;
  if (typeof value.factId === "string") return hasExactKeys(value, ["factId"]);
  return value.factId === null && hasExactKeys(value, ["factId", "reason"]) &&
    (value.reason === "ambiguous" || value.reason === "no-relevant-fact");
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
    operation.type === "set-trust" || operation.type === "set-dialogue-state" ||
    operation.type === "record-testimony";
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
  if (operation.type === "record-testimony") {
    const diagnostics: AuthoringDiagnostic[] = [];
    for (const [role, character] of [
      ["speaker", operation.speaker],
      ["listener", operation.listener],
    ] as const) {
      if (!hasOwn(project.characters, character)) {
        diagnostics.push({
          code: `reference.testimony.${role}`,
          family: "reference", owner: "dialogue", path: `${path}.${role}`,
          message: `Character '${character}' does not exist.`,
        });
      }
    }
    if (!hasOwn(project.claims ?? {}, operation.claimId)) {
      diagnostics.push({
        code: "reference.testimony.claim",
        family: "reference", owner: "dialogue", path: `${path}.claimId`,
        message: `Claim '${operation.claimId}' does not exist.`,
      });
    }
    if (hasOwn(project.characters, operation.speaker) && !hasCoverStory(
      project,
      operation.speaker,
      operation.claimId,
      operation.concealsFactId,
    )) {
      diagnostics.push({
        code: "reference.testimony.cover-story",
        family: "reference", owner: "dialogue", path,
        message: "Testimony must match a Cover Story declared by its speaker.",
      });
    }
    return diagnostics;
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

  for (const [claimId, claim] of Object.entries(project.claims ?? {})) {
    if (!claimId.trim()) {
      diagnostics.push({
        code: "definition.claim.identity",
        family: "definition",
        owner: "dialogue",
        path: "claims",
        message: "A Claim registry key cannot be empty.",
      });
    }
    if (!isRecord(claim) || !hasExactKeys(claim, ["proposition"]) ||
        typeof claim.proposition !== "string" || !claim.proposition.trim()) {
      diagnostics.push({
        code: "definition.claim.proposition",
        family: "definition",
        owner: "dialogue",
        path: `claims.${claimId}.proposition`,
        message: "A Claim proposition cannot be empty.",
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
    const coverStories = dialogue.coverStories;
    if (coverStories !== undefined && !Array.isArray(coverStories)) {
      diagnostics.push({
        code: "definition.cover-story.collection",
        family: "definition", owner: "dialogue", path: `${basePath}.coverStories`,
        message: "Cover Stories must be an array.",
      });
    }
    const concealedFacts = new Set<string>();
    for (const [index, coverStory] of (
      Array.isArray(coverStories) ? coverStories : []
    ).entries()) {
      const itemPath = `${basePath}.coverStories[${index}]`;
      if (!isRecord(coverStory) ||
          !hasExactKeys(coverStory, ["concealsFactId", "claimId"])) {
        diagnostics.push({
          code: "definition.cover-story.item",
          family: "definition", owner: "dialogue", path: itemPath,
          message: "A Cover Story must associate one concealed Narrative Fact with one Claim.",
        });
        continue;
      }
      const concealsFactId = coverStory.concealsFactId;
      const claimId = coverStory.claimId;
      const knowledge = typeof concealsFactId === "string"
        ? (Array.isArray(knowledgeEntries) ? knowledgeEntries : []).find(
            (entry) => isRecord(entry) && entry.factId === concealsFactId,
          )
        : undefined;
      if (typeof concealsFactId !== "string" ||
          !hasOwn(project.narrativeFacts, concealsFactId)) {
        diagnostics.push({
          code: "reference.cover-story.fact",
          family: "reference", owner: "dialogue", path: `${itemPath}.concealsFactId`,
          message: `Narrative Fact '${String(concealsFactId)}' does not exist.`,
        });
      } else if (!knowledge) {
        diagnostics.push({
          code: "reference.cover-story.knowledge",
          family: "reference", owner: "dialogue", path: `${itemPath}.concealsFactId`,
          message: `Character '${characterId}' does not know Narrative Fact '${concealsFactId}'.`,
        });
      } else if (knowledge && isRecord(knowledge.disclosure) &&
                 knowledge.disclosure.level === "open") {
        diagnostics.push({
          code: "definition.cover-story.disclosure",
          family: "definition", owner: "dialogue", path: `${itemPath}.concealsFactId`,
          message: "A Cover Story can conceal only guarded or secret Character Knowledge.",
        });
      }
      if (typeof claimId !== "string" || !hasOwn(project.claims ?? {}, claimId)) {
        diagnostics.push({
          code: "reference.cover-story.claim",
          family: "reference", owner: "dialogue", path: `${itemPath}.claimId`,
          message: `Claim '${String(claimId)}' does not exist.`,
        });
      }
      if (typeof concealsFactId === "string" && concealedFacts.has(concealsFactId)) {
        diagnostics.push({
          code: "definition.cover-story.duplicate",
          family: "definition", owner: "dialogue", path: `${itemPath}.concealsFactId`,
          message: `A Cover Story already conceals Narrative Fact '${concealsFactId}'.`,
        });
      }
      if (typeof concealsFactId === "string") concealedFacts.add(concealsFactId);
    }
    const handoffs = dialogue.handoffs;
    if (handoffs !== undefined && !Array.isArray(handoffs)) {
      diagnostics.push({
        code: "definition.dialogue.handoffs",
        family: "definition",
        owner: "dialogue",
        path: `${basePath}.handoffs`,
        message: "Conversation handoffs must be an array.",
      });
    }
    for (const [index, handoff] of (
      Array.isArray(handoffs) ? handoffs : []
    ).entries()) {
      if (!isRecord(handoff) ||
          !hasExactKeys(handoff, ["when", "sequence", "after"]) ||
          typeof handoff.sequence !== "string" || !handoff.sequence.trim() ||
          (handoff.after !== "close" && handoff.after !== "resume")) {
        diagnostics.push({
          code: "definition.dialogue.handoff",
          family: "definition",
          owner: "dialogue",
          path: `${basePath}.handoffs[${index}]`,
          message: "A Conversation handoff requires a condition, a named Sequence and an explicit close or resume outcome.",
        });
      }
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
  if (dialogue.state !== undefined && !isDialogueState(dialogue.state)) {
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

function hasCoverStory(
  project: KnowledgeDrivenDialogueProjectView,
  speaker: string,
  claimId: string,
  concealsFactId?: string,
): boolean {
  return project.characters[speaker]?.dialogue?.coverStories?.some((coverStory) =>
    coverStory.claimId === claimId &&
    (concealsFactId === undefined || coverStory.concealsFactId === concealsFactId)
  ) ?? false;
}

function compareTestimony(left: Testimony, right: Testimony): number {
  return left.speaker.localeCompare(right.speaker) ||
    left.listener.localeCompare(right.listener) ||
    left.claimId.localeCompare(right.claimId);
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(new Error("Dialogue Turn was cancelled."));
  return new Promise<T>((resolve, reject) => {
    const cancel = () => reject(new Error("Dialogue Turn was cancelled."));
    signal.addEventListener("abort", cancel, { once: true });
    promise.then((value) => {
      signal.removeEventListener("abort", cancel);
      resolve(value);
    }, (cause) => {
      signal.removeEventListener("abort", cancel);
      reject(cause);
    });
  });
}

function isFakeDialoguePending<T>(
  outcome: FakeDialogueOutcome<T>,
): outcome is FakeDialoguePendingOutcome<T> {
  return isRecord(outcome) && outcome.outcome === "pending";
}

function isFakeDialogueFailure<T>(
  outcome: FakeDialogueOutcome<T>,
): outcome is FakeDialogueFailureOutcome {
  return isRecord(outcome) && outcome.outcome === "failure";
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
