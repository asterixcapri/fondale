import {
  Application,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";

import type {
  CoreEffect,
  CoreSession,
} from "../capabilities/game-session";
import {
  isImageAnimationFrames,
  type AnimationDefinition,
  type AnimationPresentation,
} from "../capabilities/animation";
import type {
  DirectedSubject,
} from "../capabilities/sequence";
import {
  sameWorldTarget,
  type Point,
  type SceneryAppearance,
  type WorldPresentation,
  type WorldTarget,
} from "../capabilities/world";
import type { BrowserPresentationProjectView } from "../capabilities/game-project";
import type {
  HUDNarrativePresentation,
  HUDAdapterFacts,
  HUDInput,
  HUDInventoryEntryPresentation,
  HUDModalKind,
  HUDNounPresentation,
  PlayerPreferences,
  HUDPresentation,
  HUDCommandResponsePresentation,
} from "../capabilities/hud";
import { assetUrl, type LoadedAssets } from "./assets";
import type { BrowserSessionControls } from "./save-slots";

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

/** Applies capability presentation facts to PixiJS, DOM, audio, and physical input. */
export class BrowserRenderer {
  private readonly world = new Container();
  private readonly overlay: EngineOverlay;
  private readonly characterViews = new Map<string, CharacterView>();
  private readonly animationViews: AnimationView[] = [];
  private cameraOrigin: Point = { x: 0, y: 0 };
  private sceneSignature = "";

  constructor(
    private readonly application: Application,
    private readonly frame: HTMLElement,
    private readonly data: BrowserPresentationProjectView,
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
      () => [...this.characterViews.keys()],
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

  render(effects: readonly CoreEffect[]): void {
    const movement = [...effects].reverse().find(({ type }) => type === "movement-started");
    if (movement?.type === "movement-started") {
      this.frame.dataset.fondaleMovement = movement.fast ? "fast" : "normal";
    }
    const world = this.core.world();
    this.frame.dataset.fondaleScene = world.scene;
    const signature = worldPresentationSignature(world);
    if (signature !== this.sceneSignature) {
      this.sceneSignature = signature;
      this.rebuildWorld(world);
    }
    this.updateCharacters(world);
    this.updateAnimations();
    this.world.sortChildren();
    this.cameraOrigin = this.core.camera().origin;
    this.world.position.set(-this.cameraOrigin.x, -this.cameraOrigin.y);
    this.overlay.render();
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

  private rebuildWorld(world: WorldPresentation): void {
    this.world.removeChildren();
    this.characterViews.clear();
    this.animationViews.length = 0;
    const backgroundTexture = this.assets.textures.get(assetUrl(world.background))!;
    const background = new Sprite(backgroundTexture);
    background.zIndex = Number.NEGATIVE_INFINITY;
    this.world.addChild(background);

    for (const scenery of world.scenery) {
      const view = this.createScenery(
        scenery.appearance,
        backgroundTexture,
        `scenes.${world.scene}.scenery.${scenery.id}.appearances.${scenery.appearanceName}`,
        { kind: "scenery", scenery: scenery.id },
        this.animationPresentation({ kind: "scenery", scenery: scenery.id }),
      );
      view.label = `scenery:${scenery.id}`;
      view.zIndex = scenery.baseline;
      if (scenery.position) {
        view.position.set(scenery.position.x, scenery.position.y);
      }
      this.world.addChild(view);
    }

    for (const object of world.objects) {
      const view = this.createCharacter(
        this.animationPresentation({ kind: "object", object: object.id })!,
        `objects.${object.id}.appearances.${object.appearanceName}`,
        { kind: "object", object: object.id },
        "front",
      );
      view.container.label = `object:${object.id}`;
      view.container.position.set(object.groundPoint.x, object.groundPoint.y);
      view.container.zIndex = object.groundPoint.y;
      view.container.scale.set(object.scale);
      this.world.addChild(view.container);
    }

    for (const character of world.characters) {
      const direction = character.facing === "left" || character.facing === "right" ? "side" : character.facing;
      const view = this.createCharacter(
        this.animationPresentation({ kind: "character", character: character.id })!,
        `characters.${character.id}.appearances.${character.appearanceName}`,
        { kind: "character", character: character.id },
        direction,
      );
      view.container.label = `character:${character.id}`;
      this.characterViews.set(character.id, view);
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

  private updateCharacters(world: WorldPresentation): void {
    for (const character of world.characters) {
      const view = this.characterViews.get(character.id);
      if (!view) continue;
      view.container.position.set(Math.round(character.groundPoint.x), Math.round(character.groundPoint.y));
      view.container.zIndex = character.groundPoint.y;
      const perspective = character.scale;
      const direction =
        character.facing === "left" || character.facing === "right" ? "side" : character.facing;
      const horizontal = character.facing === "left" ? -perspective : perspective;
      view.container.scale.set(horizontal, perspective);
      view.direction = direction;
    }
  }

  private updateAnimations(): void {
    for (const view of this.animationViews) {
      const presentation = this.animationPresentation(view.subject);
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
    subject: DirectedSubject,
  ): AnimationPresentation | undefined {
    return this.core.animation(subject);
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
    const hud = this.core.hud();
    if (event.button === 1) {
      if (hud.narrative?.kind === "line" || hud.narrative?.kind === "narration") {
        event.preventDefault();
        this.overlay.inputHUD({ type: "advance-activity" });
      } else if (this.overlay.dismissResponse()) {
        event.preventDefault();
      }
      return;
    }
    if (event.button !== 0) return;
    this.frame.focus({ preventScroll: true });
    const { scene: point } = this.pointerPoints(event);
    if (hud.narrative || hud.sequenceActive) return;
    const target = this.core.hitTest(point);
    if (target?.kind === "hotspot") {
      this.overlay.dismissAction();
      this.overlay.inputHUD({ type: "activate-noun", target, action: "primary" });
    } else if (target?.kind === "passage") {
      this.overlay.dismissAction();
      this.overlay.inputHUD({ type: "activate-noun", target, action: "primary" });
    } else this.core.input({ type: "move", point, fast: event.detail >= 2 });
  };

  private readonly onContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
    this.frame.focus({ preventScroll: true });
    const hud = this.core.hud();
    if (this.worldInputBlocked(hud)) return;
    const { scene: point } = this.pointerPoints(event);
    const target = this.core.hitTest(point);
    const noun = target
      ? this.core.hud().nouns.find((candidate) => sameWorldTarget(candidate.target, target))
      : undefined;
    if (target?.kind === "hotspot") {
      if (!noun?.secondary) return;
      this.overlay.dismissAction();
      this.overlay.inputHUD({ type: "activate-noun", target, action: "secondary" });
    } else if (target?.kind === "passage") {
      if (!noun?.secondary) return;
      this.overlay.dismissAction();
      this.overlay.inputHUD({ type: "activate-noun", target, action: "secondary" });
    }
  };

  private readonly onDoubleClick = (event: MouseEvent): void => {
    const hud = this.core.hud();
    if (this.worldInputBlocked(hud)) return;
    const { scene: point } = this.pointerPoints(event);
    const target = this.core.hitTest(point);
    if (target?.kind === "passage") {
      this.core.input({ type: "activate-passage", passage: target.index, fast: true, forceWalk: true });
    } else if (!target) {
      this.core.input({ type: "move", point, fast: true });
    }
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const hud = this.core.hud();
    if (this.worldInputBlocked(hud)) {
      this.overlay.showAction(undefined);
      return;
    }
    const points = this.pointerPoints(event);
    const point = points.scene;
    const target = this.core.hitTest(point);
    const noun = target
      ? this.core.hud().nouns.find((candidate) => sameWorldTarget(candidate.target, target))
      : undefined;
    this.overlay.showAction(noun);
    const cursors = {
      left: "w-resize", right: "e-resize", up: "n-resize", down: "s-resize", enter: "pointer",
    } as const;
    const direction = noun?.direction;
    const themedCursor = direction ? this.data.hudTheme?.cursors[direction] : undefined;
    this.application.canvas.style.cursor = direction
      ? themedCursor
        ? `url(${JSON.stringify(assetUrl(themedCursor))}) 8 8, ${cursors[direction]}`
        : cursors[direction]
      : "pointer";
    this.overlay.showCursor(points.viewport);
  };

  private readonly onPointerLeave = (): void => {
    this.overlay.showAction(undefined);
    this.overlay.hideCursor();
  };

  private worldInputBlocked(hud: HUDPresentation): boolean {
    return this.overlay.blocksWorldInput() || hud.narrative !== null || hud.sequenceActive;
  }

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
  private readonly narrative = document.createElement("div");
  private readonly dialogueForm = document.createElement("form");
  private readonly dialogueHeading = document.createElement("label");
  private readonly dialogueInput = document.createElement("input");
  private readonly dialogueSubmit = document.createElement("button");
  private readonly dialogueLeave = document.createElement("button");
  private readonly dialogueStatus = document.createElement("div");
  private readonly modal = document.createElement("section");
  private readonly reveal = document.createElement("button");
  private readonly revealedHotspots = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  private inventorySignature = "";
  private narrativeSignature = "";
  private focusBeforeNarrative: HTMLElement | null = null;
  private narrativeWasActive = false;
  private currentHUD: HUDPresentation;
  private hoveredNoun: HUDNounPresentation | null = null;
  private inventoryActionObject: string | null = null;
  private lineTimer: number | undefined;
  private responseTimer: number | undefined;
  private activeAudio: HTMLAudioElement | undefined;
  private dismissedActionSignature: string | null = null;
  private dialogueWasVisible = false;

  constructor(
    private readonly frame: HTMLElement,
    private readonly data: BrowserPresentationProjectView,
    private readonly assets: LoadedAssets,
    private readonly core: CoreSession,
    private readonly controls: BrowserSessionControls,
    private readonly characterIds: () => readonly string[],
    private readonly characterSilhouetteTop: (character: string) => number | undefined,
    private readonly sceneToViewport: (point: Point) => Point,
  ) {
    core.hudInput({
      type: "restore-preferences",
      value: readPreferences(data.identity),
    }, this.adapterFacts());
    this.currentHUD = core.hud(this.adapterFacts());
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
      this.inputHUD({ type: "change-inventory-page", amount: event.deltaY > 0 ? 1 : -1 });
    });
    this.inventoryNav.style.cssText = "display:flex;justify-content:center;gap:4px;pointer-events:auto";
    const previous = this.modalButton("‹", () => {
      this.inputHUD({ type: "change-inventory-page", amount: -1 });
    });
    previous.dataset.fondaleInventoryPrevious = "";
    previous.setAttribute("aria-label", "Previous Inventory page");
    this.styleInventoryControl(previous);
    const next = this.modalButton("›", () => {
      this.inputHUD({ type: "change-inventory-page", amount: 1 });
    });
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
    this.inventoryTrigger.addEventListener("click", () => this.inputHUD({ type: "toggle-inventory" }));
    this.inventoryScrim.type = "button";
    this.inventoryScrim.dataset.fondaleInventoryScrim = "";
    this.inventoryScrim.setAttribute("aria-label", "Close Inventory");
    this.inventoryScrim.style.cssText = "position:absolute;display:none;z-index:19;inset:0;padding:0;pointer-events:auto;background:rgba(2,6,9,.32);border:0";
    this.inventoryScrim.addEventListener("click", () => this.inputHUD({ type: "close-inventory" }));
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
    const closeInventory = this.modalButton("×", () => this.inputHUD({ type: "close-inventory" }));
    closeInventory.dataset.fondaleInventoryClose = "";
    closeInventory.setAttribute("aria-label", "Close Inventory");
    this.styleInventoryControl(closeInventory);
    inventoryHeader.append(inventoryTitle, closeInventory);
    this.inventoryPanel.append(inventoryHeader, this.inventory, this.inventoryNav);
    Object.assign(this.narrative.style, {
      position: "absolute",
      inset: "0",
      display: "grid",
      alignItems: "end",
      padding: "4px 20px 8px",
      boxSizing: "border-box",
      pointerEvents: "none",
    });
    this.dialogueForm.dataset.fondaleDialogue = "";
    this.dialogueForm.style.cssText = [
      "position:absolute",
      "display:none",
      "left:73px",
      "bottom:12px",
      "width:280px",
      "box-sizing:border-box",
      "grid-template-columns:1fr auto auto",
      "gap:4px",
      "padding:7px",
      "z-index:9",
      "pointer-events:auto",
      `color:${data.hudTheme?.colors.text ?? "#f4dfb4"}`,
      `background:${colorWithAlpha(data.hudTheme?.colors.backing ?? "#0c1626", 0.96)}`,
      `border:1px solid ${data.hudTheme?.colors.border ?? "#5c7182"}`,
      "border-radius:4px",
      "box-shadow:0 3px 10px rgba(0,0,0,.8)",
    ].join(";");
    this.dialogueHeading.style.cssText = "grid-column:1/-1";
    this.dialogueHeading.htmlFor = "fondale-dialogue-input";
    this.dialogueInput.id = "fondale-dialogue-input";
    this.dialogueInput.dataset.fondaleDialogueInput = "";
    this.dialogueInput.type = "text";
    this.dialogueInput.autocomplete = "off";
    this.dialogueInput.style.cssText = "min-width:0;font:inherit;padding:3px;color:#111;background:#fff;border:1px solid #777";
    this.dialogueSubmit.type = "submit";
    this.dialogueSubmit.textContent = "Ask";
    this.dialogueSubmit.style.cssText = "font:inherit;padding:3px 7px";
    this.dialogueLeave.type = "button";
    this.dialogueLeave.textContent = "Leave";
    this.dialogueLeave.style.cssText = "font:inherit;padding:3px 7px";
    this.dialogueLeave.addEventListener("click", () => {
      this.core.input({ type: "escape" });
    });
    this.dialogueStatus.setAttribute("role", "status");
    this.dialogueStatus.style.cssText = "grid-column:1/-1;min-height:9px";
    this.dialogueForm.append(
      this.dialogueHeading,
      this.dialogueInput,
      this.dialogueSubmit,
      this.dialogueLeave,
      this.dialogueStatus,
    );
    this.dialogueForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const playerInput = this.dialogueInput.value;
      const submission = this.core.reflection()
        ? this.core.submitReflection(playerInput)
        : this.core.submitDialogue(playerInput);
      void submission.then((result) => {
        if (result.ok) this.dialogueInput.value = "";
        this.render();
      });
      this.renderDialogue();
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
      this.inputHUD({
        type: "set-nouns-revealed",
        revealed: !this.currentHUD.nounsRevealed,
      });
      this.reveal.setAttribute("aria-pressed", String(this.currentHUD.nounsRevealed));
      this.renderRevealedNouns();
    });
    if (this.currentHUD.nounRevealControl === "keyboard") this.reveal.style.display = "none";
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
      this.dialogueForm,
      this.narrative,
      this.modal,
    );
    this.frame.append(this.root);
    this.frame.addEventListener("keydown", this.onKeyDown);
    this.frame.addEventListener("keyup", this.onKeyUp);
    this.persistPreferences(this.currentHUD.system.preferences);
  }

  blocksWorldInput(): boolean {
    return this.currentHUD.system.blocksWorldInput || this.core.conversation() !== null ||
      this.core.reflection() !== null;
  }

  render(): void {
    const inventoryWasOpen = this.currentHUD.inventory.open;
    const previousResponseId = this.currentHUD.commandResponse?.id ?? null;
    this.currentHUD = this.core.hud(this.adapterFacts());
    if (inventoryWasOpen && !this.currentHUD.inventory.open) {
      this.frame.focus({ preventScroll: true });
    }
    this.renderCommandResponse(previousResponseId);
    this.renderInventory();
    if (!this.hoveredNoun && !this.inventoryActionObject) {
      this.action.style.display = "none";
    }
    this.renderNarrative();
    this.renderDialogue();
    const line = this.narrative.querySelector<HTMLElement>("[data-fondale-line]");
    if (line && this.currentHUD.narrative?.kind === "line") {
      this.positionSpeech(line, this.currentHUD.narrative);
    }
    if (this.currentHUD.nounsRevealed) this.renderRevealedNouns();
  }

  showAction(noun: HUDNounPresentation | undefined): void {
    this.inventoryActionObject = null;
    if (!noun) {
      this.hoveredNoun = null;
      this.dismissedActionSignature = null;
      this.action.style.display = "none";
      return;
    }
    const signature = this.actionSignature(noun);
    if (signature === this.dismissedActionSignature) {
      this.hoveredNoun = null;
      this.action.style.display = "none";
      return;
    }
    this.dismissedActionSignature = null;
    this.hoveredNoun = noun;
    this.action.style.zIndex = "8";
    this.setActionText(this.primaryAction, noun.primary.text);
    const secondary = noun.secondary?.text ?? "";
    this.setActionText(this.secondaryAction, secondary);
    this.secondaryAction.style.display = secondary ? "flex" : "none";
    this.action.style.display = "block";
  }

  dismissAction(): void {
    if (this.hoveredNoun) {
      this.dismissedActionSignature = this.actionSignature(this.hoveredNoun);
    }
    this.hoveredNoun = null;
    this.inventoryActionObject = null;
    this.action.style.display = "none";
  }

  dismissResponse(): boolean {
    if (!this.currentHUD.commandResponse) return false;
    this.clearResponseTimer();
    this.inputHUD({ type: "dismiss-response" });
    return true;
  }

  inputHUD(input: HUDInput): void {
    const previousResponseId = this.currentHUD.commandResponse?.id ?? null;
    const result = this.core.hudInput(input, this.adapterFacts());
    if (result.preferences) this.persistPreferences(result.preferences);
    if (result.adapter?.type === "save") {
      this.controls.save(result.adapter.name);
    } else if (result.adapter?.type === "load") {
      void this.controls.load(result.adapter.index);
      return;
    }
    this.currentHUD = this.core.hud(this.adapterFacts());
    this.inventorySignature = "";
    this.renderInventory();
    if (input.type !== "set-nouns-revealed" && input.type !== "change-inventory-page") {
      this.dismissAction();
    }
    this.renderCommandResponse(previousResponseId);
    this.renderNarrative();
    if (input.type !== "change-preferences" && input.type !== "restore-preferences") {
      this.renderModal();
    }
    if (result.focus === "inventory") this.inventoryPanel.focus({ preventScroll: true });
    else if (result.focus === "frame") this.frame.focus({ preventScroll: true });
    else if (result.focus === "modal") this.modal.querySelector<HTMLElement>("button,input,select")?.focus({ preventScroll: true });
    else if (result.focus === "restore") this.frame.focus({ preventScroll: true });
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

  private renderInventory(): void {
    const presentation = this.currentHUD.inventory;
    const signature = JSON.stringify(presentation);
    if (signature === this.inventorySignature) return;
    this.inventorySignature = signature;
    this.inventoryPanel.style.display = presentation.open ? "grid" : "none";
    this.inventoryScrim.style.display = presentation.open ? "block" : "none";
    this.inventoryTrigger.setAttribute("aria-expanded", String(presentation.open));
    this.inventoryTrigger.setAttribute(
      "aria-label",
      presentation.open ? "Close Inventory" : "Open Inventory",
    );
    this.inventoryTrigger.style.visibility = presentation.triggerVisible ? "visible" : "hidden";
    this.inventory.replaceChildren();
    for (const entry of presentation.entries) {
      const { object: objectId, selected } = entry;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.fondaleInventoryObject = objectId;
      button.setAttribute("aria-label", entry.label);
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
      image.src = assetUrl(entry.inventoryAppearance);
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
        this.inputHUD({ type: "activate-inventory", object: objectId, action: "primary" });
      });
      button.addEventListener("pointermove", (event) => {
        this.showInventoryAction(entry, button, event);
      });
      button.addEventListener("pointerleave", () => {
        if (document.activeElement !== button) this.dismissAction();
      });
      button.addEventListener("focus", () => this.showInventoryAction(entry, button));
      button.addEventListener("blur", () => this.dismissAction());
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (!entry.secondary) return;
        this.dismissAction();
        this.inputHUD({ type: "activate-inventory", object: objectId, action: "secondary" });
      });
      this.inventory.append(button);
    }
    if (presentation.fillEmptySlots) {
      for (let index = 0; index < presentation.emptySlots; index += 1) {
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
      previous.disabled = !presentation.canGoPrevious;
      next.disabled = !presentation.canGoNext;
      previous.style.opacity = previous.disabled ? "0.35" : "1";
      next.style.opacity = next.disabled ? "0.35" : "1";
    }
  }

  private setActionText(element: HTMLElement, text: string): void {
    element.querySelector<HTMLElement>("[data-fondale-action-text]")!.textContent = text;
  }

  private showInventoryAction(
    noun: HUDInventoryEntryPresentation,
    button: HTMLButtonElement,
    event?: PointerEvent,
  ): void {
    this.setActionText(this.primaryAction, noun.primary.text);
    const secondary = noun.secondary?.text ?? "";
    this.setActionText(this.secondaryAction, secondary);
    this.secondaryAction.style.display = secondary ? "flex" : "none";
    this.hoveredNoun = null;
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

  private renderNarrative(): void {
    const narrative = this.currentHUD.narrative;
    const signature = narrativeRenderSignature(narrative);
    if (signature === this.narrativeSignature) return;
    this.clearLineTimer();
    if (narrative && !this.narrativeWasActive) {
      this.focusBeforeNarrative =
        document.activeElement instanceof HTMLElement && document.activeElement.isConnected
          ? document.activeElement
          : this.frame;
    }
    this.narrativeSignature = signature;
    this.narrative.replaceChildren();
    if (!narrative) {
      if (this.narrativeWasActive) {
        const target = this.focusBeforeNarrative?.isConnected ? this.focusBeforeNarrative : this.frame;
        target.focus({ preventScroll: true });
      }
      this.narrativeWasActive = false;
      this.focusBeforeNarrative = null;
      return;
    }
    this.narrativeWasActive = true;
    if (narrative.kind === "line") {
      this.presentLine(narrative);
      return;
    }
    if (narrative.kind === "narration") {
      const narration = document.createElement("div");
      narration.dataset.fondaleNarration = "";
      narration.setAttribute("role", "status");
      narration.textContent = narrative.text;
      this.narrative.append(narration);
      this.positionLowerText(narration, narrative, "narration");
      this.frame.focus({ preventScroll: true });
      this.lineTimer = window.setTimeout(() => {
        this.lineTimer = undefined;
        if (!this.currentHUD.system.modal) this.inputHUD({ type: "advance-activity" });
      }, narrative.durationMilliseconds);
    } else if (narrative.kind === "choice") {
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
      narrative.alternatives.forEach((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.fondaleAlternative = String(choice.index);
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
          `color:${narrative.color}`,
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
        button.textContent = choice.label;
        button.addEventListener("click", () => this.inputHUD({
          type: "choose", alternative: choice.index,
        }));
        list.append(button);
      });
      this.narrative.append(list);
      list.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }

  private renderDialogue(): void {
    const conversation = this.core.conversation();
    const reflection = this.core.reflection();
    const presentation = conversation ?? reflection;
    if (conversation) {
      this.dialogueForm.dataset.fondaleConversation = "";
      delete this.dialogueForm.dataset.fondaleReflection;
    } else if (reflection) {
      this.dialogueForm.dataset.fondaleReflection = "";
      delete this.dialogueForm.dataset.fondaleConversation;
    } else {
      delete this.dialogueForm.dataset.fondaleConversation;
      delete this.dialogueForm.dataset.fondaleReflection;
    }
    const visible = presentation !== null && this.currentHUD.narrative === null;
    this.dialogueForm.style.display = visible ? "grid" : "none";
    if (!presentation) {
      this.dialogueWasVisible = false;
      return;
    }
    this.dialogueHeading.textContent = conversation
      ? `Ask ${conversation.character}`
      : "Reflection";
    this.dialogueSubmit.textContent = reflection ? "Reflect" : "Ask";
    this.dialogueInput.maxLength = presentation.maxInputLength;
    const pending = presentation.status === "pending";
    this.dialogueInput.disabled = pending;
    this.dialogueSubmit.disabled = pending;
    this.dialogueStatus.textContent = pending
      ? "Waiting for a response…"
      : presentation.error ?? "";
    if (visible && !this.dialogueWasVisible) {
      this.dialogueInput.focus({ preventScroll: true });
    }
    this.dialogueWasVisible = visible;
  }

  private presentLine(presentation: Extract<HUDNarrativePresentation, { kind: "line" }>): void {
    if (!presentation.layout) return;
    const line = document.createElement("div");
    line.dataset.fondaleLine = "";
    line.setAttribute("role", "status");
    line.textContent = presentation.text;
    this.narrative.append(line);
    this.positionSpeech(line, presentation);
    this.frame.focus({ preventScroll: true });
    const audioDuration = presentation.audio ? this.playLineAudio(presentation.audio) : 0;
    this.lineTimer = window.setTimeout(() => {
      this.lineTimer = undefined;
      if (!this.currentHUD.system.modal) this.inputHUD({ type: "advance-activity" });
    }, Math.max(presentation.durationMilliseconds, audioDuration));
  }

  private positionSpeech(
    element: HTMLElement,
    presentation: Extract<HUDNarrativePresentation, { kind: "line" }>,
  ): void {
    if (!presentation.layout) return;
    const { anchor, maxWidth, safeArea } = presentation.layout;
    element.dataset.fondalePresentation = "speech";
    element.dataset.fondaleSpeaker = presentation.speaker;
    element.style.cssText = [
      "position:absolute",
      `width:${maxWidth}px`,
      `max-width:${maxWidth}px`,
      "white-space:normal",
      "overflow-wrap:anywhere",
      `max-height:${safeArea.bottom - safeArea.top}px`,
      "overflow-y:auto",
      "text-align:center",
      `font-size:${speechFontSize}`,
      `color:${presentation.color}`,
      "box-sizing:border-box",
      "padding:2px 4px",
      "background:transparent",
      "border:0",
      "border-radius:0",
      "box-shadow:none",
      `text-shadow:${speechTextShadow}`,
      "pointer-events:none",
      `display:${presentation.visible ? "block" : "none"}`,
    ].join(";");
    element.style.left = `${Math.max(safeArea.left, Math.min(safeArea.right - maxWidth, anchor.x - maxWidth / 2))}px`;
    const height = element.offsetHeight;
    element.style.top = `${Math.max(safeArea.top, Math.min(safeArea.bottom - height, anchor.y - height - 2))}px`;
  }

  private positionLowerText(
    element: HTMLElement,
    presentation: HUDCommandResponsePresentation | Extract<HUDNarrativePresentation, { kind: "narration" }>,
    kind: "command-response" | "narration",
  ): void {
    const { maxWidth, availableRight, bottom } = presentation.layout;
    element.dataset.fondalePresentation = kind;
    delete element.dataset.fondaleSpeaker;
    element.style.position = "absolute";
    element.style.bottom = "auto";
    element.style.display = presentation.visible ? "block" : "none";
    element.style.boxSizing = "border-box";
    element.style.width = `${Math.min(maxWidth, availableRight - 4)}px`;
    element.style.maxWidth = `${maxWidth}px`;
    element.style.whiteSpace = "normal";
    element.style.overflowWrap = "anywhere";
    element.style.textAlign = "center";
    element.style.padding = "4px 7px";
    element.style.fontSize = kind === "narration" ? speechFontSize : commandResponseFontSize;
    element.style.color = presentation.color;
    element.style.background = colorWithAlpha(this.data.hudTheme?.colors.backing ?? "#071016", 0.88);
    element.style.border = `1px solid ${this.data.hudTheme?.colors.border ?? "#5c7182"}`;
    element.style.borderRadius = "4px";
    element.style.boxShadow = "0 2px 8px rgba(0,0,0,.72)";
    element.style.textShadow = "1px 1px #000,-1px -1px #000";
    element.style.left = `${Math.max(2, (availableRight - Math.min(maxWidth, availableRight - 4)) / 2)}px`;
    element.style.top = `${Math.max(4, this.data.logicalResolution.height - element.offsetHeight - bottom)}px`;
    element.style.zIndex = this.currentHUD.inventory.open ? "21" : "7";
  }

  private renderRevealedNouns(): void {
    this.revealedHotspots.style.display = this.currentHUD.nounsRevealed ? "block" : "none";
    this.revealedHotspots.replaceChildren();
    if (!this.currentHUD.nounsRevealed) return;
    for (const noun of this.currentHUD.nouns) {
      const area = noun.area.map(this.sceneToViewport);
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      if (noun.target.kind === "hotspot") {
        polygon.dataset.fondaleRevealedHotspot = String(noun.target.index);
      } else {
        polygon.dataset.fondaleRevealedPassage = String(noun.target.index);
      }
      polygon.setAttribute("points", area.map(({ x, y }) => `${x},${y}`).join(" "));
      polygon.setAttribute(
        "fill",
        noun.target.kind === "hotspot" ? "rgba(53,167,255,.22)" : "rgba(242,173,98,.18)",
      );
      polygon.setAttribute("stroke", noun.target.kind === "hotspot" ? "#ffffff" : "#f2ad62");
      polygon.setAttribute("stroke-width", "1");
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = noun.label;
      polygon.append(title);
      this.revealedHotspots.append(
        polygon,
        revealLabel(area, noun.label, noun.target.kind),
      );
    }
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.target === this.dialogueInput) {
      if (event.key === "Escape") {
        event.preventDefault();
        this.core.input({ type: "escape" });
      }
      return;
    }
    if (event.key === "F5") {
      event.preventDefault();
      this.openModal(this.currentHUD.system.modal?.kind === "options" ? null : "options");
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
    if (this.currentHUD.system.modal) {
      if (event.key === "Escape") {
        event.preventDefault();
        this.openModal(null);
      }
      return;
    }
    if (event.key === "Escape" && this.currentHUD.sequenceActive) {
      event.preventDefault();
      this.inputHUD({ type: "skip-sequence" });
      return;
    }
    const narrative = this.currentHUD.narrative;
    if (narrative?.kind === "line" || narrative?.kind === "narration") {
      if (event.key === ".") {
        event.preventDefault();
        this.inputHUD({ type: "advance-activity" });
      }
      return;
    }
    if (narrative?.kind === "choice") {
        const numeric = Number(event.key);
        if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 6) {
          const index = narrative.alternatives[numeric - 1]?.index;
          if (index !== undefined) {
            event.preventDefault();
            this.inputHUD({ type: "choose", alternative: index });
          }
          return;
        }
        const buttons = [...this.narrative.querySelectorAll<HTMLButtonElement>("button")];
        const current = Math.max(0, buttons.indexOf(document.activeElement as HTMLButtonElement));
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          event.preventDefault();
          buttons[(current + 1) % buttons.length]?.focus();
        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          event.preventDefault();
          buttons[(current - 1 + buttons.length) % buttons.length]?.focus();
        }
      return;
    }
    if (event.key === "." && this.dismissResponse()) {
      event.preventDefault();
      return;
    }
    if (event.key.toLowerCase() === "i" && this.currentHUD.inventory.keyboardShortcutAvailable) {
      event.preventDefault();
      this.inputHUD({ type: "toggle-inventory" });
      return;
    }
    if (event.key === "Tab" && this.currentHUD.nounRevealControl === "keyboard") {
      event.preventDefault();
      this.inputHUD({ type: "set-nouns-revealed", revealed: true });
      this.renderRevealedNouns();
      return;
    }
    if (event.key === "Escape") {
      if (this.currentHUD.inventory.open) this.inputHUD({ type: "close-inventory" });
      else this.core.input({ type: "escape" });
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (event.key !== "Tab" || this.currentHUD.nounRevealControl !== "keyboard") return;
    event.preventDefault();
    this.inputHUD({ type: "set-nouns-revealed", revealed: false });
    this.renderRevealedNouns();
  };

  private openModal(kind: HUDModalKind | null): void {
    this.clearLineTimer();
    this.inputHUD(kind ? { type: "open-modal", modal: kind } : { type: "close-modal" });
    if (!kind) this.narrativeSignature = "";
  }

  private renderModal(): void {
    const presentation = this.currentHUD.system.modal;
    this.modal.replaceChildren();
    this.modal.style.display = presentation ? "block" : "none";
    if (!presentation) {
      delete this.modal.dataset.fondaleModal;
      return;
    }
    this.modal.dataset.fondaleModal = presentation.kind;
    const heading = document.createElement("h2");
    heading.textContent = presentation.title;
    heading.style.cssText = "font:inherit;margin:0 0 6px;color:#58d6d2";
    this.modal.append(heading);
    if (presentation.kind === "options") this.renderOptions(presentation.audioAvailable);
    else if (presentation.kind === "help") this.renderHelp(presentation.text);
    else if (presentation.kind === "save") this.renderSave(presentation.namePlaceholder);
    else this.renderLoad(presentation);
  }

  private renderOptions(audioAvailable: boolean): void {
    const preferences = this.currentHUD.system.preferences;
    const controls = document.createElement("div");
    controls.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:5px";
    const textSpeed = selectPreference("Text speed", ["slow", "normal", "fast"], preferences.textSpeed);
    const speech = checkboxPreference("Speech text", preferences.speechText);
    controls.append(textSpeed.label, speech.label);
    if (audioAvailable) {
      const volume = document.createElement("input");
      volume.type = "range";
      volume.min = "0";
      volume.max = "1";
      volume.step = "0.05";
      volume.value = String(preferences.audioVolume);
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

  private renderHelp(helpText: string): void {
    const text = document.createElement("p");
    text.dataset.fondaleHelp = "";
    text.textContent = helpText;
    this.modal.append(text, this.modalButton("Back", () => this.openModal("options")));
  }

  private renderSave(placeholder: string): void {
    const name = document.createElement("input");
    name.dataset.fondaleSaveName = "";
    name.placeholder = placeholder;
    const save = this.modalButton("Save", () => {
      this.inputHUD({ type: "save-slot", name: name.value });
    });
    save.dataset.fondaleSaveConfirm = "";
    this.modal.append(name, save);
    name.focus();
  }

  private renderLoad(presentation: Extract<NonNullable<HUDPresentation["system"]["modal"]>, { kind: "load" }>): void {
    const list = document.createElement("div");
    list.dataset.fondaleSaveSlots = "";
    presentation.slots.forEach((slot) => {
      const button = this.modalButton(slot.label, () => {
        this.inputHUD({ type: "load-slot", index: slot.index });
      });
      button.dataset.fondaleLoadSlot = String(slot.index);
      button.disabled = !slot.enabled;
      if (!slot.enabled) {
        button.title = slot.diagnostics.join(" ");
        const diagnostic = document.createElement("p");
        diagnostic.dataset.fondaleLoadDiagnostic = String(slot.index);
        diagnostic.textContent = slot.diagnostics.join(" ");
        list.append(button, diagnostic);
        return;
      }
      list.append(button);
    });
    if (!list.hasChildNodes()) list.textContent = presentation.emptyText;
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
    this.inputHUD({ type: "change-preferences", change });
    this.narrativeSignature = "";
  }

  private persistPreferences(preferences: PlayerPreferences): void {
    localStorage.setItem(preferencesKey(this.data.identity), JSON.stringify(preferences));
  }

  private adapterFacts(): HUDAdapterFacts {
    return {
      audioAvailable: this.assets.audio.size > 0,
      saveSlots: this.controls.slots(),
      speakerSilhouetteTops: Object.fromEntries(
        this.characterIds().flatMap((character) => {
          const top = this.characterSilhouetteTop(character);
          return top === undefined ? [] : [[character, top]];
        }),
      ),
    };
  }

  private renderCommandResponse(previousId: number | null): void {
    const presentation = this.currentHUD.commandResponse;
    if (!presentation) {
      this.clearResponseTimer();
      this.response.textContent = "";
      this.response.style.display = "none";
      return;
    }
    this.response.textContent = presentation.text;
    this.positionLowerText(this.response, presentation, "command-response");
    if (previousId === presentation.id) return;
    this.clearResponseTimer();
    this.responseTimer = window.setTimeout(
      () => this.dismissResponse(),
      presentation.durationMilliseconds,
    );
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

  private actionSignature(noun: HUDNounPresentation): string {
    return `${noun.target.kind}:${noun.target.index}`;
  }

  private playLineAudio(reference: URL | string): number {
    const source = this.assets.audio.get(assetUrl(reference));
    if (!source) return 0;
    source.currentTime = 0;
    source.volume = this.currentHUD.system.preferences.audioVolume;
    this.activeAudio = source;
    void source.play().catch(() => undefined);
    return Number.isFinite(source.duration) ? source.duration * 1_000 : 0;
  }
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

function narrativeRenderSignature(narrative: HUDNarrativePresentation | null): string {
  if (narrative?.kind !== "line" || !narrative.layout) return JSON.stringify(narrative);
  const { anchor: _dynamicAnchor, ...stableLayout } = narrative.layout;
  return JSON.stringify({ ...narrative, layout: stableLayout });
}

function preferencesKey(identity: string): string {
  return `fondale.preferences.${identity}`;
}

function readPreferences(identity: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(preferencesKey(identity)) ?? "null") as unknown;
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

function worldPresentationSignature(world: WorldPresentation): string {
  return JSON.stringify({
    scene: world.scene,
    scenery: world.scenery.map(({ id, appearanceName, position }) => [id, appearanceName, position]),
    characters: world.characters.map(({ id, appearanceName }) => [id, appearanceName]),
    objects: world.objects.map(({ id, appearanceName, groundPoint }) => [id, appearanceName, groundPoint]),
  });
}

function setAnchor(sprite: Sprite, anchor: Point | undefined, width: number, height: number): void {
  sprite.anchor.set(anchor ? anchor.x / width : 0.5, anchor ? anchor.y / height : 1);
}

function boundingBox(area: readonly Point[]): Rectangle {
  const xs = area.map(({ x }) => x);
  const ys = area.map(({ y }) => y);
  const x = Math.floor(Math.min(...xs));
  const y = Math.floor(Math.min(...ys));
  return new Rectangle(x, y, Math.ceil(Math.max(...xs)) - x, Math.ceil(Math.max(...ys)) - y);
}
