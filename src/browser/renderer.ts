import {
  AnimatedSprite,
  Application,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";

import type {
  AvailableHotspot,
  AvailablePassage,
  CoreEffect,
  CoreSession,
  GameState,
} from "../internal/core";
import type {
  EntityAppearance,
  GameProjectData,
  Point,
  SceneryAppearance,
  SequenceStep,
} from "../public/definitions";
import { commandVerbs } from "../public/commands";
import type { AuthoringDiagnostic } from "../public/diagnostics";
import type { SaveSnapshot } from "../public/save";
import { assetUrl, type LoadedAssets } from "./assets";

interface CharacterView {
  readonly container: Container;
  readonly sprite: Sprite | AnimatedSprite;
  readonly appearance: EntityAppearance;
  direction?: "side" | "front" | "back";
}

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
    this.overlay = new EngineOverlay(frame, data, core, controls);
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
    this.world.sortChildren();
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
  }

  private rebuildWorld(state: GameState): void {
    this.world.removeChildren();
    this.characterViews.clear();
    const scene = this.data.scenes[state.currentScene]!;
    const backgroundTexture = this.assets.textures.get(assetUrl(scene.background))!;
    const background = new Sprite(backgroundTexture);
    background.zIndex = Number.NEGATIVE_INFINITY;
    this.world.addChild(background);

    for (const [sceneryId, scenery] of Object.entries(scene.scenery ?? {})) {
      const selected = state.scenery[state.currentScene]?.[sceneryId] ?? scenery.initialAppearance;
      const appearance = scenery.appearances[selected]!;
      const view = this.createScenery(appearance, backgroundTexture);
      view.label = `scenery:${sceneryId}`;
      view.zIndex = scenery.baseline;
      if (scenery.position && appearance.kind === "static") {
        view.position.set(scenery.position.x, scenery.position.y);
      }
      this.world.addChild(view);
    }

    for (const [objectId, object] of Object.entries(state.objects)) {
      if (object.location.kind !== "scene" || object.location.scene !== state.currentScene) continue;
      const definition = this.data.objects[objectId]!;
      const appearance = definition.appearances[object.appearance]!;
      const sprite = this.staticSprite(appearance.image, appearance.visualAnchor);
      sprite.label = `object:${objectId}`;
      sprite.position.set(object.location.groundPoint.x, object.location.groundPoint.y);
      sprite.zIndex = object.location.groundPoint.y;
      sprite.scale.set(scaleAt(scene.perspectiveScale, object.location.groundPoint.y));
      this.world.addChild(sprite);
    }

    for (const [characterId, character] of Object.entries(state.characters)) {
      if (character.scene !== state.currentScene) continue;
      const definition = this.data.characters[characterId]!;
      const appearance = definition.appearances[character.appearance]!;
      const view = this.createCharacter(appearance, `characters.${characterId}.appearances.${character.appearance}`);
      view.container.label = `character:${characterId}`;
      this.characterViews.set(characterId, view);
      this.world.addChild(view.container);
    }
  }

  private createScenery(appearance: SceneryAppearance, background: Texture): Container {
    if (appearance.kind === "static") {
      const container = new Container();
      container.addChild(this.staticSprite(appearance.image, appearance.visualAnchor));
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

  private createCharacter(appearance: EntityAppearance, path: string): CharacterView {
    const container = new Container();
    if (appearance.kind === "static") {
      const sprite = this.staticSprite(appearance.image, appearance.visualAnchor);
      container.addChild(sprite);
      return { container, sprite, appearance };
    }
    const frames = this.assets.walkFrames.get(`${path}.front`)!;
    const sprite = new AnimatedSprite([...frames]);
    const texture = frames[0]!;
    setAnchor(sprite, appearance.visualAnchor, texture.width, texture.height);
    sprite.animationSpeed = appearance.framesPerSecond / 60;
    container.addChild(sprite);
    return { container, sprite, appearance, direction: "front" };
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
      if (view.appearance.kind === "walking" && view.sprite instanceof AnimatedSprite) {
        if (view.direction !== direction) {
          view.direction = direction;
          const appearance = state.characters[characterId]!.appearance;
          view.sprite.textures = [
            ...this.assets.walkFrames.get(
              `characters.${characterId}.appearances.${appearance}.${direction}`,
            )!,
          ];
        }
        const walking =
          state.activity?.type === "player-intent" && characterId === this.data.playerCharacter;
        if (walking && !view.sprite.playing) view.sprite.play();
        if (!walking && view.sprite.playing) view.sprite.gotoAndStop(0);
      }
    }
  }

  private staticSprite(url: URL | string, anchor?: Point): Sprite {
    const texture = this.assets.textures.get(assetUrl(url))!;
    const sprite = new Sprite(texture);
    setAnchor(sprite, anchor, texture.width, texture.height);
    return sprite;
  }

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.overlay.blocksWorldInput()) return;
    const activity = this.core.snapshot().activity;
    if (event.button === 1 && activity?.type === "sequence" && activity.active?.kind === "line") {
      event.preventDefault();
      this.core.input({ type: "advance-sequence" });
      return;
    }
    if (event.button !== 0) return;
    this.frame.focus({ preventScroll: true });
    const point = this.scenePoint(event);
    if (this.core.snapshot().activity?.type === "sequence") return;
    const target = this.core.hitTest(point);
    if (target?.kind === "hotspot") {
      this.core.input({ type: "activate-hotspot", hotspot: target.index });
    } else if (target?.kind === "passage") {
      this.core.input({ type: "activate-passage", passage: target.index, fast: event.detail >= 2 });
    } else this.core.input({ type: "move", point, fast: event.detail >= 2 });
  };

  private readonly onContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
    this.overlay.showHint("right-click", "Click destro: esegue il Preferred Verb.");
    this.frame.focus({ preventScroll: true });
    if (this.overlay.blocksWorldInput() || this.core.snapshot().activity?.type === "sequence") return;
    const point = this.scenePoint(event);
    const target = this.core.hitTest(point);
    if (target?.kind === "hotspot") {
      this.core.input({ type: "quick-hotspot", hotspot: target.index });
    } else if (target?.kind === "passage") {
      this.core.input({ type: "activate-passage", passage: target.index });
    }
  };

  private readonly onDoubleClick = (event: MouseEvent): void => {
    if (this.overlay.blocksWorldInput() || this.core.snapshot().activity?.type === "sequence") return;
    const point = this.scenePoint(event);
    const target = this.core.hitTest(point);
    if (target?.kind === "passage") {
      this.core.input({ type: "activate-passage", passage: target.index, fast: true });
    } else if (!target) {
      this.core.input({ type: "move", point, fast: true });
    }
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const point = this.scenePoint(event);
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
    this.overlay.showCursor(point);
  };

  private readonly onPointerLeave = (): void => {
    this.overlay.showAction(undefined);
    this.overlay.hideCursor();
  };

  private scenePoint(event: Pick<MouseEvent, "clientX" | "clientY">): Point {
    const bounds = this.application.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * this.data.logicalResolution.width,
      y: ((event.clientY - bounds.top) / bounds.height) * this.data.logicalResolution.height,
    };
  }
}

class EngineOverlay {
  private readonly root = document.createElement("div");
  private readonly action = document.createElement("div");
  private readonly response = document.createElement("div");
  private readonly verbs = document.createElement("div");
  private readonly inventory = document.createElement("div");
  private readonly inventoryNav = document.createElement("div");
  private readonly hint = document.createElement("div");
  private readonly activity = document.createElement("div");
  private readonly modal = document.createElement("section");
  private readonly reveal = document.createElement("button");
  private readonly revealedHotspots = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  private inventorySignature = "";
  private activitySignature = "";
  private focusBeforeSequence: HTMLElement | null = null;
  private sequenceWasActive = false;
  private hotspotsRevealed = false;
  private hoveredPreferredVerb: string | null = null;
  private hoveredHotspot: AvailableHotspot | AvailablePassage | null = null;
  private modalKind: "options" | "help" | "save" | "load" | null = null;
  private preferences: PlayerPreferences;
  private inventoryPage = 0;
  private previousInventoryCount = 0;
  private lineTimer: number | undefined;

  constructor(
    private readonly frame: HTMLElement,
    private readonly data: GameProjectData,
    private readonly core: CoreSession,
    private readonly controls: BrowserSessionControls,
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
      left: "4px",
      top: "4px",
      maxWidth: "120px",
      whiteSpace: "nowrap",
    });
    Object.assign(this.response.style, {
      position: "absolute",
      left: "10%",
      right: "10%",
      bottom: "42px",
      textAlign: "center",
    });
    this.response.setAttribute("aria-live", "polite");
    if (data.commandLexicon) {
      this.verbs.setAttribute("aria-label", "Verbs");
      this.verbs.style.cssText = [
        "position:absolute",
        "display:grid",
        "grid-template-columns:repeat(3,46px)",
        "gap:1px",
        "left:4px",
        "bottom:4px",
        "pointer-events:auto",
      ].join(";");
      for (const verb of commandVerbs) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.fondaleVerb = verb;
        button.textContent = data.commandLexicon.verbs[verb];
        button.setAttribute("aria-pressed", "false");
        button.style.cssText = overlayButtonStyle;
        if (data.hudTheme) {
          button.style.color = data.hudTheme.colors.text;
          button.style.borderColor = data.hudTheme.colors.border;
          button.style.background = data.hudTheme.colors.backing;
        }
        button.addEventListener("click", () => this.core.input({ type: "select-verb", verb }));
        this.verbs.append(button);
      }
    }
    Object.assign(this.inventory.style, {
      position: "absolute",
      display: "flex",
      gap: "2px",
      right: "4px",
      bottom: "4px",
      pointerEvents: "auto",
    });
    this.inventory.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.changeInventoryPage(event.deltaY > 0 ? 1 : -1);
      this.showHint("inventory", "Usa la rotellina o le frecce per scorrere l'Inventory.");
    });
    this.inventoryNav.style.cssText = "position:absolute;right:143px;bottom:28px;display:flex;flex-direction:column;pointer-events:auto";
    const previous = this.modalButton("‹", () => this.changeInventoryPage(-1));
    previous.dataset.fondaleInventoryPrevious = "";
    previous.setAttribute("aria-label", "Previous Inventory page");
    const next = this.modalButton("›", () => this.changeInventoryPage(1));
    next.dataset.fondaleInventoryNext = "";
    next.setAttribute("aria-label", "Next Inventory page");
    this.inventoryNav.append(previous, next);
    this.hint.dataset.fondaleHint = "";
    this.hint.setAttribute("role", "status");
    this.hint.style.cssText = "position:absolute;left:145px;bottom:66px;width:136px;text-align:center;color:#f2ad62;pointer-events:none";
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
      this.verbs,
      this.inventory,
      this.inventoryNav,
      this.reveal,
      this.activity,
      this.hint,
      this.modal,
    );
    this.frame.append(this.root);
    this.frame.addEventListener("keydown", this.onKeyDown);
    this.frame.addEventListener("keyup", this.onKeyUp);
    this.updatePreference({});
    this.showHint("left-click", "Click sinistro: cammina o completa un Command.");
  }

  blocksWorldInput(): boolean {
    return this.modalKind !== null;
  }

  showHint(kind: string, text: string): void {
    if (this.preferences.shownHints.includes(kind)) return;
    this.preferences = {
      ...this.preferences,
      shownHints: [...this.preferences.shownHints, kind],
    };
    localStorage.setItem(preferencesKey(this.data.identity), JSON.stringify(this.preferences));
    this.hint.textContent = text;
  }

  render(state: GameState, effects: readonly CoreEffect[]): void {
    const latestResponse = [...effects].reverse().find(({ type }) => type === "interaction-response");
    if (latestResponse?.type === "interaction-response") {
      this.response.textContent = latestResponse.text;
      const presentation = latestResponse.response?.presentation ?? "speech";
      const speaker = latestResponse.response?.speaker ?? this.data.playerCharacter;
      this.positionSpeech(this.response, state, presentation, speaker);
    }
    for (const button of this.verbs.querySelectorAll<HTMLButtonElement>("button")) {
      const selected = button.dataset.fondaleVerb === state.command.verb;
      const preferred = button.dataset.fondaleVerb === this.hoveredPreferredVerb;
      button.setAttribute("aria-pressed", String(selected));
      button.style.outline = selected ? "2px double white" : "none";
      button.style.color = selected
        ? this.data.hudTheme?.colors.selected ?? "white"
        : preferred
          ? this.data.hudTheme?.colors.preferred ?? "#f2ad62"
          : this.data.hudTheme?.colors.text ?? "white";
    }
    this.renderInventory(state);
    if (!this.hoveredHotspot) {
      const firstNoun = state.command.firstNoun;
      if (firstNoun && state.command.verb !== "walk-to") {
        const noun = this.core.availableInventory().find(({ object }) => object === firstNoun.object);
        const label = this.data.commandLexicon?.verbs[state.command.verb];
        this.action.textContent = noun && label ? `${label} ${noun.label}` : "";
      } else {
        this.action.textContent = "";
      }
    }
    this.renderActivity(state);
    const choosing = state.activity?.type === "sequence" && state.activity.active?.kind === "choice";
    this.verbs.style.visibility = choosing ? "hidden" : "visible";
    this.inventory.style.visibility = choosing ? "hidden" : "visible";
    if (this.hotspotsRevealed) this.renderRevealedHotspots();
  }

  showAction(hotspot: AvailableHotspot | AvailablePassage | undefined): void {
    const state = this.core.snapshot();
    this.hoveredHotspot = hotspot ?? null;
    this.hoveredPreferredVerb = hotspot?.preferredVerb ?? null;
    if (!hotspot) {
      this.action.textContent = "";
      return;
    }
    const verb = state.command.verb === "walk-to" ? hotspot.preferredVerb : state.command.verb;
    const verbLabel = verb && verb !== "walk-to" ? this.data.commandLexicon?.verbs[verb] : undefined;
    const firstNoun = state.command.firstNoun
      ? this.core.availableInventory().find(({ object }) => object === state.command.firstNoun?.object)
      : undefined;
    if (verbLabel && firstNoun && (verb === "give" || verb === "use")) {
      const pattern = this.data.commandLexicon?.patterns[verb];
      this.action.textContent = pattern
        ?.replace("{verb}", verbLabel)
        .replace("{first}", firstNoun.label)
        .replace("{second}", hotspot.label) ?? `${verbLabel} ${firstNoun.label} ${hotspot.label}`;
    } else {
      this.action.textContent = verbLabel ? `${verbLabel} ${hotspot.label}` : hotspot.label;
    }
  }

  showCursor(point: Point): void {
    if (this.preferences.commandPreview === "pointer") {
      this.action.style.left = `${Math.max(2, Math.min(this.data.logicalResolution.width - 122, point.x + 6))}px`;
      this.action.style.top = `${Math.max(2, Math.min(this.data.logicalResolution.height - 12, point.y + 6))}px`;
    }
  }

  hideCursor(): void {
  }

  destroy(): void {
    this.clearLineTimer();
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
    const signature = JSON.stringify([state.inventory, state.command, this.inventoryPage]);
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
        "padding:0",
        "border:1px solid white",
        `outline:${selected ? "2px double white" : "none"}`,
        `background:${this.data.hudTheme?.colors.inventoryWell ?? "#211b2d"}`,
        "image-rendering:pixelated",
      ].join(";");
      const image = document.createElement("img");
      const size = this.data.inventoryAppearanceSize ?? 32;
      image.width = size;
      image.height = size;
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
      button.addEventListener("click", () => this.core.input({ type: "activate-object", object: objectId }));
      this.inventory.append(button);
    }
    if (this.data.commandLexicon) {
      for (let index = visibleObjects.length; index < 8; index += 1) {
        const empty = document.createElement("span");
        empty.dataset.fondaleInventorySlot = "empty";
        empty.setAttribute("aria-hidden", "true");
        empty.style.cssText = `display:block;width:32px;height:32px;border:1px solid ${this.data.hudTheme?.colors.border ?? "rgba(255,255,255,.45)"};background:${this.data.hudTheme?.colors.inventoryWell ?? "rgba(20,15,28,.55)"}`;
        this.inventory.append(empty);
      }
      this.inventory.style.display = "grid";
      this.inventory.style.gridTemplateColumns = "repeat(4,34px)";
      this.inventoryNav.querySelector<HTMLButtonElement>("[data-fondale-inventory-previous]")!.disabled = this.inventoryPage === 0;
      this.inventoryNav.querySelector<HTMLButtonElement>("[data-fondale-inventory-next]")!.disabled = this.inventoryPage >= maximumPage;
    }
  }

  private changeInventoryPage(amount: number): void {
    const maximumPage = Math.max(0, Math.ceil(this.core.snapshot().inventory.objects.length / 8) - 1);
    this.inventoryPage = Math.max(0, Math.min(maximumPage, this.inventoryPage + amount));
    this.inventorySignature = "";
  }

  private renderActivity(state: GameState): void {
    const sequence = state.activity?.type === "sequence" ? state.activity : null;
    const signature = JSON.stringify(sequence);
    if (signature === this.activitySignature) return;
    this.clearLineTimer();
    if (sequence && !this.sequenceWasActive) {
      this.focusBeforeSequence =
        document.activeElement instanceof HTMLElement && document.activeElement.isConnected
          ? document.activeElement
          : this.frame;
    }
    this.activitySignature = signature;
    this.activity.replaceChildren();
    if (!sequence?.active) {
      if (this.sequenceWasActive) {
        const target = this.focusBeforeSequence?.isConnected ? this.focusBeforeSequence : this.frame;
        target.focus({ preventScroll: true });
      }
      this.sequenceWasActive = false;
      this.focusBeforeSequence = null;
      return;
    }
    this.sequenceWasActive = true;
    const definition = this.data.sequences[sequence.sequence]!;
    const step = resolvePath(definition, sequence.active.path) as SequenceStep;
    if (sequence.active.kind === "line") {
      const isChoiceSpeech = sequence.active.choiceText !== undefined;
      const authoredLine = step.type === "line" ? step : undefined;
      if (!isChoiceSpeech && !authoredLine) return;
      const line = document.createElement("div");
      line.dataset.fondaleLine = "";
      line.setAttribute("role", "status");
      line.textContent = isChoiceSpeech ? sequence.active.choiceText! : authoredLine!.text;
      const speaker = isChoiceSpeech ? sequence.active.choiceCharacter : authoredLine?.character;
      this.positionSpeech(line, state, speaker ? "speech" : "narration", speaker);
      this.activity.append(line);
      this.frame.focus({ preventScroll: true });
      const millisecondsPerCharacter = {
        slow: 130,
        normal: 80,
        fast: 25,
      }[this.preferences.textSpeed];
      const minimumDuration = { slow: 7_000, normal: 4_000, fast: 600 }[
        this.preferences.textSpeed
      ];
      const duration = Math.max(minimumDuration, (line.textContent?.length ?? 0) * millisecondsPerCharacter);
      this.lineTimer = window.setTimeout(() => {
        this.lineTimer = undefined;
        if (!this.modalKind) this.core.input({ type: "advance-sequence" });
      }, duration);
    } else if (sequence.active.kind === "choice" && step.type === "choice") {
      const list = document.createElement("div");
      list.dataset.fondaleChoice = "";
      list.style.cssText = "display:grid;gap:2px;pointer-events:auto";
      for (const alternative of sequence.active.eligibleAlternatives) {
        const choice = alternative === -1 ? step.fallback : step.alternatives[alternative]!;
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.fondaleAlternative = String(alternative);
        button.style.cssText = overlayButtonStyle;
        button.textContent = choice.text;
        button.addEventListener("click", () => this.core.input({ type: "choose", alternative }));
        list.append(button);
      }
      this.activity.append(list);
      list.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }

  private positionSpeech(
    element: HTMLElement,
    state: GameState,
    presentation: "speech" | "narration",
    speaker?: string,
  ): void {
    const character = speaker ? state.characters[speaker] : undefined;
    const visible = character?.scene === state.currentScene;
    element.dataset.fondalePresentation = presentation;
    if (speaker) element.dataset.fondaleSpeaker = speaker;
    else delete element.dataset.fondaleSpeaker;
    element.style.cssText = [
      "position:absolute",
      `width:${this.data.hudTheme?.maxSpeechWidth ?? 150}px`,
      `max-width:${this.data.hudTheme?.maxSpeechWidth ?? 150}px`,
      "white-space:normal",
      "text-align:center",
      `color:${speaker && this.data.hudTheme?.speechColors[speaker] || this.data.hudTheme?.colors.text || "#f4dfb4"}`,
      "text-shadow:1px 1px #000",
      "pointer-events:none",
      `display:${this.preferences.speechText ? "block" : "none"}`,
    ].join(";");
    if (presentation === "speech" && visible && character) {
      const width = this.data.hudTheme?.maxSpeechWidth ?? 150;
      element.style.left = `${Math.max(2, Math.min(this.data.logicalResolution.width - width - 2, character.groundPoint.x - width / 2))}px`;
      element.style.top = `${Math.max(4, Math.min(this.data.logicalResolution.height - 80, character.groundPoint.y - 45))}px`;
    } else {
      element.style.left = `${(this.data.logicalResolution.width - (this.data.hudTheme?.maxSpeechWidth ?? 150)) / 2}px`;
      element.style.top = "72px";
    }
  }

  private renderRevealedHotspots(): void {
    this.revealedHotspots.style.display = this.hotspotsRevealed ? "block" : "none";
    this.revealedHotspots.replaceChildren();
    if (!this.hotspotsRevealed) return;
    for (const hotspot of this.core.availableHotspots()) {
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.dataset.fondaleRevealedHotspot = String(hotspot.index);
      polygon.setAttribute("points", hotspot.area.map(({ x, y }) => `${x},${y}`).join(" "));
      polygon.setAttribute("fill", "rgba(53,167,255,.22)");
      polygon.setAttribute("stroke", "#ffffff");
      polygon.setAttribute("stroke-width", "1");
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = hotspot.label;
      polygon.append(title);
      this.revealedHotspots.append(polygon);
    }
    for (const passage of this.core.availablePassages()) {
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.dataset.fondaleRevealedPassage = String(passage.index);
      polygon.setAttribute("points", passage.area.map(({ x, y }) => `${x},${y}`).join(" "));
      polygon.setAttribute("fill", "rgba(242,173,98,.18)");
      polygon.setAttribute("stroke", "#f2ad62");
      polygon.setAttribute("stroke-width", "1");
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = passage.label;
      polygon.append(title);
      this.revealedHotspots.append(polygon);
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
    if (state.activity?.type === "sequence") {
      if (event.key === "." && state.activity.active?.kind === "line") {
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
    const keyboardVerbs = {
      q: "open", w: "pick-up", e: "push",
      a: "close", s: "look-at", d: "pull",
      z: "give", x: "talk-to", c: "use",
    } as const;
    if (event.key === "Tab" && this.data.commandLexicon) {
      event.preventDefault();
      this.hotspotsRevealed = true;
      this.showHint("tab", "Tieni premuto Tab per rivelare i Noun attivi.");
      this.renderRevealedHotspots();
      return;
    }
    const verb = keyboardVerbs[event.key.toLowerCase() as keyof typeof keyboardVerbs];
    if (verb) {
      event.preventDefault();
      this.core.input({ type: "select-verb", verb });
    } else if (event.key === "Escape") this.core.input({ type: "escape" });
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (event.key !== "Tab" || !this.data.commandLexicon) return;
    event.preventDefault();
    this.hotspotsRevealed = false;
    this.renderRevealedHotspots();
  };

  private openModal(kind: EngineOverlay["modalKind"]): void {
    this.clearLineTimer();
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
    const preview = selectPreference("Command preview", ["pointer", "sentence-line"], this.preferences.commandPreview);
    const speech = checkboxPreference("Speech text", this.preferences.speechText);
    const backing = checkboxPreference("HUD backing", this.preferences.hudBacking);
    const opacity = document.createElement("input");
    opacity.type = "range";
    opacity.min = "0.35";
    opacity.max = "1";
    opacity.step = "0.05";
    opacity.value = String(this.preferences.hudOpacity);
    opacity.setAttribute("aria-label", "HUD opacity");
    controls.append(textSpeed.label, preview.label, speech.label, backing.label, opacity);
    textSpeed.select.addEventListener("change", () => this.updatePreference({ textSpeed: textSpeed.select.value as PlayerPreferences["textSpeed"] }));
    preview.select.addEventListener("change", () => this.updatePreference({ commandPreview: preview.select.value as PlayerPreferences["commandPreview"] }));
    speech.input.addEventListener("change", () => this.updatePreference({ speechText: speech.input.checked }));
    backing.input.addEventListener("change", () => this.updatePreference({ hudBacking: backing.input.checked }));
    opacity.addEventListener("input", () => this.updatePreference({ hudOpacity: Number(opacity.value) }));
    this.modal.append(controls, this.modalButton("Help", () => this.openModal("help")), this.modalButton("Save", () => this.openModal("save")), this.modalButton("Load", () => this.openModal("load")));
  }

  private renderHelp(): void {
    const text = document.createElement("p");
    text.dataset.fondaleHelp = "";
    text.textContent = "Mouse: left walk/Command, right Preferred Verb, middle skip Line. Tab reveal. Wheel Inventory. QWE/ASD/ZXC Verbs. 1–6 Choice. F5 Options. Ctrl+S Save. Ctrl+L Load. Period skips a Line. Escape cancels a Command or a skippable Sequence.";
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

  private updatePreference(change: Partial<PlayerPreferences>): void {
    this.preferences = { ...this.preferences, ...change };
    localStorage.setItem(preferencesKey(this.data.identity), JSON.stringify(this.preferences));
    this.root.style.setProperty("--fondale-hud-opacity", String(this.preferences.hudOpacity));
    this.verbs.style.opacity = String(this.preferences.hudOpacity);
    this.inventory.style.opacity = String(this.preferences.hudOpacity);
    this.root.style.background = this.preferences.hudBacking
      ? `linear-gradient(to bottom, transparent 75%, ${this.data.hudTheme?.colors.backing ?? "rgba(12,22,38,.78)"} 75%)`
      : "none";
    if (this.preferences.commandPreview === "sentence-line") {
      this.action.style.left = "153px";
      this.action.style.top = "174px";
      this.action.style.textAlign = "center";
    } else {
      this.action.style.textAlign = "left";
    }
    this.activitySignature = "";
  }

  private clearLineTimer(): void {
    if (this.lineTimer !== undefined) window.clearTimeout(this.lineTimer);
    this.lineTimer = undefined;
  }
}

interface PlayerPreferences {
  readonly textSpeed: "slow" | "normal" | "fast";
  readonly speechText: boolean;
  readonly hudBacking: boolean;
  readonly hudOpacity: number;
  readonly commandPreview: "pointer" | "sentence-line";
  readonly shownHints: readonly string[];
}

const defaultPreferences: PlayerPreferences = {
  textSpeed: "normal",
  speechText: true,
  hudBacking: true,
  hudOpacity: 0.9,
  commandPreview: "pointer",
  shownHints: [],
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
      hudOpacity: typeof value.hudOpacity === "number" && value.hudOpacity >= 0.35 && value.hudOpacity <= 1
        ? value.hudOpacity
        : defaultPreferences.hudOpacity,
      shownHints: Array.isArray(value.shownHints) ? value.shownHints.filter((hint): hint is string => typeof hint === "string") : [],
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
  "font:7px/1.25 monospace",
  "color:white",
  "background:rgba(20,15,28,.9)",
  "border:1px solid white",
  "padding:3px",
  "text-shadow:1px 1px #000",
].join(";");

function sceneSignature(state: GameState): string {
  return JSON.stringify({
    scene: state.currentScene,
    scenery: state.scenery[state.currentScene],
    characters: Object.fromEntries(
      Object.entries(state.characters).map(([id, character]) => [id, [character.scene, character.appearance]]),
    ),
    objects: state.objects,
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

function resolvePath(value: unknown, path: string): unknown {
  return path.split("/").reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}
