import {
  Application,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";

import type {
  AvailableHotspot,
  AvailableInventoryNoun,
  AvailablePassage,
  CoreEffect,
  CoreSession,
  GameState,
} from "../capabilities/game-session";
import {
  animationPresentationForSubject,
  appearanceForSubject,
  isImageAnimationFrames,
  type AnimationDefinition,
  type AnimationPresentation,
} from "../capabilities/animation";
import {
  interpretDirectionStep,
  resolveSequencePath,
  secondsToTicks,
  type DirectionStep,
  type DirectionStepInterpretation,
  type DirectedSubject,
} from "../capabilities/sequence";
import {
  characterMotionReachedDestination,
  pointAlongPath,
} from "../capabilities/world";
import type {
  GameProjectData,
  Point,
  SceneryAppearance,
  SequenceStep,
} from "../capabilities/game-project";
import type { Verb } from "../capabilities/interaction";
import type { AuthoringDiagnostic } from "../capabilities/game-project";
import type { SaveSnapshot } from "../capabilities/save";
import { assetUrl, type LoadedAssets } from "./assets";

interface AnimationView {
  readonly sprite: Sprite;
  readonly subject: DirectedSubject;
  readonly path: string;
  presentation: AnimationPresentation;
  direction: "side" | "front" | "back";
}

interface CharacterView extends AnimationView {
  readonly container: Container;
}

const commandPreviewFontSize = "6px";
const commandResponseFontSize = "8px";
const speechFontSize = "9px";
const speechTextShadow = "-2px -2px #000,0 -2px #000,2px -2px #000,-2px 0 #000,2px 0 #000,-2px 2px #000,0 2px #000,2px 2px #000,-1px -1px #000,1px -1px #000,-1px 1px #000,1px 1px #000,3px 3px #000";

export interface BrowserSaveSlot {
  readonly name: string;
  readonly savedAt: string;
  readonly snapshot: SaveSnapshot | unknown;
  readonly compatible: boolean;
  readonly diagnostics: readonly AuthoringDiagnostic[];
}

export interface BrowserSessionControls {
  slots(): readonly BrowserSaveSlot[];
  save(name: string): void;
  load(index: number): { readonly ok: true } | {
    readonly ok: false;
    readonly diagnostics: readonly AuthoringDiagnostic[];
  };
}

/** Realizes committed snapshots without becoming an owner of Game State. */
export class BrowserRenderer {
  private readonly world = new Container();
  private readonly overlay: EngineOverlay;
  private readonly characterViews = new Map<string, CharacterView>();
  private readonly animationViews: AnimationView[] = [];
  private cameraOrigin: Point = { x: 0, y: 0 };
  private readonly directionInterpretations = new WeakMap<GameState, {
    step: DirectionStep;
    interpretation: DirectionStepInterpretation;
  }>();
  private sceneSignature = "";

  constructor(
    private readonly application: Application,
    private readonly frame: HTMLElement,
    private readonly data: GameProjectData,
    private readonly assets: LoadedAssets,
    private readonly core: CoreSession,
    private readonly controls: BrowserSessionControls,
  ) {
    this.world.sortableChildren = true;
    this.overlay = new EngineOverlay(
      frame,
      data,
      assets,
      core,
      controls,
      (character) => this.characterViews.get(character)?.container.getBounds().minY,
      (point) => this.sceneToViewport(point),
    );
    application.stage.addChild(this.world);
    application.canvas.setAttribute("aria-label", "Fondale game world");
    application.canvas.addEventListener("pointerup", this.onPointerUp);
    application.canvas.addEventListener("dblclick", this.onDoubleClick);
    application.canvas.addEventListener("contextmenu", this.onContextMenu);
    application.canvas.addEventListener("pointermove", this.onPointerMove);
    application.canvas.addEventListener("pointerleave", this.onPointerLeave);
  }

  render(state: GameState, effects: readonly CoreEffect[]): void {
    this.frame.dataset.fondaleScene = state.currentScene;
    const movement = [...effects].reverse().find(({ type }) => type === "movement-started");
    if (movement?.type === "movement-started") {
      this.frame.dataset.fondaleMovement = movement.fast ? "fast" : "normal";
    }
    const signature = sceneSignature(state);
    if (signature !== this.sceneSignature) {
      this.sceneSignature = signature;
      this.rebuildWorld(state);
    }
    this.updateCharacters(state);
    this.updateAnimations(state);
    this.world.sortChildren();
    this.cameraOrigin = this.core.camera().origin;
    this.world.position.set(-this.cameraOrigin.x, -this.cameraOrigin.y);
    this.overlay.render(state, effects);
    this.application.renderer.render(this.application.stage);
  }

  destroy(): void {
    this.application.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.application.canvas.removeEventListener("dblclick", this.onDoubleClick);
    this.application.canvas.removeEventListener("contextmenu", this.onContextMenu);
    this.application.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.application.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    this.overlay.destroy();
    this.application.stage.removeChild(this.world);
    this.world.removeChildren();
    this.characterViews.clear();
    this.animationViews.length = 0;
  }

  private rebuildWorld(state: GameState): void {
    this.world.removeChildren();
    this.characterViews.clear();
    this.animationViews.length = 0;
    const scene = this.data.scenes[state.currentScene]!;
    const backgroundTexture = this.assets.textures.get(assetUrl(scene.background))!;
    const background = new Sprite(backgroundTexture);
    background.zIndex = Number.NEGATIVE_INFINITY;
    this.world.addChild(background);

    for (const [sceneryId, scenery] of Object.entries(scene.scenery ?? {})) {
      const selected = state.scenery[state.currentScene]?.[sceneryId] ?? scenery.initialAppearance;
      const appearance = scenery.appearances[selected]!;
      const view = this.createScenery(
        appearance,
        backgroundTexture,
        `scenes.${state.currentScene}.scenery.${sceneryId}.appearances.${selected}`,
        { kind: "scenery", scenery: sceneryId },
        this.animationPresentation(state, { kind: "scenery", scenery: sceneryId }),
      );
      view.label = `scenery:${sceneryId}`;
      view.zIndex = scenery.baseline;
      const directedPosition = this.directedSceneryPoint(state, sceneryId);
      if (directedPosition ?? scenery.position) {
        const position = directedPosition ?? scenery.position!;
        view.position.set(position.x, position.y);
      }
      this.world.addChild(view);
    }

    for (const [objectId, object] of Object.entries(state.objects)) {
      if (object.location.kind !== "scene" || object.location.scene !== state.currentScene) continue;
      const definition = this.data.objects[objectId]!;
      const appearance = definition.appearances[object.appearance]!;
      const view = this.createCharacter(
        this.animationPresentation(state, { kind: "object", object: objectId })!,
        `objects.${objectId}.appearances.${object.appearance}`,
        { kind: "object", object: objectId },
        "front",
      );
      view.container.label = `object:${objectId}`;
      view.container.position.set(object.location.groundPoint.x, object.location.groundPoint.y);
      view.container.zIndex = object.location.groundPoint.y;
      view.container.scale.set(scaleAt(scene.perspectiveScale, object.location.groundPoint.y));
      this.world.addChild(view.container);
    }

    for (const [characterId, character] of Object.entries(state.characters)) {
      if (character.scene !== state.currentScene) continue;
      const definition = this.data.characters[characterId]!;
      const appearance = definition.appearances[character.appearance]!;
      const direction = character.facing === "left" || character.facing === "right" ? "side" : character.facing;
      const view = this.createCharacter(
        this.animationPresentation(state, { kind: "character", character: characterId })!,
        `characters.${characterId}.appearances.${character.appearance}`,
        { kind: "character", character: characterId },
        direction,
      );
      view.container.label = `character:${characterId}`;
      this.characterViews.set(characterId, view);
      this.world.addChild(view.container);
    }
  }

  private createScenery(
    appearance: SceneryAppearance,
    background: Texture,
    path: string,
    subject: DirectedSubject,
    presentation?: AnimationPresentation,
  ): Container {
    if ("animations" in appearance) {
      const container = new Container();
      const view = this.animationView(presentation!, path, subject, "front");
      this.animationViews.push(view);
      container.addChild(view.sprite);
      return container;
    }
    const bounds = boundingBox(appearance.area);
    const piece = new Sprite(
      new Texture({ source: background.source, frame: bounds }),
    );
    piece.position.set(bounds.x, bounds.y);
    const mask = new Graphics().poly(appearance.area.flatMap(({ x, y }) => [x, y])).fill(0xffffff);
    piece.mask = mask;
    const container = new Container();
    container.addChild(mask, piece);
    return container;
  }

  private createCharacter(
    presentation: AnimationPresentation,
    path: string,
    subject: DirectedSubject,
    selectedDirection: "side" | "front" | "back" = "front",
  ): CharacterView {
    const container = new Container();
    const view = { container, ...this.animationView(presentation, path, subject, selectedDirection) };
    this.animationViews.push(view);
    container.addChild(view.sprite);
    return view;
  }

  private updateCharacters(state: GameState): void {
    const scene = this.data.scenes[state.currentScene]!;
    for (const [characterId, view] of this.characterViews) {
      const character = state.characters[characterId]!;
      view.container.position.set(Math.round(character.groundPoint.x), Math.round(character.groundPoint.y));
      view.container.zIndex = character.groundPoint.y;
      const perspective = scaleAt(scene.perspectiveScale, character.groundPoint.y);
      const direction =
        character.facing === "left" || character.facing === "right" ? "side" : character.facing;
      const horizontal = character.facing === "left" ? -perspective : perspective;
      view.container.scale.set(horizontal, perspective);
      view.direction = direction;
    }
  }

  private updateAnimations(state: GameState): void {
    for (const view of this.animationViews) {
      const presentation = this.animationPresentation(state, view.subject);
      if (!presentation) continue;
      const frames = this.animationFrames(
        view.path,
        presentation.animationName,
        presentation.animation,
        view.direction,
      );
      const texture = frames[presentation.frameIndex];
      if (!texture) continue;
      view.presentation = presentation;
      view.sprite.texture = texture;
      setAnchor(view.sprite, presentation.visualAnchor, texture.width, texture.height);
    }
  }

  private animationView(
    presentation: AnimationPresentation,
    path: string,
    subject: DirectedSubject,
    direction: "side" | "front" | "back",
  ): AnimationView {
    const frames = this.animationFrames(
      path,
      presentation.animationName,
      presentation.animation,
      direction,
    );
    const sprite = new Sprite(frames[presentation.frameIndex]!);
    const texture = frames[presentation.frameIndex]!;
    setAnchor(sprite, presentation.visualAnchor, texture.width, texture.height);
    return { sprite, subject, path, presentation, direction };
  }

  private animationPresentation(
    state: GameState,
    subject: DirectedSubject,
  ): AnimationPresentation | undefined {
    const direction = this.activeDirection(state);
    const line = this.activeLine(state);
    return animationPresentationForSubject(this.data, state, subject, {
      ...(direction ? { direction } : {}),
      ...(line ? { line } : {}),
    });
  }

  private activeLine(state: GameState): { character: string; animation?: string } | undefined {
    if (state.activity?.type === "line") return state.activity.line;
    if (state.activity?.type !== "sequence" || state.activity.active?.kind !== "line") return undefined;
    if (state.activity.active.choiceCharacter) return { character: state.activity.active.choiceCharacter };
    const sequence = this.data.sequences[state.activity.sequence]!;
    const step = resolveSequencePath(sequence, state.activity.active.path) as SequenceStep;
    return step.type === "line" ? { character: step.character, ...(step.animation ? { animation: step.animation } : {}) } : undefined;
  }

  private activeDirection(state: GameState): {
    step: DirectionStep;
    interpretation: DirectionStepInterpretation;
  } | undefined {
    if (state.activity?.type !== "sequence" || state.activity.active?.kind !== "direction") return undefined;
    const cached = this.directionInterpretations.get(state);
    if (cached) return cached;
    const step = resolveSequencePath(this.data.sequences[state.activity.sequence], state.activity.active.path) as DirectionStep;
    const active = {
      step,
      interpretation: interpretDirectionStep(
        step,
        state.activity.active.elapsedTicks,
        (subject, animation) => appearanceForSubject(this.data, state, subject)?.animations[animation],
        (direction) => {
          if (direction.subject.kind !== "character") return false;
          const character = state.characters[direction.subject.character];
          return characterMotionReachedDestination(direction, character?.groundPoint);
        },
      ),
    };
    this.directionInterpretations.set(state, active);
    return active;
  }

  private directedSceneryPoint(state: GameState, scenery: string): Point | undefined {
    const active = this.activeDirection(state);
    if (!active) return undefined;
    for (let index = active.step.directions.length - 1; index >= 0; index -= 1) {
      const direction = active.step.directions[index]!;
      if (direction.type !== "motion" || direction.subject.kind !== "scenery" || direction.subject.scenery !== scenery) continue;
      const timing = active.interpretation.directions[index]!;
      if (!timing.presented) continue;
      return pointAlongPath(direction.path, Math.min(1, timing.localTick / secondsToTicks(direction.duration!)));
    }
    return undefined;
  }

  private animationFrames(
    path: string,
    animationName: string,
    animation: AnimationDefinition,
    direction: "side" | "front" | "back",
  ): readonly Texture[] {
    const base = `${path}.animations.${animationName}`;
    return this.assets.animationFrames.get(isImageAnimationFrames(animation.frames) ? base : `${base}.${direction}`) ?? [];
  }

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.overlay.blocksWorldInput()) return;
    const activity = this.core.snapshot().activity;
    if (event.button === 1) {
      if (activity?.type === "line") {
        event.preventDefault();
        this.core.input({ type: "advance-line" });
      } else if (
        activity?.type === "sequence" &&
        (activity.active?.kind === "line" || activity.active?.kind === "narration")
      ) {
        event.preventDefault();
        this.core.input({ type: "advance-sequence" });
      } else if (this.overlay.dismissResponse()) {
        event.preventDefault();
      }
      return;
    }
    if (event.button !== 0) return;
    this.frame.focus({ preventScroll: true });
    const { scene: point } = this.pointerPoints(event);
    if (["line", "sequence"].includes(this.core.snapshot().activity?.type ?? "")) return;
    const target = this.core.hitTest(point);
    if (target?.kind === "hotspot") {
      this.overlay.dismissAction();
      this.core.input({ type: "contextual-hotspot", hotspot: target.index, action: "primary" });
    } else if (target?.kind === "passage") {
      this.overlay.dismissAction();
      this.core.input({ type: "contextual-passage", passage: target.index, action: "primary" });
    } else this.core.input({ type: "move", point, fast: event.detail >= 2 });
  };

  private readonly onContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
    this.frame.focus({ preventScroll: true });
    if (
      this.overlay.blocksWorldInput() ||
      ["line", "sequence"].includes(this.core.snapshot().activity?.type ?? "")
    ) return;
    const { scene: point } = this.pointerPoints(event);
    const target = this.core.hitTest(point);
    if (target?.kind === "hotspot") {
      const hotspot = this.core.availableHotspots().find(({ index }) => index === target.index);
      if (!this.core.snapshot().command.firstNoun && !hotspot?.secondaryVerb) return;
      this.overlay.dismissAction();
      this.core.input({ type: "contextual-hotspot", hotspot: target.index, action: "secondary" });
    } else if (target?.kind === "passage") {
      const passage = this.core.availablePassages().find(({ index }) => index === target.index);
      if (!this.core.snapshot().command.firstNoun && !passage?.secondaryVerb) return;
      this.overlay.dismissAction();
      this.core.input({ type: "contextual-passage", passage: target.index, action: "secondary" });
    }
  };

  private readonly onDoubleClick = (event: MouseEvent): void => {
    if (
      this.overlay.blocksWorldInput() ||
      ["line", "sequence"].includes(this.core.snapshot().activity?.type ?? "")
    ) return;
    const { scene: point } = this.pointerPoints(event);
    const target = this.core.hitTest(point);
    if (target?.kind === "passage") {
      this.core.input({ type: "activate-passage", passage: target.index, fast: true, forceWalk: true });
    } else if (!target) {
      this.core.input({ type: "move", point, fast: true });
    }
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (
      this.overlay.blocksWorldInput() ||
      ["line", "sequence"].includes(this.core.snapshot().activity?.type ?? "")
    ) {
      this.overlay.showAction(undefined);
      return;
    }
    const points = this.pointerPoints(event);
    const point = points.scene;
    const target = this.core.hitTest(point);
    const hotspot = target?.kind === "hotspot"
      ? this.core.availableHotspots().find(({ index }) => index === target.index)
      : undefined;
    const passage = target?.kind === "passage"
      ? this.core.availablePassages().find(({ index }) => index === target.index)
      : undefined;
    this.overlay.showAction(hotspot ?? passage);
    const cursors = {
      left: "w-resize", right: "e-resize", up: "n-resize", down: "s-resize", enter: "pointer",
    } as const;
    const themedCursor = passage ? this.data.hudTheme?.cursors[passage.direction] : undefined;
    this.application.canvas.style.cursor = passage
      ? themedCursor
        ? `url(${JSON.stringify(assetUrl(themedCursor))}) 8 8, ${cursors[passage.direction]}`
        : cursors[passage.direction]
      : "pointer";
    this.overlay.showCursor(points.viewport);
  };

  private readonly onPointerLeave = (): void => {
    this.overlay.showAction(undefined);
    this.overlay.hideCursor();
  };

  private pointerPoints(event: Pick<MouseEvent, "clientX" | "clientY">): {
    viewport: Point;
    scene: Point;
  } {
    const bounds = this.application.canvas.getBoundingClientRect();
    const viewport = {
      x: ((event.clientX - bounds.left) / bounds.width) * this.data.logicalResolution.width,
      y: ((event.clientY - bounds.top) / bounds.height) * this.data.logicalResolution.height,
    };
    return {
      viewport,
      scene: {
        x: viewport.x + this.cameraOrigin.x,
        y: viewport.y + this.cameraOrigin.y,
      },
    };
  }

  private sceneToViewport(point: Point): Point {
    return {
      x: point.x - this.cameraOrigin.x,
      y: point.y - this.cameraOrigin.y,
    };
  }
}

class EngineOverlay {
  private readonly root = document.createElement("div");
  private readonly action = document.createElement("div");
  private readonly primaryAction = document.createElement("div");
  private readonly secondaryAction = document.createElement("div");
  private readonly actionLeader = document.createElement("span");
  private readonly response = document.createElement("div");
  private readonly inventory = document.createElement("div");
  private readonly inventoryNav = document.createElement("div");
  private readonly inventoryTrigger = document.createElement("button");
  private readonly inventoryPanel = document.createElement("aside");
  private readonly inventoryScrim = document.createElement("button");
  private readonly activity = document.createElement("div");
  private readonly modal = document.createElement("section");
  private readonly reveal = document.createElement("button");
  private readonly revealedHotspots = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  private inventorySignature = "";
  private activitySignature = "";
  private focusBeforeTextActivity: HTMLElement | null = null;
  private textActivityWasActive = false;
  private hotspotsRevealed = false;
  private hoveredHotspot: AvailableHotspot | AvailablePassage | null = null;
  private inventoryActionObject: string | null = null;
  private modalKind: "options" | "help" | "save" | "load" | null = null;
  private preferences: PlayerPreferences;
  private inventoryPage = 0;
  private inventoryOpen = false;
  private previousInventoryCount = 0;
  private lineTimer: number | undefined;
  private responseTimer: number | undefined;
  private activeAudio: HTMLAudioElement | undefined;
  private dismissedActionSignature: string | null = null;

  constructor(
    private readonly frame: HTMLElement,
    private readonly data: GameProjectData,
    private readonly assets: LoadedAssets,
    private readonly core: CoreSession,
    private readonly controls: BrowserSessionControls,
    private readonly characterSilhouetteTop: (character: string) => number | undefined,
    private readonly sceneToViewport: (point: Point) => Point,
  ) {
    this.preferences = readPreferences(data.identity);
    this.root.dataset.fondaleOverlay = "";
    Object.assign(this.root.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: `${data.logicalResolution.width}px`,
      height: `${data.logicalResolution.height}px`,
      transform: "scale(var(--fondale-scale, 1))",
      transformOrigin: "0 0",
      color: "white",
      font: `7px/1.25 ${JSON.stringify(data.hudTheme?.font.family ?? "monospace")}`,
      textShadow: "1px 1px #000",
      pointerEvents: "none",
    });
    this.action.dataset.fondaleCommandPreview = "";
    Object.assign(this.action.style, {
      position: "absolute",
      display: "none",
      zIndex: "8",
      left: "4px",
      top: "4px",
      width: "190px",
      pointerEvents: "none",
    });
    this.primaryAction.dataset.fondalePrimaryAction = "";
    this.secondaryAction.dataset.fondaleSecondaryAction = "";
    for (const [element, marker] of [[this.primaryAction, "L"], [this.secondaryAction, "R"]] as const) {
      element.style.cssText = [
        "display:flex",
        "align-items:center",
        "width:max-content",
        "max-width:190px",
        "gap:4px",
        "box-sizing:border-box",
        "padding:3px 6px",
        "color:#ffffff",
        `background:${colorWithAlpha(data.hudTheme?.colors.backing ?? "#071016", 0.82)}`,
        `border:1px solid ${data.hudTheme?.colors.border ?? "#789690"}`,
        "border-radius:4px",
        "box-shadow:0 2px 7px rgba(0,0,0,.72)",
        `font-size:${commandPreviewFontSize}`,
        "line-height:1.25",
        "white-space:normal",
        "text-shadow:1px 1px #000,-1px -1px #000",
      ].join(";");
      const input = document.createElement("span");
      input.textContent = marker;
      input.setAttribute("aria-hidden", "true");
      input.style.cssText = "display:grid;place-items:center;flex:0 0 auto;width:9px;height:9px;color:#172925;background:#f4dfb4;border-radius:50%;font:700 6px/1 sans-serif;text-shadow:none";
      const text = document.createElement("span");
      text.dataset.fondaleActionText = "";
      element.append(input, text);
    }
    this.secondaryAction.style.marginTop = "2px";
    this.secondaryAction.style.opacity = "0.92";
    this.actionLeader.style.cssText = "display:block;width:1px;height:7px;margin-left:14px;background:#fff;box-shadow:1px 0 #000";
    this.action.append(this.primaryAction, this.secondaryAction, this.actionLeader);
    Object.assign(this.response.style, {
      position: "absolute",
      left: "10%",
      right: "10%",
      bottom: "42px",
      textAlign: "center",
    });
    this.response.setAttribute("aria-live", "polite");
    Object.assign(this.inventory.style, {
      display: "grid",
      gridTemplateColumns: "repeat(4,minmax(0,1fr))",
      gridTemplateRows: "repeat(2,34px)",
      alignContent: "start",
      minHeight: "0",
      gap: "3px",
    });
    this.inventory.dataset.fondaleInventory = "";
    this.inventory.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.changeInventoryPage(event.deltaY > 0 ? 1 : -1);
    });
    this.inventoryNav.style.cssText = "display:flex;justify-content:center;gap:4px;pointer-events:auto";
    const previous = this.modalButton("‹", () => this.changeInventoryPage(-1));
    previous.dataset.fondaleInventoryPrevious = "";
    previous.setAttribute("aria-label", "Previous Inventory page");
    this.styleInventoryControl(previous);
    const next = this.modalButton("›", () => this.changeInventoryPage(1));
    next.dataset.fondaleInventoryNext = "";
    next.setAttribute("aria-label", "Next Inventory page");
    this.styleInventoryControl(next);
    this.inventoryNav.append(previous, next);
    this.inventoryTrigger.type = "button";
    this.inventoryTrigger.dataset.fondaleInventoryTrigger = "";
    this.inventoryTrigger.setAttribute("aria-label", "Open Inventory");
    this.inventoryTrigger.setAttribute("aria-expanded", "false");
    this.inventoryTrigger.style.cssText = [
      "position:absolute",
      "z-index:9",
      "left:7px",
      "bottom:7px",
      "display:grid",
      "place-items:center",
      "width:20px",
      "height:20px",
      "padding:0",
      "pointer-events:auto",
      `color:${data.hudTheme?.colors.preferred ?? "#f2ad62"}`,
      `background:${colorWithAlpha(data.hudTheme?.colors.backing ?? "#0c1626", 0.94)}`,
      `border:1px solid ${data.hudTheme?.colors.preferred ?? "#f2ad62"}`,
      "border-radius:50%",
      "box-shadow:0 2px 7px rgba(0,0,0,.8)",
      "font:700 8px/1 sans-serif",
    ].join(";");
    const bag = document.createElement("span");
    bag.setAttribute("aria-hidden", "true");
    bag.style.cssText = `position:relative;display:block;width:11px;height:8px;margin-top:3px;box-sizing:border-box;background:${data.hudTheme?.colors.preferred ?? "#f2ad62"};border:1px solid ${data.hudTheme?.colors.text ?? "#f4dfb4"};border-radius:2px 2px 3px 3px`;
    const bagHandle = document.createElement("span");
    bagHandle.style.cssText = `position:absolute;left:3px;top:-5px;width:4px;height:4px;box-sizing:border-box;border:1px solid ${data.hudTheme?.colors.preferred ?? "#f2ad62"};border-bottom:0;border-radius:3px 3px 0 0`;
    const bagBand = document.createElement("span");
    bagBand.style.cssText = "position:absolute;left:0;right:0;top:3px;height:1px;background:#6e4d16";
    bag.append(bagHandle, bagBand);
    this.inventoryTrigger.append(bag);
    this.inventoryTrigger.addEventListener("click", () => this.setInventoryOpen(!this.inventoryOpen));
    this.inventoryScrim.type = "button";
    this.inventoryScrim.dataset.fondaleInventoryScrim = "";
    this.inventoryScrim.setAttribute("aria-label", "Close Inventory");
    this.inventoryScrim.style.cssText = "position:absolute;display:none;z-index:19;inset:0;padding:0;pointer-events:auto;background:rgba(2,6,9,.32);border:0";
    this.inventoryScrim.addEventListener("click", () => this.setInventoryOpen(false));
    this.inventoryPanel.dataset.fondaleInventoryPanel = "";
    this.inventoryPanel.setAttribute("aria-label", "Inventory");
    this.inventoryPanel.setAttribute("role", "dialog");
    this.inventoryPanel.setAttribute("aria-modal", "true");
    this.inventoryPanel.tabIndex = -1;
    this.inventoryPanel.style.cssText = [
      "position:absolute",
      "display:none",
      "z-index:20",
      "top:6px",
      "right:6px",
      "width:158px",
      "box-sizing:border-box",
      "grid-template-rows:auto auto auto",
      "gap:4px",
      "padding:6px",
      "pointer-events:auto",
      `color:${data.hudTheme?.colors.text ?? "#f4dfb4"}`,
      `background:${colorWithAlpha(data.hudTheme?.colors.backing ?? "#0c1626", 0.96)}`,
      `border:1px solid ${data.hudTheme?.colors.border ?? "#5c7182"}`,
      "border-radius:5px",
      "box-shadow:0 4px 14px rgba(0,0,0,.85)",
    ].join(";");
    const inventoryHeader = document.createElement("header");
    inventoryHeader.style.cssText = "display:flex;align-items:center;justify-content:space-between";
    const inventoryTitle = document.createElement("strong");
    inventoryTitle.textContent = "Inventory";
    const closeInventory = this.modalButton("×", () => this.setInventoryOpen(false));
    closeInventory.dataset.fondaleInventoryClose = "";
    closeInventory.setAttribute("aria-label", "Close Inventory");
    this.styleInventoryControl(closeInventory);
    inventoryHeader.append(inventoryTitle, closeInventory);
    this.inventoryPanel.append(inventoryHeader, this.inventory, this.inventoryNav);
    Object.assign(this.activity.style, {
      position: "absolute",
      inset: "0",
      display: "grid",
      alignItems: "end",
      padding: "4px 20px 8px",
      boxSizing: "border-box",
      pointerEvents: "none",
    });
    this.modal.dataset.fondaleModal = "";
    this.modal.style.cssText = [
      "position:absolute",
      "display:none",
      "left:73px",
      "top:30px",
      "width:280px",
      "max-height:160px",
      "overflow:auto",
      "box-sizing:border-box",
      "padding:10px",
      "z-index:10",
      "pointer-events:auto",
      "color:#f4dfb4",
      "background:rgba(12,22,38,.96)",
      "border:1px solid #d99a58",
    ].join(";");
    this.reveal.type = "button";
    this.reveal.textContent = "Reveal hotspots";
    this.reveal.setAttribute("aria-pressed", "false");
    this.reveal.style.cssText = [
      "position:absolute",
      "right:4px",
      "top:4px",
      "pointer-events:auto",
      "font:7px/1.25 monospace",
      "color:white",
      "background:#211b2d",
      "border:1px solid white",
      "padding:3px",
    ].join(";");
    this.reveal.addEventListener("click", () => {
      this.hotspotsRevealed = !this.hotspotsRevealed;
      this.reveal.setAttribute("aria-pressed", String(this.hotspotsRevealed));
      this.renderRevealedHotspots();
    });
    if (data.commandLexicon) this.reveal.style.display = "none";
    this.revealedHotspots.dataset.fondaleRevealedHotspots = "";
    this.revealedHotspots.setAttribute(
      "viewBox",
      `0 0 ${data.logicalResolution.width} ${data.logicalResolution.height}`,
    );
    this.revealedHotspots.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    this.revealedHotspots.style.display = "none";
    this.root.append(
      this.revealedHotspots,
      this.action,
      this.response,
      this.inventoryScrim,
      this.inventoryPanel,
      this.inventoryTrigger,
      this.reveal,
      this.activity,
      this.modal,
    );
    this.frame.append(this.root);
    this.frame.addEventListener("keydown", this.onKeyDown);
    this.frame.addEventListener("keyup", this.onKeyUp);
    this.updatePreference({});
  }

  blocksWorldInput(): boolean {
    return this.modalKind !== null || this.inventoryOpen;
  }

  render(state: GameState, effects: readonly CoreEffect[]): void {
    const latestResponse = [...effects].reverse().find(({ type }) => type === "interaction-response");
    if (latestResponse?.type === "interaction-response") {
      this.clearResponseTimer();
      this.response.textContent = latestResponse.text;
      this.positionLowerText(this.response, "command-response");
      this.responseTimer = window.setTimeout(
        () => this.dismissResponse(),
        this.speechDuration(latestResponse.text),
      );
    }
    this.renderInventory(state);
    if (!this.hoveredHotspot && !this.inventoryActionObject) {
      this.action.style.display = "none";
    }
    if (state.activity?.type === "line" || state.activity?.type === "sequence") {
      this.dismissResponse();
    }
    this.renderActivity(state);
    const line = this.activity.querySelector<HTMLElement>("[data-fondale-line]");
    const speaker = line?.dataset.fondaleSpeaker;
    if (line && speaker) this.positionSpeech(line, state, speaker);
    const choosing = state.activity?.type === "sequence" && state.activity.active?.kind === "choice";
    this.inventoryTrigger.style.visibility = choosing ? "hidden" : "visible";
    if (choosing && this.inventoryOpen) this.setInventoryOpen(false);
    if (this.hotspotsRevealed) this.renderRevealedHotspots();
  }

  showAction(hotspot: AvailableHotspot | AvailablePassage | undefined): void {
    const state = this.core.snapshot();
    this.inventoryActionObject = null;
    if (!hotspot) {
      this.hoveredHotspot = null;
      this.dismissedActionSignature = null;
      this.action.style.display = "none";
      return;
    }
    const signature = this.actionSignature(hotspot);
    if (signature === this.dismissedActionSignature) {
      this.hoveredHotspot = null;
      this.action.style.display = "none";
      return;
    }
    this.dismissedActionSignature = null;
    this.hoveredHotspot = hotspot;
    this.action.style.zIndex = "8";
    const firstNoun = state.command.firstNoun
      ? this.core.availableInventory().find(({ object }) => object === state.command.firstNoun?.object)
      : undefined;
    const primaryVerb = firstNoun ? hotspot.objectVerb ?? "use" : hotspot.preferredVerb;
    const secondaryVerb = firstNoun ? hotspot.preferredVerb : hotspot.secondaryVerb;
    this.setActionText(this.primaryAction, this.commandPhrase(primaryVerb, hotspot.label, firstNoun?.label));
    const secondary = secondaryVerb && secondaryVerb !== primaryVerb
      ? this.commandPhrase(secondaryVerb, hotspot.label)
      : "";
    this.setActionText(this.secondaryAction, secondary);
    this.secondaryAction.style.display = secondary ? "flex" : "none";
    this.action.style.display = "block";
  }

  dismissAction(): void {
    if (this.hoveredHotspot) {
      this.dismissedActionSignature = this.actionSignature(this.hoveredHotspot);
    }
    this.hoveredHotspot = null;
    this.inventoryActionObject = null;
    this.action.style.display = "none";
  }

  dismissResponse(): boolean {
    if (!this.response.textContent) return false;
    this.clearResponseTimer();
    this.response.textContent = "";
    this.response.style.display = "none";
    return true;
  }

  showCursor(point: Point): void {
    const actionHeight = this.secondaryAction.style.display === "none" ? 25 : 39;
    this.action.style.left = `${Math.max(3, Math.min(this.data.logicalResolution.width - 193, point.x + 7))}px`;
    this.action.style.top = `${Math.max(3, Math.min(this.data.logicalResolution.height - actionHeight, point.y - actionHeight))}px`;
  }

  hideCursor(): void {
  }

  destroy(): void {
    this.clearLineTimer();
    this.clearResponseTimer();
    this.root.parentElement?.removeEventListener("keydown", this.onKeyDown);
    this.root.parentElement?.removeEventListener("keyup", this.onKeyUp);
    this.root.remove();
  }

  private renderInventory(state: GameState): void {
    if (state.inventory.objects.length > this.previousInventoryCount) {
      this.inventoryPage = Math.floor((state.inventory.objects.length - 1) / 8);
    }
    this.previousInventoryCount = state.inventory.objects.length;
    const maximumPage = Math.max(0, Math.ceil(state.inventory.objects.length / 8) - 1);
    this.inventoryPage = Math.min(this.inventoryPage, maximumPage);
    const signature = JSON.stringify([state.inventory, state.command, this.inventoryPage, this.inventoryOpen]);
    if (signature === this.inventorySignature) return;
    this.inventorySignature = signature;
    this.inventory.replaceChildren();
    const available = new Map(this.core.availableInventory().map((noun) => [noun.object, noun]));
    const visibleObjects = state.inventory.objects.slice(this.inventoryPage * 8, this.inventoryPage * 8 + 8);
    for (const objectId of visibleObjects) {
      const selected = state.command.firstNoun?.object === objectId;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.fondaleInventoryObject = objectId;
      button.setAttribute("aria-label", available.get(objectId)?.label ?? objectId);
      button.setAttribute("aria-pressed", String(selected));
      button.style.cssText = [
        "position:relative",
        "display:grid",
        "place-items:center",
        "align-items:center",
        "gap:0",
        "min-width:0",
        "min-height:0",
        "padding:2px",
        `color:${selected ? this.data.hudTheme?.colors.backing ?? "#0c1626" : this.data.hudTheme?.colors.text ?? "#f4dfb4"}`,
        `border:1px solid ${selected ? this.data.hudTheme?.colors.selected ?? "#58d6d2" : this.data.hudTheme?.colors.border ?? "#5c7182"}`,
        `outline:${selected ? "2px double white" : "none"}`,
        `background:${selected
          ? this.data.hudTheme?.colors.selected ?? "#58d6d2"
          : this.data.hudTheme
          ? colorWithAlpha(this.data.hudTheme.colors.inventoryWell, this.data.hudTheme.opacity * 0.68)
          : "rgba(33,27,45,.68)"}`,
        "image-rendering:pixelated",
        "font:inherit",
        "text-align:left",
      ].join(";");
      const image = document.createElement("img");
      const displaySize = Math.min(this.data.inventoryAppearanceSize ?? 24, 24);
      image.width = displaySize;
      image.height = displaySize;
      image.alt = "";
      image.src = assetUrl(this.data.objects[objectId]!.inventoryAppearance);
      button.append(image);
      if (selected) {
        const marker = document.createElement("span");
        marker.textContent = "✓";
        marker.setAttribute("aria-hidden", "true");
        marker.style.cssText = "position:absolute;right:1px;bottom:0;color:white";
        button.append(marker);
      }
      button.addEventListener("click", () => {
        this.dismissAction();
        this.core.input({ type: "contextual-object", object: objectId, action: "primary" });
        this.setInventoryOpen(false);
      });
      const inventoryNoun = available.get(objectId);
      if (inventoryNoun) {
        button.addEventListener("pointermove", (event) => {
          this.showInventoryAction(inventoryNoun, button, event);
        });
        button.addEventListener("pointerleave", () => {
          if (document.activeElement !== button) this.dismissAction();
        });
        button.addEventListener("focus", () => this.showInventoryAction(inventoryNoun, button));
        button.addEventListener("blur", () => this.dismissAction());
        button.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          if (!inventoryNoun.secondaryVerb) return;
          this.dismissAction();
          this.core.input({ type: "contextual-object", object: objectId, action: "secondary" });
        });
      }
      this.inventory.append(button);
    }
    if (this.data.commandLexicon) {
      for (let index = visibleObjects.length; index < 8; index += 1) {
        const empty = document.createElement("span");
        empty.dataset.fondaleInventorySlot = "empty";
        empty.setAttribute("aria-hidden", "true");
        const well = this.data.hudTheme
          ? colorWithAlpha(this.data.hudTheme.colors.inventoryWell, this.data.hudTheme.opacity * 0.68)
          : "rgba(20,15,28,.55)";
        empty.style.cssText = `display:block;min-width:0;min-height:0;border:1px solid ${this.data.hudTheme?.colors.border ?? "rgba(255,255,255,.45)"};background:${well};opacity:.4`;
        this.inventory.append(empty);
      }
      const previous = this.inventoryNav.querySelector<HTMLButtonElement>("[data-fondale-inventory-previous]")!;
      const next = this.inventoryNav.querySelector<HTMLButtonElement>("[data-fondale-inventory-next]")!;
      previous.disabled = this.inventoryPage === 0;
      next.disabled = this.inventoryPage >= maximumPage;
      previous.style.opacity = previous.disabled ? "0.35" : "1";
      next.style.opacity = next.disabled ? "0.35" : "1";
    }
  }

  private setInventoryOpen(open: boolean): void {
    this.inventoryOpen = open;
    this.inventoryPanel.style.display = open ? "grid" : "none";
    this.inventoryScrim.style.display = open ? "block" : "none";
    this.inventoryTrigger.setAttribute("aria-expanded", String(open));
    this.inventoryTrigger.setAttribute("aria-label", open ? "Close Inventory" : "Open Inventory");
    this.inventorySignature = "";
    this.dismissAction();
    this.action.style.zIndex = "8";
    if (this.response.textContent) this.positionLowerText(this.response, "command-response");
    const narration = this.activity.querySelector<HTMLElement>("[data-fondale-narration]");
    if (narration) this.positionLowerText(narration, "narration");
    if (open) this.inventoryPanel.focus({ preventScroll: true });
    else this.frame.focus({ preventScroll: true });
  }

  private setActionText(element: HTMLElement, text: string): void {
    element.querySelector<HTMLElement>("[data-fondale-action-text]")!.textContent = text;
  }

  private showInventoryAction(
    noun: AvailableInventoryNoun,
    button: HTMLButtonElement,
    event?: PointerEvent,
  ): void {
    const selected = this.core.snapshot().command.firstNoun?.object === noun.object;
    const selectionPattern = selected
      ? this.data.commandLexicon!.inventory.deselect
      : this.data.commandLexicon!.inventory.select;
    this.setActionText(this.primaryAction, selectionPattern.replace("{noun}", noun.label));
    const secondary = noun.secondaryVerb
      ? this.commandPhrase(noun.secondaryVerb, noun.label)
      : "";
    this.setActionText(this.secondaryAction, secondary);
    this.secondaryAction.style.display = secondary ? "flex" : "none";
    this.hoveredHotspot = null;
    this.inventoryActionObject = noun.object;
    this.dismissedActionSignature = null;
    this.action.style.zIndex = "21";
    this.action.style.display = "block";

    const frameBounds = this.frame.getBoundingClientRect();
    const buttonBounds = button.getBoundingClientRect();
    const scale = frameBounds.width / this.data.logicalResolution.width;
    const clientX = event?.clientX ?? buttonBounds.left + buttonBounds.width / 2;
    const clientY = event?.clientY ?? buttonBounds.top + buttonBounds.height / 2;
    this.showCursor({
      x: (clientX - frameBounds.left) / scale,
      y: (clientY - frameBounds.top) / scale,
    });
  }

  private commandPhrase(verb: Verb | undefined, noun: string, firstNoun?: string): string {
    if (!verb || verb === "walk-to") return noun;
    const label = this.data.commandLexicon?.verbs[verb];
    if (!label) return noun;
    if (firstNoun && (verb === "give" || verb === "use")) {
      return (this.data.commandLexicon?.patterns[verb] ?? `${label} {first} {second}`)
        .replace("{verb}", label)
        .replace("{first}", firstNoun)
        .replace("{second}", noun);
    }
    return (this.data.commandLexicon?.patterns.unary ?? "{verb} {noun}")
      .replace("{verb}", label)
      .replace("{noun}", noun);
  }

  private changeInventoryPage(amount: number): void {
    const maximumPage = Math.max(0, Math.ceil(this.core.snapshot().inventory.objects.length / 8) - 1);
    this.inventoryPage = Math.max(0, Math.min(maximumPage, this.inventoryPage + amount));
    this.inventorySignature = "";
  }

  private renderActivity(state: GameState): void {
    const activity = state.activity?.type === "sequence" || state.activity?.type === "line"
      ? state.activity
      : null;
    const signature = JSON.stringify(activity);
    if (signature === this.activitySignature) return;
    this.clearLineTimer();
    if (activity && !this.textActivityWasActive) {
      this.focusBeforeTextActivity =
        document.activeElement instanceof HTMLElement && document.activeElement.isConnected
          ? document.activeElement
          : this.frame;
    }
    this.activitySignature = signature;
    this.activity.replaceChildren();
    if (!activity || activity.type === "sequence" && !activity.active) {
      if (this.textActivityWasActive) {
        const target = this.focusBeforeTextActivity?.isConnected ? this.focusBeforeTextActivity : this.frame;
        target.focus({ preventScroll: true });
      }
      this.textActivityWasActive = false;
      this.focusBeforeTextActivity = null;
      return;
    }
    this.textActivityWasActive = true;
    if (activity.type === "line") {
      this.presentLine(
        state,
        activity.line.text,
        activity.line.character,
        activity.line.audio,
        () => this.core.input({ type: "advance-line" }),
      );
      return;
    }
    const sequence = activity;
    const active = sequence.active;
    if (!active) return;
    const definition = this.data.sequences[sequence.sequence]!;
    const step = resolveSequencePath(definition, active.path) as SequenceStep;
    if (active.kind === "line") {
      const isChoiceSpeech = active.choiceText !== undefined;
      const authoredLine = step.type === "line" ? step : undefined;
      if (!isChoiceSpeech && !authoredLine) return;
      const speaker = isChoiceSpeech ? active.choiceCharacter : authoredLine?.character;
      if (!speaker) return;
      this.presentLine(
        state,
        isChoiceSpeech ? active.choiceText! : authoredLine!.text,
        speaker,
        isChoiceSpeech ? undefined : authoredLine?.audio,
        () => this.core.input({ type: "advance-sequence" }),
      );
    } else if (active.kind === "narration" && step.type === "narration") {
      const narration = document.createElement("div");
      narration.dataset.fondaleNarration = "";
      narration.setAttribute("role", "status");
      narration.textContent = step.text;
      this.activity.append(narration);
      this.positionLowerText(narration, "narration");
      this.frame.focus({ preventScroll: true });
      this.lineTimer = window.setTimeout(() => {
        this.lineTimer = undefined;
        if (!this.modalKind) this.core.input({ type: "advance-sequence" });
      }, this.speechDuration(step.text));
    } else if (active.kind === "choice" && step.type === "choice") {
      const list = document.createElement("div");
      list.dataset.fondaleChoice = "";
      list.style.cssText = [
        "display:grid",
        "gap:2px",
        "padding:14px 8px 4px",
        "box-sizing:border-box",
        "pointer-events:auto",
        "border:0",
        `background:linear-gradient(to top,${colorWithAlpha(this.data.hudTheme?.colors.backing ?? "#071016", 0.65)} 0%,${colorWithAlpha(this.data.hudTheme?.colors.backing ?? "#071016", 0.42)} 62%,transparent 100%)`,
      ].join(";");
      const playerSpeechColor = (this.data.playerCharacter
        ? this.data.hudTheme?.speechColors[this.data.playerCharacter]
        : undefined)
        ?? this.data.hudTheme?.colors.text
        ?? "#f4dfb4";
      active.eligibleAlternatives.forEach((alternative, displayIndex) => {
        const choice = alternative === -1 ? step.fallback : step.alternatives[alternative]!;
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.fondaleAlternative = String(alternative);
        button.style.cssText = [
          "display:block",
          "width:100%",
          "padding:2px 0",
          "box-sizing:border-box",
          "background:transparent",
          "border:0",
          "outline:none",
          "text-align:left",
          "filter:brightness(1)",
          "transition:filter 80ms linear,transform 80ms linear",
          `color:${playerSpeechColor}`,
          `font:${speechFontSize}/1.25 ${JSON.stringify(this.data.hudTheme?.font.family ?? "monospace")}`,
          `text-shadow:${speechTextShadow}`,
        ].join(";");
        const idle = (): void => {
          button.style.filter = "brightness(1)";
          button.style.transform = "none";
        };
        const activeStyle = (): void => {
          button.style.filter = "brightness(1.45)";
          button.style.transform = "translateX(2px)";
        };
        button.addEventListener("focus", activeStyle);
        button.addEventListener("blur", idle);
        button.addEventListener("pointerenter", activeStyle);
        button.addEventListener("pointerleave", () => {
          if (document.activeElement !== button) idle();
        });
        button.textContent = `${displayIndex + 1}. ${choice.text}`;
        button.addEventListener("click", () => this.core.input({ type: "choose", alternative }));
        list.append(button);
      });
      this.activity.append(list);
      list.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }

  private presentLine(
    state: GameState,
    text: string,
    speaker: string,
    audio: URL | string | undefined,
    advance: () => void,
  ): void {
    if (state.characters[speaker]?.scene !== state.currentScene) return;
    const line = document.createElement("div");
    line.dataset.fondaleLine = "";
    line.setAttribute("role", "status");
    line.textContent = text;
    this.activity.append(line);
    this.positionSpeech(line, state, speaker);
    this.frame.focus({ preventScroll: true });
    const audioDuration = audio ? this.playLineAudio(audio) : 0;
    this.lineTimer = window.setTimeout(() => {
      this.lineTimer = undefined;
      if (!this.modalKind) advance();
    }, Math.max(this.speechDuration(text), audioDuration));
  }

  private positionSpeech(
    element: HTMLElement,
    state: GameState,
    speaker: string,
  ): void {
    const character = state.characters[speaker]!;
    const safeBottom = this.data.logicalResolution.height - 4;
    element.dataset.fondalePresentation = "speech";
    element.dataset.fondaleSpeaker = speaker;
    element.style.cssText = [
      "position:absolute",
      `width:${this.data.hudTheme?.maxSpeechWidth ?? 150}px`,
      `max-width:${this.data.hudTheme?.maxSpeechWidth ?? 150}px`,
      "white-space:normal",
      "overflow-wrap:anywhere",
      `max-height:${safeBottom - 4}px`,
      "overflow-y:auto",
      "text-align:center",
      `font-size:${speechFontSize}`,
      `color:${this.data.hudTheme?.speechColors[speaker] || this.data.hudTheme?.colors.text || "#f4dfb4"}`,
      "box-sizing:border-box",
      "padding:2px 4px",
      "background:transparent",
      "border:0",
      "border-radius:0",
      "box-shadow:none",
      `text-shadow:${speechTextShadow}`,
      "pointer-events:none",
      `display:${this.preferences.speechText ? "block" : "none"}`,
    ].join(";");
    const width = this.data.hudTheme?.maxSpeechWidth ?? 150;
    const projectedGroundPoint = this.sceneToViewport(character.groundPoint);
    element.style.left = `${Math.max(2, Math.min(this.data.logicalResolution.width - width - 2, projectedGroundPoint.x - width / 2))}px`;
    const height = element.offsetHeight;
    const silhouetteTop = this.characterSilhouetteTop(speaker) ?? projectedGroundPoint.y;
    element.style.top = `${Math.max(4, Math.min(safeBottom - height, silhouetteTop - height - 2))}px`;
  }

  private positionLowerText(
    element: HTMLElement,
    presentation: "command-response" | "narration",
  ): void {
    const compactWidth = this.data.hudTheme?.maxSpeechWidth ?? 150;
    const width = presentation === "narration"
      ? Math.min(this.data.logicalResolution.width - 40, Math.round(compactWidth * 1.6))
      : compactWidth;
    const drawerLeft = this.data.logicalResolution.width - 6 - 158;
    const availableRight = this.inventoryOpen ? drawerLeft - 6 : this.data.logicalResolution.width;
    element.dataset.fondalePresentation = presentation;
    delete element.dataset.fondaleSpeaker;
    element.style.position = "absolute";
    element.style.bottom = "auto";
    element.style.display = this.preferences.speechText ? "block" : "none";
    element.style.boxSizing = "border-box";
    element.style.width = `${Math.min(width, availableRight - 4)}px`;
    element.style.maxWidth = `${width}px`;
    element.style.whiteSpace = "normal";
    element.style.overflowWrap = "anywhere";
    element.style.textAlign = "center";
    element.style.padding = "4px 7px";
    element.style.fontSize = presentation === "narration" ? speechFontSize : commandResponseFontSize;
    element.style.color = presentation === "narration"
      ? this.data.hudTheme?.colors.text ?? "#f4dfb4"
      : "#fff";
    element.style.background = colorWithAlpha(this.data.hudTheme?.colors.backing ?? "#071016", 0.88);
    element.style.border = `1px solid ${this.data.hudTheme?.colors.border ?? "#5c7182"}`;
    element.style.borderRadius = "4px";
    element.style.boxShadow = "0 2px 8px rgba(0,0,0,.72)";
    element.style.textShadow = "1px 1px #000,-1px -1px #000";
    element.style.left = `${Math.max(2, (availableRight - Math.min(width, availableRight - 4)) / 2)}px`;
    element.style.top = `${Math.max(4, this.data.logicalResolution.height - element.offsetHeight - 4)}px`;
    element.style.zIndex = this.inventoryOpen ? "21" : "7";
  }

  private renderRevealedHotspots(): void {
    this.revealedHotspots.style.display = this.hotspotsRevealed ? "block" : "none";
    this.revealedHotspots.replaceChildren();
    if (!this.hotspotsRevealed) return;
    for (const hotspot of this.core.availableHotspots()) {
      const area = hotspot.area.map(this.sceneToViewport);
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.dataset.fondaleRevealedHotspot = String(hotspot.index);
      polygon.setAttribute("points", area.map(({ x, y }) => `${x},${y}`).join(" "));
      polygon.setAttribute("fill", "rgba(53,167,255,.22)");
      polygon.setAttribute("stroke", "#ffffff");
      polygon.setAttribute("stroke-width", "1");
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = hotspot.label;
      polygon.append(title);
      this.revealedHotspots.append(polygon, revealLabel(area, hotspot.label, "hotspot"));
    }
    for (const passage of this.core.availablePassages()) {
      const area = passage.area.map(this.sceneToViewport);
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.dataset.fondaleRevealedPassage = String(passage.index);
      polygon.setAttribute("points", area.map(({ x, y }) => `${x},${y}`).join(" "));
      polygon.setAttribute("fill", "rgba(242,173,98,.18)");
      polygon.setAttribute("stroke", "#f2ad62");
      polygon.setAttribute("stroke-width", "1");
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = passage.label;
      polygon.append(title);
      this.revealedHotspots.append(polygon, revealLabel(area, passage.label, "passage"));
    }
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "F5") {
      event.preventDefault();
      this.openModal(this.modalKind === "options" ? null : "options");
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      this.openModal("save");
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      this.openModal("load");
      return;
    }
    if (this.modalKind) {
      if (event.key === "Escape") {
        event.preventDefault();
        this.openModal(null);
      }
      return;
    }
    const state = this.core.snapshot();
    if (state.activity?.type === "line") {
      if (event.key === ".") {
        event.preventDefault();
        this.core.input({ type: "advance-line" });
      }
      return;
    }
    if (state.activity?.type === "sequence") {
      if (
        event.key === "." &&
        (state.activity.active?.kind === "line" || state.activity.active?.kind === "narration")
      ) {
        event.preventDefault();
        this.core.input({ type: "advance-sequence" });
      } else if (state.activity.active?.kind === "choice") {
        const numeric = Number(event.key);
        if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 6) {
          const alternative = state.activity.active.eligibleAlternatives[numeric - 1];
          if (alternative !== undefined) {
            event.preventDefault();
            this.core.input({ type: "choose", alternative });
          }
          return;
        }
        const buttons = [...this.activity.querySelectorAll<HTMLButtonElement>("button")];
        const current = Math.max(0, buttons.indexOf(document.activeElement as HTMLButtonElement));
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          event.preventDefault();
          buttons[(current + 1) % buttons.length]?.focus();
        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          event.preventDefault();
          buttons[(current - 1 + buttons.length) % buttons.length]?.focus();
        }
      }
      if (event.key === "Escape") this.core.input({ type: "skip-sequence" });
      return;
    }
    if (event.key === "." && this.dismissResponse()) {
      event.preventDefault();
      return;
    }
    if (event.key.toLowerCase() === "i" && this.data.commandLexicon) {
      event.preventDefault();
      this.setInventoryOpen(!this.inventoryOpen);
      return;
    }
    if (event.key === "Tab" && this.data.commandLexicon) {
      event.preventDefault();
      this.hotspotsRevealed = true;
      this.renderRevealedHotspots();
      return;
    }
    if (event.key === "Escape") {
      if (this.inventoryOpen) this.setInventoryOpen(false);
      else this.core.input({ type: "escape" });
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (event.key !== "Tab" || !this.data.commandLexicon) return;
    event.preventDefault();
    this.hotspotsRevealed = false;
    this.renderRevealedHotspots();
  };

  private openModal(kind: EngineOverlay["modalKind"]): void {
    this.clearLineTimer();
    if (kind && this.inventoryOpen) this.setInventoryOpen(false);
    this.modalKind = kind;
    this.modal.replaceChildren();
    this.modal.style.display = kind ? "block" : "none";
    if (!kind) {
      this.activitySignature = "";
      this.frame.focus({ preventScroll: true });
      return;
    }
    this.modal.dataset.fondaleModal = kind;
    const heading = document.createElement("h2");
    heading.textContent = kind[0]!.toUpperCase() + kind.slice(1);
    heading.style.cssText = "font:inherit;margin:0 0 6px;color:#58d6d2";
    this.modal.append(heading);
    if (kind === "options") this.renderOptions();
    else if (kind === "help") this.renderHelp();
    else if (kind === "save") this.renderSave();
    else this.renderLoad();
  }

  private renderOptions(): void {
    const controls = document.createElement("div");
    controls.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:5px";
    const textSpeed = selectPreference("Text speed", ["slow", "normal", "fast"], this.preferences.textSpeed);
    const speech = checkboxPreference("Speech text", this.preferences.speechText);
    controls.append(textSpeed.label, speech.label);
    if (this.assets.audio.size > 0) {
      const volume = document.createElement("input");
      volume.type = "range";
      volume.min = "0";
      volume.max = "1";
      volume.step = "0.05";
      volume.value = String(this.preferences.audioVolume);
      volume.setAttribute("aria-label", "Speech volume");
      volume.addEventListener("input", () => {
        this.updatePreference({ audioVolume: Number(volume.value) });
        if (this.activeAudio) this.activeAudio.volume = Number(volume.value);
      });
      controls.append(volume);
    }
    textSpeed.select.addEventListener("change", () => this.updatePreference({ textSpeed: textSpeed.select.value as PlayerPreferences["textSpeed"] }));
    speech.input.addEventListener("change", () => this.updatePreference({ speechText: speech.input.checked }));
    this.modal.append(controls, this.modalButton("Help", () => this.openModal("help")), this.modalButton("Save", () => this.openModal("save")), this.modalButton("Load", () => this.openModal("load")));
  }

  private renderHelp(): void {
    const text = document.createElement("p");
    text.dataset.fondaleHelp = "";
    text.textContent = "Mouse: left main action, right secondary action when shown, middle skip Line or Command Response. Bag or I opens Inventory. Tab reveals Nouns. 1–6 selects a Choice. F5 Options. Ctrl+S Save. Ctrl+L Load. Period skips a Line or Command Response. Escape closes Inventory, deselects an Object, or skips a skippable Sequence.";
    this.modal.append(text, this.modalButton("Back", () => this.openModal("options")));
  }

  private renderSave(): void {
    const name = document.createElement("input");
    name.dataset.fondaleSaveName = "";
    name.placeholder = "Save name";
    const save = this.modalButton("Save", () => {
      this.controls.save(name.value);
      this.openModal(null);
    });
    save.dataset.fondaleSaveConfirm = "";
    this.modal.append(name, save);
    name.focus();
  }

  private renderLoad(): void {
    const list = document.createElement("div");
    list.dataset.fondaleSaveSlots = "";
    this.controls.slots().forEach((slot, index) => {
      const button = this.modalButton(slot.name, () => {
        if (this.controls.load(index).ok) this.openModal(null);
      });
      button.dataset.fondaleLoadSlot = String(index);
      button.disabled = !slot.compatible;
      if (!slot.compatible) {
        button.textContent = `${slot.name} — incompatible`;
        button.title = slot.diagnostics.map(({ message }) => message).join(" ");
        const diagnostic = document.createElement("p");
        diagnostic.dataset.fondaleLoadDiagnostic = String(index);
        diagnostic.textContent = slot.diagnostics.map(({ message }) => message).join(" ");
        list.append(button, diagnostic);
        return;
      }
      list.append(button);
    });
    if (!list.hasChildNodes()) list.textContent = "No Save Slots.";
    this.modal.append(list);
  }

  private modalButton(text: string, action: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.style.cssText = `${overlayButtonStyle};pointer-events:auto;margin:3px`;
    button.addEventListener("click", action);
    return button;
  }

  private styleInventoryControl(button: HTMLButtonElement): void {
    const idle = (): void => {
      button.style.background = "transparent";
      button.style.borderColor = "transparent";
    };
    const active = (): void => {
      button.style.background = colorWithAlpha(this.data.hudTheme?.colors.inventoryWell ?? "#211b2d", 0.72);
      button.style.borderColor = this.data.hudTheme?.colors.border ?? "#5c7182";
    };
    button.style.cssText = [
      "display:grid",
      "place-items:center",
      "width:16px",
      "height:16px",
      "margin:0",
      "padding:0",
      "box-sizing:border-box",
      "pointer-events:auto",
      `color:${this.data.hudTheme?.colors.text ?? "#f4dfb4"}`,
      "background:transparent",
      "border:1px solid transparent",
      "border-radius:3px",
      "font:700 10px/1 sans-serif",
      "text-shadow:1px 1px #000",
    ].join(";");
    button.addEventListener("pointerenter", active);
    button.addEventListener("pointerleave", () => {
      if (document.activeElement !== button) idle();
    });
    button.addEventListener("focus", active);
    button.addEventListener("blur", idle);
  }

  private updatePreference(change: Partial<PlayerPreferences>): void {
    this.preferences = { ...this.preferences, ...change };
    localStorage.setItem(preferencesKey(this.data.identity), JSON.stringify(this.preferences));
    this.activitySignature = "";
  }

  private clearLineTimer(): void {
    if (this.lineTimer !== undefined) window.clearTimeout(this.lineTimer);
    this.lineTimer = undefined;
    this.activeAudio?.pause();
    this.activeAudio = undefined;
  }

  private clearResponseTimer(): void {
    if (this.responseTimer !== undefined) window.clearTimeout(this.responseTimer);
    this.responseTimer = undefined;
  }

  private speechDuration(text: string): number {
    const millisecondsPerCharacter = {
      slow: 130,
      normal: 80,
      fast: 25,
    }[this.preferences.textSpeed];
    const minimumDuration = { slow: 7_000, normal: 4_000, fast: 600 }[
      this.preferences.textSpeed
    ];
    return Math.max(minimumDuration, text.length * millisecondsPerCharacter);
  }

  private actionSignature(hotspot: AvailableHotspot | AvailablePassage): string {
    return `${"direction" in hotspot ? "passage" : "hotspot"}:${hotspot.index}`;
  }

  private playLineAudio(reference: URL | string): number {
    const source = this.assets.audio.get(assetUrl(reference));
    if (!source) return 0;
    source.currentTime = 0;
    source.volume = this.preferences.audioVolume;
    this.activeAudio = source;
    void source.play().catch(() => undefined);
    return Number.isFinite(source.duration) ? source.duration * 1_000 : 0;
  }
}

interface PlayerPreferences {
  readonly textSpeed: "slow" | "normal" | "fast";
  readonly speechText: boolean;
  readonly audioVolume: number;
}

function revealLabel(
  area: readonly Point[],
  label: string,
  kind: "hotspot" | "passage",
): SVGTextElement {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const center = area.reduce(
    (point, vertex) => ({ x: point.x + vertex.x / area.length, y: point.y + vertex.y / area.length }),
    { x: 0, y: 0 },
  );
  text.dataset.fondaleRevealedLabel = kind;
  text.setAttribute("x", String(center.x));
  text.setAttribute("y", String(center.y));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.setAttribute("font-size", "7");
  text.setAttribute("fill", "#ffffff");
  text.setAttribute("stroke", "#000000");
  text.setAttribute("stroke-width", "2");
  text.setAttribute("paint-order", "stroke");
  text.textContent = label;
  return text;
}

const defaultPreferences: PlayerPreferences = {
  textSpeed: "normal",
  speechText: true,
  audioVolume: 1,
};

function preferencesKey(identity: string): string {
  return `fondale.preferences.${identity}`;
}

function readPreferences(identity: string): PlayerPreferences {
  try {
    const value = JSON.parse(localStorage.getItem(preferencesKey(identity)) ?? "null") as Partial<PlayerPreferences> | null;
    if (!value) return defaultPreferences;
    return {
      ...defaultPreferences,
      ...value,
      audioVolume: typeof value.audioVolume === "number" && value.audioVolume >= 0 && value.audioVolume <= 1
        ? value.audioVolume
        : defaultPreferences.audioVolume,
    };
  } catch {
    return defaultPreferences;
  }
}

function selectPreference(
  text: string,
  values: readonly string[],
  selected: string,
): { label: HTMLLabelElement; select: HTMLSelectElement } {
  const label = document.createElement("label");
  label.textContent = text;
  const select = document.createElement("select");
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    option.selected = value === selected;
    select.append(option);
  }
  label.append(select);
  return { label, select };
}

function checkboxPreference(
  text: string,
  checked: boolean,
): { label: HTMLLabelElement; input: HTMLInputElement } {
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  label.append(input, text);
  return { label, input };
}

const overlayButtonStyle = [
  "font:inherit",
  "color:white",
  "background:rgba(20,15,28,.9)",
  "border:1px solid white",
  "padding:2px",
  "text-shadow:1px 1px #000",
].join(";");

function colorWithAlpha(color: string, alpha: number): string {
  const digits = color.slice(1);
  const expanded = digits.length === 3
    ? [...digits].map((digit) => digit + digit).join("")
    : digits;
  const channels = [0, 2, 4].map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16));
  return `rgba(${channels.join(",")},${Math.max(0, Math.min(1, alpha))})`;
}

function sceneSignature(state: GameState): string {
  return JSON.stringify({
    scene: state.currentScene,
    scenery: state.scenery[state.currentScene],
    characters: Object.fromEntries(
      Object.entries(state.characters).map(([id, character]) => [id, [character.scene, character.appearance]]),
    ),
    objects: state.objects,
    activity: state.activity,
  });
}

function setAnchor(sprite: Sprite, anchor: Point | undefined, width: number, height: number): void {
  sprite.anchor.set(anchor ? anchor.x / width : 0.5, anchor ? anchor.y / height : 1);
}

function scaleAt(stops: readonly { y: number; scale: number }[] | undefined, y: number): number {
  if (!stops || stops.length === 0) return 1;
  const sorted = [...stops].sort((left, right) => left.y - right.y);
  const first = sorted[0]!;
  const last = sorted.at(-1)!;
  if (y <= first.y) return first.scale;
  if (y >= last.y) return last.scale;
  for (let index = 1; index < sorted.length; index += 1) {
    const lower = sorted[index - 1]!;
    const upper = sorted[index]!;
    if (y <= upper.y) {
      const amount = (y - lower.y) / (upper.y - lower.y);
      return lower.scale + (upper.scale - lower.scale) * amount;
    }
  }
  return last.scale;
}

function boundingBox(area: readonly Point[]): Rectangle {
  const xs = area.map(({ x }) => x);
  const ys = area.map(({ y }) => y);
  const x = Math.floor(Math.min(...xs));
  const y = Math.floor(Math.min(...ys));
  return new Rectangle(x, y, Math.ceil(Math.max(...xs)) - x, Math.ceil(Math.max(...ys)) - y);
}
