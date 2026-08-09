// PROTOTYPE — throw this UI away after it answers which command-HUD structure to build.
// Three variants of the Capri command HUD, switchable via ?variant=, on the existing route.

import harbourBackgroundUrl from "../scenes/harbour/background.png";
import raffaeleUrl from "../characters/raffaele/idle.png";
import keyUrl from "../objects/key/inventory.png";
import oilFlaskUrl from "../objects/oil-flask/inventory.png";
import winchHandleUrl from "../objects/winch-handle/inventory.png";
import "./command-hud-prototype.css";

type VariantKey = "A" | "B" | "C";
type DemoState = "walk" | "unary" | "binary" | "speech" | "choices" | "reveal";

interface VariantDefinition {
  key: VariantKey;
  name: string;
  note: string;
}

interface PrototypeState {
  demo: DemoState;
  inventoryPage: number;
  tabHeld: boolean;
}

interface InventoryItem {
  name: string;
  image?: string;
  glyph?: string;
}

const variants: VariantDefinition[] = [
  {
    key: "A",
    name: "Moderno trasparente",
    note: "La struttura bilanciata scelta, con testo pixel colorato e inventario sospeso sulla scena.",
  },
  {
    key: "B",
    name: "Isole nella scena",
    note: "Due pannelli separati lasciano respirare il centro e rendono l'overlay più leggero.",
  },
  {
    key: "C",
    name: "Riga classica",
    note: "La frase composta domina la fascia; inventario a sinistra e verbi a destra.",
  },
];

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

const inventory: InventoryItem[] = [
  { name: "Chiave d'ottone", image: keyUrl },
  { name: "Ampolla d'olio", image: oilFlaskUrl },
  { name: "Manovella", image: winchHandleUrl },
  { name: "Corda", glyph: "⌁" },
  { name: "Moneta", glyph: "●" },
  { name: "Lettera sigillata", glyph: "✉" },
  { name: "Pietra pomice", glyph: "◆" },
  { name: "Bussola", glyph: "✥" },
  { name: "Fiaschetta vuota", glyph: "♙" },
  { name: "Amo da pesca", glyph: "⌝" },
  { name: "Nastro rosso", glyph: "≈" },
];

const choices = [
  "Quanto mi dai per sistemarlo?",
  "Dipende: il mare paga meglio di te?",
  "Che cosa è successo all'argano?",
  "Dove hai visto la manovella?",
  "La grotta è davvero navigabile?",
  "Ne riparliamo più tardi.",
];

function queryVariant(): VariantKey {
  const value = new URLSearchParams(window.location.search).get("variant")?.toUpperCase();
  return value === "B" || value === "C" ? value : "A";
}

function queryDemo(): DemoState {
  const value = new URLSearchParams(window.location.search).get("state");
  return value === "unary" ||
    value === "binary" ||
    value === "speech" ||
    value === "choices" ||
    value === "reveal"
    ? value
    : "walk";
}

function updateQuery(values: { variant?: VariantKey; state?: DemoState }): void {
  const url = new URL(window.location.href);
  if (values.variant) url.searchParams.set("variant", values.variant);
  if (values.state) url.searchParams.set("state", values.state);
  window.history.replaceState({}, "", url);
}

function commandFor(demo: DemoState): string {
  if (demo === "unary") return "Guarda argano";
  if (demo === "binary") return "Usa ampolla d'olio con argano";
  return "Cammina verso la piazza";
}

function selectedVerbFor(demo: DemoState): string | undefined {
  if (demo === "unary") return "look-at";
  if (demo === "binary") return "use";
  return undefined;
}

function renderVerbGrid(demo: DemoState): string {
  const selectedVerb = selectedVerbFor(demo);
  return `<div class="verb-grid" aria-label="Verbi">
    ${verbs
      .map(
        ([label, id], index) => `<button
          type="button"
          class="verb ${selectedVerb === id ? "is-selected" : ""} ${demo === "walk" && id === "open" ? "is-preferred" : ""}"
          data-verb="${id}"
          title="Scorciatoia ${"QWEASDZXC"[index]}"
        >${label}</button>`,
      )
      .join("")}
  </div>`;
}

function renderInventory(state: PrototypeState): string {
  const pageSize = 8;
  const maxPage = Math.ceil(inventory.length / pageSize) - 1;
  const start = state.inventoryPage * pageSize;
  const visible = inventory.slice(start, start + pageSize);
  const slots = Array.from({ length: pageSize }, (_, index) => visible[index]);

  return `<div class="inventory" aria-label="Inventario">
    <button type="button" class="inventory-arrow" data-inventory="previous" ${state.inventoryPage === 0 ? "disabled" : ""} aria-label="Pagina precedente">◀</button>
    <div class="inventory-grid">
      ${slots
        .map((item) => {
          if (!item) return '<span class="inventory-slot is-empty" aria-hidden="true"></span>';
          const selected = state.demo === "binary" && item.name === "Ampolla d'olio";
          const visual = item.image
            ? `<img src="${item.image}" alt="" />`
            : `<span class="inventory-glyph" aria-hidden="true">${item.glyph}</span>`;
          return `<button type="button" class="inventory-slot ${selected ? "is-selected" : ""}" data-item="${item.name}" title="${item.name}" aria-label="${item.name}">${visual}</button>`;
        })
        .join("")}
    </div>
    <button type="button" class="inventory-arrow" data-inventory="next" ${state.inventoryPage === maxPage ? "disabled" : ""} aria-label="Pagina successiva">▶</button>
  </div>`;
}

function renderChoices(variant: VariantKey): string {
  return `<div class="dialogue-choices choices-${variant.toLowerCase()}" aria-label="Scelte di dialogo">
    ${choices
      .map(
        (choice, index) => `<button type="button" data-choice="${index + 1}"><span>${index + 1}</span>${choice}</button>`,
      )
      .join("")}
  </div>`;
}

function renderSceneChrome(state: PrototypeState): string {
  const reveal = state.demo === "reveal" || state.tabHeld;
  const speech = state.demo === "speech";
  return `
    <img class="scene-background" src="${harbourBackgroundUrl}" alt="Il porto di Capri" />
    <img class="raffaele" src="${raffaeleUrl}" alt="Raffaele" />
    <div class="speech ${speech ? "is-visible" : ""}" role="status">L'argano non si aggiusterà guardandolo. Servono olio e una manovella.</div>
    <div class="passage passage-grotto ${reveal ? "is-revealed" : ""}"><span>Verso la grotta</span></div>
    <div class="passage passage-square ${reveal ? "is-revealed" : ""}"><span>Verso la piazza</span></div>
    <div class="hotspot hotspot-winch ${reveal ? "is-revealed" : ""}"><span>Argano</span></div>
    <div class="pointer" aria-hidden="true"><span>➜</span></div>
  `;
}

function renderPreview(state: PrototypeState, fixed = false): string {
  return `<div class="command-preview ${fixed ? "is-fixed" : ""}">${commandFor(state.demo)}</div>`;
}

export function renderVariantA(state: PrototypeState): string {
  const dialogue = state.demo === "choices";
  return `<div class="game-frame variant-a" data-variant="A">
    ${renderSceneChrome(state)}
    ${dialogue ? "" : renderPreview(state)}
    <section class="hud hud-a">
      ${dialogue ? renderChoices("A") : `${renderVerbGrid(state.demo)}${renderInventory(state)}`}
    </section>
  </div>`;
}

export function renderVariantB(state: PrototypeState): string {
  const dialogue = state.demo === "choices";
  return `<div class="game-frame variant-b" data-variant="B">
    ${renderSceneChrome(state)}
    ${dialogue ? renderChoices("B") : `${renderPreview(state)}<section class="hud-island verbs-island">${renderVerbGrid(state.demo)}</section><section class="hud-island inventory-island">${renderInventory(state)}</section>`}
  </div>`;
}

export function renderVariantC(state: PrototypeState): string {
  const dialogue = state.demo === "choices";
  return `<div class="game-frame variant-c" data-variant="C">
    ${renderSceneChrome(state)}
    <section class="hud hud-c">
      ${renderPreview(state, true)}
      ${dialogue ? renderChoices("C") : `<div class="hud-c-body">${renderInventory(state)}${renderVerbGrid(state.demo)}</div>`}
    </section>
  </div>`;
}

function renderStateInspector(state: PrototypeState, variant: VariantDefinition): string {
  const relevantState = {
    variant: `${variant.key} — ${variant.name}`,
    activity: state.demo,
    command: {
      verb: selectedVerbFor(state.demo) ?? "walk-to",
      firstNoun: state.demo === "binary" ? "oilFlask" : null,
      hoverNoun: state.demo === "walk" || state.demo === "reveal" ? "toTownSquare" : "winch",
    },
    inventoryPage: state.inventoryPage + 1,
    line: state.demo === "speech" ? "raffaele" : null,
    choices: state.demo === "choices" ? 6 : 0,
    hotspotReveal: state.demo === "reveal" || state.tabHeld,
  };

  return `<aside class="prototype-inspector">
    <p class="eyebrow">PROTOTIPO USA-E-GETTA</p>
    <h1>${variant.key} — ${variant.name}</h1>
    <p>${variant.note}</p>
    <div class="state-controls" role="group" aria-label="Stato da mostrare">
      ${([
        ["walk", "Passaggio"],
        ["unary", "Verbo"],
        ["binary", "Usa… con"],
        ["speech", "Battuta"],
        ["choices", "Dialogo"],
        ["reveal", "Tab"],
      ] as const)
        .map(
          ([id, label]) => `<button type="button" data-demo="${id}" class="${state.demo === id ? "is-active" : ""}">${label}</button>`,
        )
        .join("")}
    </div>
    <p class="prototype-hint">Tieni premuto <kbd>Tab</kbd> per rivelare i Noun. Usa <kbd>←</kbd> e <kbd>→</kbd> per cambiare variante.</p>
    <pre aria-label="Stato corrente">${JSON.stringify(relevantState, null, 2)}</pre>
  </aside>`;
}

function renderSwitcher(variant: VariantDefinition): string {
  return `<nav class="prototype-switcher" aria-label="Varianti del prototipo">
    <button type="button" data-cycle="previous" aria-label="Variante precedente">←</button>
    <strong>${variant.key} — ${variant.name}</strong>
    <button type="button" data-cycle="next" aria-label="Variante successiva">→</button>
  </nav>`;
}

export function startCommandHudPrototype(target: HTMLElement): void {
  if (import.meta.env.MODE !== "prototype") return;

  document.title = "PROTOTIPO — HUD Capri 1535";
  document.body.classList.add("prototype-mode");

  let currentVariant = queryVariant();
  const state: PrototypeState = { demo: queryDemo(), inventoryPage: 0, tabHeld: false };

  const render = (): void => {
    const variant = variants.find(({ key }) => key === currentVariant) ?? variants[0]!;
    const renderVariant =
      currentVariant === "B" ? renderVariantB : currentVariant === "C" ? renderVariantC : renderVariantA;
    target.innerHTML = `<main class="prototype-layout">
      <section class="stage-wrap" aria-label="Anteprima del porto">${renderVariant(state)}</section>
      ${renderStateInspector(state, variant)}
    </main>
    ${renderSwitcher(variant)}`;
  };

  const cycle = (direction: -1 | 1): void => {
    const currentIndex = variants.findIndex(({ key }) => key === currentVariant);
    const nextIndex = (currentIndex + direction + variants.length) % variants.length;
    currentVariant = variants[nextIndex]!.key;
    updateQuery({ variant: currentVariant });
    render();
  };

  target.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button");
    if (!button) return;

    const demo = button.dataset.demo as DemoState | undefined;
    if (demo) {
      state.demo = demo;
      updateQuery({ state: demo });
      render();
      return;
    }

    if (button.dataset.cycle) {
      cycle(button.dataset.cycle === "previous" ? -1 : 1);
      return;
    }

    if (button.dataset.inventory) {
      state.inventoryPage = button.dataset.inventory === "next" ? 1 : 0;
      render();
      return;
    }

    if (button.dataset.verb) {
      state.demo = button.dataset.verb === "use" ? "binary" : "unary";
      updateQuery({ state: state.demo });
      render();
    }
  });

  window.addEventListener("keydown", (event) => {
    const active = document.activeElement;
    const editsText =
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active?.getAttribute("contenteditable") === "true";
    if (editsText) return;

    if (event.key === "ArrowLeft") cycle(-1);
    if (event.key === "ArrowRight") cycle(1);
    if (event.key === "Tab" && !state.tabHeld) {
      event.preventDefault();
      state.tabHeld = true;
      render();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "Tab" && state.tabHeld) {
      state.tabHeld = false;
      render();
    }
  });

  render();
}
