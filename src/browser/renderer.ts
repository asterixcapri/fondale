import {
  AnimatedSprite,
  Application,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";

import type { CoreEffect, CoreSession, GameState } from "../internal/core";
import type {
  EntityAppearance,
  GameProjectData,
  Point,
  SceneryAppearance,
  SequenceStep,
} from "../public/definitions";
import { commandVerbs } from "../public/commands";
import { assetUrl, type LoadedAssets } from "./assets";

interface CharacterView {
  readonly container: Container;
  readonly sprite: Sprite | AnimatedSprite;
  readonly appearance: EntityAppearance;
  direction?: "side" | "front" | "back";
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
  ) {
    this.world.sortableChildren = true;
    this.overlay = new EngineOverlay(frame, data, core);
    application.stage.addChild(this.world);
    application.canvas.setAttribute("aria-label", "Fondale game world");
    application.canvas.addEventListener("pointerup", this.onPointerUp);
    application.canvas.addEventListener("pointermove", this.onPointerMove);
    application.canvas.addEventListener("pointerleave", this.onPointerLeave);
  }

  render(state: GameState, effects: readonly CoreEffect[]): void {
    const signature = sceneSignature(state);
    if (signature !== this.sceneSignature) {
      this.sceneSignature = signature;
      this.rebuildWorld(state);
    }
    this.updateCharacters(state);
    this.world.sortChildren();
    this.application.canvas.style.cursor = state.inventory.selected ? "none" : "pointer";
    this.overlay.render(state, effects);
    this.application.renderer.render(this.application.stage);
  }

  destroy(): void {
    this.application.canvas.removeEventListener("pointerup", this.onPointerUp);
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
    this.frame.focus({ preventScroll: true });
    const point = this.scenePoint(event);
    if (this.core.snapshot().activity?.type === "sequence") return;
    const target = this.core.hitTest(point);
    if (target?.kind === "hotspot") {
      this.core.input({ type: "activate-hotspot", hotspot: target.index });
    } else if (target?.kind === "passage") {
      this.core.input({ type: "activate-passage", passage: target.index });
    } else this.core.input({ type: "move", point });
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const point = this.scenePoint(event);
    const target = this.core.hitTest(point);
    const hotspot = target?.kind === "hotspot"
      ? this.core.availableHotspots().find(({ index }) => index === target.index)
      : undefined;
    this.overlay.showAction(hotspot?.label ?? "");
    this.overlay.showCursor(point);
  };

  private readonly onPointerLeave = (): void => {
    this.overlay.showAction("");
    this.overlay.hideCursor();
  };

  private scenePoint(event: PointerEvent): Point {
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
  private readonly activity = document.createElement("div");
  private readonly inventoryCursor = document.createElement("img");
  private readonly reveal = document.createElement("button");
  private readonly revealedHotspots = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  private inventorySignature = "";
  private activitySignature = "";
  private focusBeforeSequence: HTMLElement | null = null;
  private sequenceWasActive = false;
  private cursorPoint: Point | null = null;
  private hotspotsRevealed = false;

  constructor(
    private readonly frame: HTMLElement,
    private readonly data: GameProjectData,
    private readonly core: CoreSession,
  ) {
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
      font: "7px/1.25 monospace",
      textShadow: "1px 1px #000",
      pointerEvents: "none",
    });
    Object.assign(this.action.style, { position: "absolute", left: "4px", top: "4px" });
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
    Object.assign(this.activity.style, {
      position: "absolute",
      inset: "0",
      display: "grid",
      alignItems: "end",
      padding: "4px 20px 8px",
      boxSizing: "border-box",
      pointerEvents: "none",
    });
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
    this.revealedHotspots.dataset.fondaleRevealedHotspots = "";
    this.revealedHotspots.setAttribute(
      "viewBox",
      `0 0 ${data.logicalResolution.width} ${data.logicalResolution.height}`,
    );
    this.revealedHotspots.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    this.revealedHotspots.style.display = "none";
    this.inventoryCursor.dataset.fondaleInventoryCursor = "";
    this.inventoryCursor.alt = "";
    this.inventoryCursor.setAttribute("aria-hidden", "true");
    const cursorSize = data.inventoryAppearanceSize ?? 32;
    this.inventoryCursor.width = cursorSize;
    this.inventoryCursor.height = cursorSize;
    this.inventoryCursor.style.cssText = [
      "position:absolute",
      "display:none",
      "pointer-events:none",
      "transform:translate(-50%,-50%)",
      "image-rendering:pixelated",
      "z-index:2",
    ].join(";");
    this.root.append(
      this.revealedHotspots,
      this.inventoryCursor,
      this.action,
      this.response,
      this.verbs,
      this.inventory,
      this.reveal,
      this.activity,
    );
    this.frame.append(this.root);
    this.frame.addEventListener("keydown", this.onKeyDown);
  }

  render(state: GameState, effects: readonly CoreEffect[]): void {
    const latestResponse = [...effects].reverse().find(({ type }) => type === "interaction-response");
    if (latestResponse?.type === "interaction-response") this.response.textContent = latestResponse.text;
    for (const button of this.verbs.querySelectorAll<HTMLButtonElement>("button")) {
      const selected = button.dataset.fondaleVerb === state.command.verb;
      button.setAttribute("aria-pressed", String(selected));
      button.style.outline = selected ? "2px double white" : "none";
    }
    this.renderInventory(state);
    this.renderActivity(state);
    if (this.hotspotsRevealed) this.renderRevealedHotspots();
  }

  showAction(label: string): void {
    this.action.textContent = label;
  }

  showCursor(point: Point): void {
    this.cursorPoint = point;
    this.positionInventoryCursor();
  }

  hideCursor(): void {
    this.cursorPoint = null;
    this.inventoryCursor.style.display = "none";
  }

  destroy(): void {
    this.root.parentElement?.removeEventListener("keydown", this.onKeyDown);
    this.root.remove();
  }

  private renderInventory(state: GameState): void {
    const signature = JSON.stringify(state.inventory);
    if (signature === this.inventorySignature) return;
    this.inventorySignature = signature;
    this.inventory.replaceChildren();
    const selectedObject = state.inventory.selected;
    if (selectedObject) {
      this.inventoryCursor.src = assetUrl(this.data.objects[selectedObject]!.inventoryAppearance);
      this.positionInventoryCursor();
    } else {
      this.inventoryCursor.removeAttribute("src");
      this.inventoryCursor.style.display = "none";
    }
    for (const objectId of state.inventory.objects) {
      const selected = state.inventory.selected === objectId;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.fondaleInventoryObject = objectId;
      button.setAttribute("aria-label", `${selected ? "Deselect" : "Select"} ${objectId}`);
      button.setAttribute("aria-pressed", String(selected));
      button.style.cssText = [
        "position:relative",
        "padding:0",
        "border:1px solid white",
        `outline:${selected ? "2px double white" : "none"}`,
        "background:#211b2d",
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
      button.addEventListener("click", () => this.core.input({ type: "select-object", object: objectId }));
      this.inventory.append(button);
    }
  }

  private renderActivity(state: GameState): void {
    const sequence = state.activity?.type === "sequence" ? state.activity : null;
    const signature = JSON.stringify(sequence);
    if (signature === this.activitySignature) return;
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
    if (sequence.active.kind === "line" && step.type === "line") {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.fondaleLine = "";
      button.style.cssText = overlayButtonStyle;
      button.style.pointerEvents = "auto";
      button.textContent = `${step.character ? `${step.character}: ` : ""}${step.text}`;
      button.addEventListener("click", () => this.core.input({ type: "advance-sequence" }));
      this.activity.append(button);
      button.focus();
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

  private positionInventoryCursor(): void {
    if (!this.cursorPoint || !this.inventoryCursor.src) {
      this.inventoryCursor.style.display = "none";
      return;
    }
    this.inventoryCursor.style.left = `${this.cursorPoint.x}px`;
    this.inventoryCursor.style.top = `${this.cursorPoint.y}px`;
    this.inventoryCursor.style.display = "block";
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
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const state = this.core.snapshot();
    if (state.activity?.type === "sequence") {
      if ((event.key === "Enter" || event.key === " ") && state.activity.active?.kind === "line") {
        event.preventDefault();
        this.core.input({ type: "advance-sequence" });
      } else if (state.activity.active?.kind === "choice") {
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
      return;
    }
    if (event.key === "Escape") this.core.input({ type: "escape" });
  };
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
