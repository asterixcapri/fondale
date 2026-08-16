import { expect, test } from "@playwright/test";

import * as Fondale from "../src/index";
import {
  AuthoringError,
  HttpDialogueProvider,
  startGame,
  uniformGrid,
  type AnimationDefinition,
  type AnimationFrame,
  type AnimationSheet,
  type AnimationTiming,
  type CharacterDefinition,
  type CharacterAnimationDefinition,
  type CharacterAnimationSheets,
  type CharacterAppearance,
  type CharacterDialogueDefinition,
  type CharacterKnowledgeDefinition,
  type ClaimDefinition,
  type CommandLexicon,
  type DialogueProvider,
  type DialogueHttpRequest,
  type DialogueHttpResponse,
  type DialogueClaimCandidate,
  type DialogueBehaviorDefinition,
  type DialogueGameOperation,
  type DialogueState,
  type DialogueTrustCondition,
  type DialogueTurnContext,
  type DialogueVariableCondition,
  type Disclosure,
  type ConversationAlternativeDefinition,
  type CoverStoryDefinition,
  type DirectionStep,
  type GameProject,
  type LearnNarrativeFactOperation,
  type NarrativeFactDefinition,
  type OpenDisclosure,
  type PersonalityDefinition,
  type RelationshipDefinition,
  type RecordTestimonyOperation,
  type ReflectionRelationship,
  type ReflectionRequest,
  type ReflectionResponse,
  type ReflectionTestimony,
  type ResponseStrategy,
  type SetDialogueStateOperation,
  type SetTrustOperation,
  type Trust,
  type Testimony,
  type VoiceDefinition,
  type HUDTheme,
  type NounDefinition,
  type ObjectDefinition,
  type SaveSnapshot,
  type SceneDefinition,
  type SequenceDefinition,
} from "../src/index";

const scene = {
  background: "opening.png",
  walkableRegion: [
    { x: 0, y: 0 },
    { x: 320, y: 0 },
    { x: 320, y: 180 },
    { x: 0, y: 180 },
  ],
} satisfies SceneDefinition;

const project = {
  identity: "example.typed-project",
  version: "1",
  logicalResolution: { width: 320, height: 180 },
  scenes: { opening: scene },
  initialScene: "opening",
} satisfies GameProject;

const focusedTypes = {
  animationFrame: null as unknown as AnimationFrame,
  animationSheet: null as unknown as AnimationSheet,
  animationTiming: null as unknown as AnimationTiming,
  character: null as unknown as CharacterDefinition,
  characterAnimation: null as unknown as CharacterAnimationDefinition,
  characterAnimationSheets: null as unknown as CharacterAnimationSheets,
  characterAppearance: null as unknown as CharacterAppearance,
  characterDialogue: null as unknown as CharacterDialogueDefinition,
  characterKnowledge: null as unknown as CharacterKnowledgeDefinition,
  claim: null as unknown as ClaimDefinition,
  commandLexicon: null as unknown as CommandLexicon,
  direction: null as unknown as DirectionStep,
  dialogueProvider: null as unknown as DialogueProvider,
  dialogueHttpRequest: null as unknown as DialogueHttpRequest,
  dialogueHttpResponse: null as unknown as DialogueHttpResponse,
  dialogueClaim: null as unknown as DialogueClaimCandidate,
  dialogueBehavior: null as unknown as DialogueBehaviorDefinition,
  dialogueGameOperation: null as unknown as DialogueGameOperation,
  dialogueState: null as unknown as DialogueState,
  dialogueTrustCondition: null as unknown as DialogueTrustCondition,
  dialogueTurnContext: null as unknown as DialogueTurnContext,
  dialogueVariableCondition: null as unknown as DialogueVariableCondition,
  disclosure: null as unknown as Disclosure,
  conversationAlternative: null as unknown as ConversationAlternativeDefinition,
  coverStory: null as unknown as CoverStoryDefinition,
  hudTheme: null as unknown as HUDTheme,
  learnNarrativeFact: null as unknown as LearnNarrativeFactOperation,
  narrativeFact: null as unknown as NarrativeFactDefinition,
  noun: null as unknown as NounDefinition,
  object: null as unknown as ObjectDefinition,
  openDisclosure: null as unknown as OpenDisclosure,
  personality: null as unknown as PersonalityDefinition,
  relationship: null as unknown as RelationshipDefinition,
  recordTestimony: null as unknown as RecordTestimonyOperation,
  reflectionRelationship: null as unknown as ReflectionRelationship,
  reflectionRequest: null as unknown as ReflectionRequest,
  reflectionResponse: null as unknown as ReflectionResponse,
  reflectionTestimony: null as unknown as ReflectionTestimony,
  responseStrategy: null as unknown as ResponseStrategy,
  setDialogueState: null as unknown as SetDialogueStateOperation,
  setTrust: null as unknown as SetTrustOperation,
  trust: null as unknown as Trust,
  testimony: null as unknown as Testimony,
  voice: null as unknown as VoiceDefinition,
  save: null as unknown as SaveSnapshot,
  sequence: null as unknown as SequenceDefinition,
};

void focusedTypes;

// @ts-expect-error Character Animations require an authored back presentation.

const incompleteCharacterAnimation: CharacterAnimationDefinition = { sheets: { left: { image: "left.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "right.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "front.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1 } };
// @ts-expect-error Character Animations require left and right sheets.
const legacyCharacterAnimation: CharacterAnimationDefinition = { sheets: { front: { image: "front.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "back.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1 } };
void incompleteCharacterAnimation;
void legacyCharacterAnimation;
const legacyAnimation: AnimationDefinition = {
  // @ts-expect-error Separate-image frame lists and flat timing have no compatibility path.
  frames: ["one.png", "two.png"],
  framesPerSecond: 1,
};
void legacyAnimation;

test("the root API exposes declarative authoring types without legacy builders", () => {
  expect(project.scenes.opening).toBe(scene);
  expect(uniformGrid({ frameWidth: 2, frameHeight: 3, columns: 1, count: 1 }))
    .toEqual([{ x: 0, y: 0, width: 2, height: 3 }]);
  expect(new HttpDialogueProvider({ endpoint: "/dialogue", sessionId: "session" }))
    .toBeInstanceOf(HttpDialogueProvider);
  for (const removed of [
    "defineGame",
    "defineCharacter",
    "defineObject",
    "defineScene",
    "defineSequence",
    "defineNoun",
    "defineCommandLexicon",
    "defineHUDTheme",
    "validateSaveSnapshot",
  ]) {
    expect(Fondale).not.toHaveProperty(removed);
  }
});

test("startGame reports aggregated project diagnostics before reading the target", async () => {
  let targetReads = 0;
  const options = {
    get target(): HTMLElement {
      targetReads += 1;
      throw new Error("target must remain untouched");
    },
  };

  const promise = startGame(
    {
      ...project,
      identity: " ",
      version: " ",
      initialScene: "missing",
    },
    options,
  );

  await expect(promise).rejects.toMatchObject({
    diagnostics: [
      expect.objectContaining({
        code: "definition.project.identity",
        path: "identity",
      }),
      expect.objectContaining({
        code: "reference.scene.initial",
        path: "initialScene",
      }),
      expect.objectContaining({
        code: "definition.project.version",
        path: "version",
      }),
    ],
  });
  expect(targetReads).toBe(0);
});

test("startGame validates an untrusted Save Snapshot before reading the target", async () => {
  let targetReads = 0;
  const options = {
    snapshot: { formatVersion: 999 },
    get target(): HTMLElement {
      targetReads += 1;
      throw new Error("target must remain untouched");
    },
  };

  const promise = startGame(project, options);
  await expect(promise).rejects.toBeInstanceOf(AuthoringError);
  await expect(promise).rejects.toMatchObject({
    diagnostics: expect.arrayContaining([
      expect.objectContaining({ owner: "save", code: "save.format.version" }),
      expect.objectContaining({ owner: "save", code: "save.state.invalid" }),
    ]),
  });
  expect(targetReads).toBe(0);
});

test("startGame requires a Dialogue Provider before reading the target", async () => {
  let targetReads = 0;
  const dialogueProject = {
    ...project,
    characters: {
      antonio: {
        initialScene: "opening",
        initialGroundPoint: { x: 10, y: 10 },
        initialFacing: "front",
        initialAppearance: "idle",
        appearances: {
          idle: {
            animations: {
              idle: { sheets: { left: { image: "antonio.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, right: { image: "antonio.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, front: { image: "antonio.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) }, back: { image: "antonio.png", frames: Array.from({ length: 1 }, (_, index) => ({ x: index, y: 0, width: 1, height: 1 })) } }, timing: { framesPerSecond: 1, loop: true } },
            },
            roles: { default: "idle" },
          },
        },
        movementSpeed: 60,
        dialogue: { knowledge: [] },
      },
    },
  } satisfies GameProject;
  const promise = startGame(dialogueProject, {
    get target(): HTMLElement {
      targetReads += 1;
      throw new Error("target must remain untouched");
    },
  });

  await expect(promise).rejects.toMatchObject({
    diagnostics: [
      expect.objectContaining({
        code: "environment.dialogue-provider.missing",
        path: "startGame.dialogueProvider",
      }),
    ],
  });
  expect(targetReads).toBe(0);
});
