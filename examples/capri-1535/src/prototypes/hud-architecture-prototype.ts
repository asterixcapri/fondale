// PROTOTYPE — throw this UI away after it answers how scene, commands, and Inventory share the frame.
// Three architecture variants on the existing Capri route, switchable via ?variant=A|B|C.

import raffaeleUrl from "../characters/raffaele/idle.png";
import keyUrl from "../objects/key/inventory.png";
import oilFlaskUrl from "../objects/oil-flask/inventory.png";
import winchHandleUrl from "../objects/winch-handle/inventory.png";
import harbourBackgroundUrl from "../scenes/harbour/background.png";
import "./hud-architecture-prototype.css";

type VariantKey = "A" | "B" | "C";
type DemoState = "rest" | "command" | "combine" | "inventory" | "speech" | "choices" | "reveal";
type SceneKey = "harbour" | "aiano" | "boffe";

interface PrototypeState {
  demo: DemoState;
  scene: SceneKey;
  inventoryPage: number;
  tabHeld: boolean;
}

interface VariantDefinition {
  key: VariantKey;
  name: string;
  summary: string;
  sceneShare: string;
  uiShare: string;
  occlusion: string;
}

interface InventoryItem {
  name: string;
  image?: string;
  glyph?: string;
}

const prototypeArtUrl = (scene: "aiano" | "boffe"): string =>
  ["", "art", "scenes", scene, "background.png"].join("/");

const variants: readonly VariantDefinition[] = [
  {
    key: "A",
    name: "Pannello dedicato",
    summary: "Modello Monkey Island 2: la scena finisce sopra una fascia opaca permanente.",
    sceneShare: "67%",
    uiShare: "33% dedicato",
    occlusion: "Nessuna",
  },
  {
    key: "B",
    name: "Overlay trasparente",
    summary: "Modello Thimbleweed Park: la scena è intera, ma verbi e Inventory le stanno sopra.",
    sceneShare: "100% dietro la UI",
    uiShare: "26% in overlay",
    occlusion: "Persistente",
  },
  {
    key: "C",
    name: "UI contestuale",
    summary: "Modello Full Throttle / Return: comandi e Inventory appaiono solo quando servono.",
    sceneShare: "100% a riposo",
    uiShare: "0% persistente",
    occlusion: "Temporanea",
  },
];

const scenes: Readonly<Record<SceneKey, { label: string; image: string; crop: string }>> = {
  harbour: { label: "Porto", image: harbourBackgroundUrl, crop: "center center" },
  aiano: { label: "Aiano", image: prototypeArtUrl("aiano"), crop: "center 55%" },
  boffe: { label: "Boffe", image: prototypeArtUrl("boffe"), crop: "center 54%" },
};

const verbs = [
  ["Apri", "open"],
  ["Raccogli", "pick-up"],
  ["Spingi", "push"],
  ["Chiudi", "close"],
  ["Guarda", "look-at"],
  ["Tira", "pull"],
  ["Dai", "give"],
  ["Parla con", "talk-to"],
  ["Usa", "use"],
] as const;

const inventory: readonly InventoryItem[] = [
  { name: "Chiave d'ottone", image: keyUrl },
  { name: "Ampolla d'olio", image: oilFlaskUrl },
  { name: "Manovella", image: winchHandleUrl },
  { name: "Corda", glyph: "⌁" },
  { name: "Moneta", glyph: "●" },
  { name: "Lettera", glyph: "✉" },
  { name: "Pietra", glyph: "◆" },
  { name: "Bussola", glyph: "✥" },
  { name: "Fiaschetta", glyph: "♙" },
  { name: "Amo", glyph: "⌝" },
  { name: "Nastro", glyph: "≈" },
];

const choices = [
  "Quanto mi dai per sistemarlo?",
  "Che cosa è successo all'argano?",
  "Dove hai visto la manovella?",
  "Ne riparliamo più tardi.",
] as const;

function readVariant(): VariantKey {
  const value = new URLSearchParams(window.location.search).get("variant")?.toUpperCase();
  return value === "B" || value === "C" ? value : "A";
}

function readState(): DemoState {
  const value = new URLSearchParams(window.location.search).get("state");
  return value === "command" ||
    value === "combine" ||
    value === "inventory" ||
    value === "speech" ||
    value === "choices" ||
    value === "reveal"
    ? value
    : "rest";
}

function readScene(): SceneKey {
  const value = new URLSearchParams(window.location.search).get("scene");
  return value === "aiano" || value === "boffe" ? value : "harbour";
}

function updateQuery(values: { variant?: VariantKey; state?: DemoState; scene?: SceneKey }): void {
  const url = new URL(window.location.href);
  if (values.variant) url.searchParams.set("variant", values.variant);
  if (values.state) url.searchParams.set("state", values.state);
  if (values.scene) url.searchParams.set("scene", values.scene);
  window.history.replaceState({}, "", url);
}

function commandText(demo: DemoState): string {
  if (demo === "combine") return "Usa ampolla d'olio con argano";
  if (demo === "command") return "Guarda argano";
  if (demo === "inventory") return "Guarda chiave d'ottone";
  return "Cammina verso la piazza";
}

function renderScene(state: PrototypeState): string {
  const scene = scenes[state.scene];
  const showWorldMarks = state.demo === "reveal" || state.tabHeld;
  const harbourActor = state.scene === "harbour" ? `<img class="prototype-actor" src="${raffaeleUrl}" alt="Raffaele" />` : "";

  return `<div class="scene-layer">
    <img class="scene-background" src="${scene.image}" style="object-position:${scene.crop}" alt="Scena: ${scene.label}" />
    ${harbourActor}
    <div class="speech ${state.demo === "speech" ? "is-visible" : ""}" role="status">L'argano non si aggiusterà guardandolo. Servono olio e una manovella.</div>
    <div class="world-mark mark-left ${showWorldMarks ? "is-visible" : ""}"><span>Passaggio</span></div>
    <div class="world-mark mark-right ${showWorldMarks ? "is-visible" : ""}"><span>Uscita</span></div>
    <div class="world-mark mark-object ${showWorldMarks ? "is-visible" : ""}"><span>Argano</span></div>
  </div>`;
}

function renderVerbGrid(demo: DemoState): string {
  const selected = demo === "combine" ? "use" : demo === "command" ? "look-at" : undefined;
  return `<div class="verb-grid" aria-label="Verbi">
    ${verbs.map(([label, id], index) => `<button type="button" class="verb ${selected === id ? "is-selected" : ""} ${demo === "rest" && id === "open" ? "is-preferred" : ""}" data-verb="${id}" title="${"QWEASDZXC"[index]}">${label}</button>`).join("")}
  </div>`;
}

function renderInventory(state: PrototypeState, className = ""): string {
  const pageSize = 8;
  const maxPage = Math.ceil(inventory.length / pageSize) - 1;
  const start = state.inventoryPage * pageSize;
  const visible = inventory.slice(start, start + pageSize);
  const slots = Array.from({ length: pageSize }, (_, index) => visible[index]);

  return `<div class="inventory ${className}" aria-label="Inventario">
    <button type="button" class="inventory-arrow" data-inventory="previous" ${state.inventoryPage === 0 ? "disabled" : ""} aria-label="Pagina precedente">‹</button>
    <div class="inventory-grid">
      ${slots.map((item) => {
        if (!item) return '<span class="inventory-slot is-empty" aria-hidden="true"></span>';
        const selected = state.demo === "combine" && item.name === "Ampolla d'olio";
        const visual = item.image ? `<img src="${item.image}" alt="" />` : `<span aria-hidden="true">${item.glyph}</span>`;
        return `<button type="button" class="inventory-slot ${selected ? "is-selected" : ""}" title="${item.name}" aria-label="${item.name}">${visual}</button>`;
      }).join("")}
    </div>
    <button type="button" class="inventory-arrow" data-inventory="next" ${state.inventoryPage === maxPage ? "disabled" : ""} aria-label="Pagina successiva">›</button>
  </div>`;
}

function renderChoices(className: string): string {
  return `<div class="dialogue-choices ${className}" aria-label="Scelte di dialogo">
    ${choices.map((choice, index) => `<button type="button"><span>${index + 1}</span>${choice}</button>`).join("")}
  </div>`;
}

function renderVariantA(state: PrototypeState): string {
  const dialogue = state.demo === "choices";
  return `<div class="game-frame variant-a" data-variant="A">
    ${renderScene(state)}
    <section class="dedicated-hud" aria-label="Pannello comandi dedicato">
      <div class="sentence-line">${commandText(state.demo)}</div>
      ${dialogue ? renderChoices("choices-a") : `<div class="persistent-controls">${renderVerbGrid(state.demo)}${renderInventory(state)}</div>`}
    </section>
  </div>`;
}

function renderVariantB(state: PrototypeState): string {
  const dialogue = state.demo === "choices";
  return `<div class="game-frame variant-b" data-variant="B">
    ${renderScene(state)}
    <div class="cursor-preview">${commandText(state.demo)}</div>
    <section class="overlay-hud" aria-label="Comandi trasparenti sopra la scena">
      ${dialogue ? renderChoices("choices-b") : `<div class="persistent-controls">${renderVerbGrid(state.demo)}${renderInventory(state)}</div>`}
    </section>
  </div>`;
}

function renderVerbCoin(state: PrototypeState): string {
  const visible = state.demo === "command" || state.demo === "combine";
  if (!visible) return "";
  return `<div class="verb-coin" aria-label="Azioni contestuali">
    <button type="button" title="Guarda">◉</button>
    <button type="button" title="Parla">◡</button>
    <button type="button" class="is-selected" title="Usa">✋</button>
    <button type="button" title="Raccogli">↥</button>
  </div><div class="context-preview">${commandText(state.demo)}</div>`;
}

function renderVariantC(state: PrototypeState): string {
  const showInventory = state.demo === "inventory" || state.demo === "combine";
  return `<div class="game-frame variant-c" data-variant="C">
    ${renderScene(state)}
    <div class="context-hotspot">Argano <span>•</span></div>
    ${renderVerbCoin(state)}
    ${showInventory ? `<section class="inventory-drawer">${renderInventory(state, "inventory-contextual")}</section>` : ""}
    ${state.demo === "choices" ? renderChoices("choices-c") : ""}
  </div>`;
}

function renderInspector(state: PrototypeState, variant: VariantDefinition): string {
  const exposedUi = variant.key === "C"
    ? state.demo === "inventory" || state.demo === "combine" || state.demo === "command" || state.demo === "choices"
    : true;
  const relevantState = {
    architecture: variant.key,
    scene: state.scene,
    demo: state.demo,
    sceneShare: variant.sceneShare,
    uiShare: variant.uiShare,
    persistentOcclusion: variant.occlusion,
    uiVisibleNow: exposedUi,
    inventoryPage: state.inventoryPage + 1,
  };

  return `<aside class="prototype-inspector">
    <p class="eyebrow">PROTOTIPO USA-E-GETTA</p>
    <h1>${variant.key} — ${variant.name}</h1>
    <p class="summary">${variant.summary}</p>
    <dl class="metrics">
      <div><dt>Scena</dt><dd>${variant.sceneShare}</dd></div>
      <div><dt>UI</dt><dd>${variant.uiShare}</dd></div>
      <div><dt>Copertura</dt><dd>${variant.occlusion}</dd></div>
    </dl>
    <fieldset><legend>Scena</legend><div class="control-row">
      ${(Object.entries(scenes) as [SceneKey, (typeof scenes)[SceneKey]][]).map(([key, scene]) => `<button type="button" data-scene="${key}" class="${state.scene === key ? "is-active" : ""}">${scene.label}</button>`).join("")}
    </div></fieldset>
    <fieldset><legend>Stato da confrontare</legend><div class="state-controls">
      ${([[
        "rest", "Riposo"
      ], ["command", "Comando"], ["combine", "Usa… con"], ["inventory", "Inventario"], ["speech", "Battuta"], ["choices", "Dialogo"], ["reveal", "Tab"]] as const).map(([key, label]) => `<button type="button" data-demo="${key}" class="${state.demo === key ? "is-active" : ""}">${label}</button>`).join("")}
    </div></fieldset>
    <p class="prototype-hint">Usa <kbd>←</kbd> e <kbd>→</kbd> per confrontare la stessa scena e lo stesso stato.</p>
    <pre>${JSON.stringify(relevantState, null, 2)}</pre>
  </aside>`;
}

function renderSwitcher(variant: VariantDefinition): string {
  return `<nav class="prototype-switcher" aria-label="Varianti del prototipo">
    <button type="button" data-cycle="previous" aria-label="Variante precedente">←</button>
    <strong>${variant.key} — ${variant.name}</strong>
    <button type="button" data-cycle="next" aria-label="Variante successiva">→</button>
  </nav>`;
}

export function startHudArchitecturePrototype(target: HTMLElement): void {
  if (import.meta.env.MODE !== "prototype") return;

  document.title = "PROTOTIPO — Architetture HUD Capri 1535";
  document.body.classList.add("prototype-mode");

  let currentVariant = readVariant();
  const state: PrototypeState = {
    demo: readState(),
    scene: readScene(),
    inventoryPage: 0,
    tabHeld: false,
  };

  const render = (): void => {
    const variant = variants.find(({ key }) => key === currentVariant) ?? variants[0]!;
    const renderVariant = currentVariant === "B" ? renderVariantB : currentVariant === "C" ? renderVariantC : renderVariantA;
    target.innerHTML = `<main class="prototype-layout"><section class="stage-wrap">${renderVariant(state)}</section>${renderInspector(state, variant)}</main>${renderSwitcher(variant)}`;
  };

  const cycle = (direction: -1 | 1): void => {
    const current = variants.findIndex(({ key }) => key === currentVariant);
    currentVariant = variants[(current + direction + variants.length) % variants.length]!.key;
    updateQuery({ variant: currentVariant });
    render();
  };

  target.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button");
    if (!button) return;
    if (button.dataset.cycle) {
      cycle(button.dataset.cycle === "previous" ? -1 : 1);
      return;
    }
    if (button.dataset.demo) {
      state.demo = button.dataset.demo as DemoState;
      updateQuery({ state: state.demo });
      render();
      return;
    }
    if (button.dataset.scene) {
      state.scene = button.dataset.scene as SceneKey;
      updateQuery({ scene: state.scene });
      render();
      return;
    }
    if (button.dataset.inventory) {
      state.inventoryPage = button.dataset.inventory === "next" ? 1 : 0;
      render();
      return;
    }
    if (button.dataset.verb) {
      state.demo = button.dataset.verb === "use" ? "combine" : "command";
      updateQuery({ state: state.demo });
      render();
    }
  });

  window.addEventListener("keydown", (event) => {
    const active = document.activeElement;
    const editing = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active?.getAttribute("contenteditable") === "true";
    if (editing) return;
    if (event.key === "ArrowLeft") cycle(-1);
    if (event.key === "ArrowRight") cycle(1);
    if (event.key === "Tab" && !state.tabHeld) {
      event.preventDefault();
      state.tabHeld = true;
      render();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.key !== "Tab" || !state.tabHeld) return;
    state.tabHeld = false;
    render();
  });

  render();
}
