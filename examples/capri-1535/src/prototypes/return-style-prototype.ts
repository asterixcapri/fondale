// PROTOTYPE — throw this UI away after it answers whether a Return to Monkey Island-style interaction feels right.
// One focused model on the existing Capri route: ?focus=return-style.

import harbourBackgroundUrl from "../scenes/harbour/background.png";
import raffaeleUrl from "../characters/raffaele/idle.png";
import keyUrl from "../objects/key/inventory.png";
import oilFlaskUrl from "../objects/oil-flask/inventory.png";
import winchHandleUrl from "../objects/winch-handle/inventory.png";
import "./hud-architecture-prototype.css";
import "./return-style-prototype.css";

type SceneKey = "harbour" | "aiano" | "boffe";
type HotspotKey =
  | "winch" | "raffaele" | "boat" | "passage"
  | "arch" | "vine" | "bench" | "garden-path"
  | "left-door" | "alley" | "millstone" | "right-door";
type ItemKey = "key" | "oil" | "handle";

interface HotspotDefinition {
  key: HotspotKey;
  label: string;
  main: string;
  secondary?: string;
  response: { main: string; secondary?: string };
  bounds: { x: number; y: number; width: number; height: number };
}

interface InventoryItem {
  key: ItemKey;
  label: string;
  image: string;
}

interface PrototypeState {
  scene: SceneKey;
  inventoryOpen: boolean;
  selectedItem?: ItemKey;
  hovered?: HotspotKey;
  lastAction?: string;
  hintVisible: boolean;
}

interface SceneDefinition {
  label: string;
  image: string;
  alt: string;
  actor?: string;
  hotspots: readonly HotspotDefinition[];
}

const prototypeArtUrl = (scene: "aiano" | "boffe"): string =>
  ["", "art", "scenes", scene, "background.png"].join("/");

const scenes: Readonly<Record<SceneKey, SceneDefinition>> = {
  harbour: {
    label: "Porto",
    image: harbourBackgroundUrl,
    alt: "Porto di Capri",
    actor: raffaeleUrl,
    hotspots: [{
    key: "winch",
    label: "Argano",
    main: "Guarda",
    secondary: "Usa",
    response: {
      main: "Il sale ha bloccato gli ingranaggi e manca la manovella.",
      secondary: "A mani nude non riuscirei a sbloccarlo.",
    },
    bounds: { x: 61, y: 55, width: 13, height: 23 },
  }, {
    key: "raffaele",
    label: "Raffaele",
    main: "Parla",
    secondary: "Guarda",
    response: {
      main: "Raffaele: Se sistemi l'argano, il gozzo è tuo.",
      secondary: "Raffaele controlla il porto come se gli appartenesse.",
    },
    bounds: { x: 74, y: 45, width: 9, height: 36 },
  }, {
    key: "boat",
    label: "Gozzo",
    main: "Guarda",
    secondary: "Usa",
    response: {
      main: "Il gozzo aspetta che l'argano torni a funzionare.",
      secondary: "Prima devo liberarlo dalla corda.",
    },
    bounds: { x: 45, y: 39, width: 17, height: 17 },
  }, {
    key: "passage",
    label: "Verso la piazza",
    main: "Vai",
    response: {
      main: "Michele si avvia verso la piazza.",
    },
    bounds: { x: 86, y: 27, width: 12, height: 36 },
  }],
  },
  aiano: {
    label: "Aiano",
    image: prototypeArtUrl("aiano"),
    alt: "Terrazza di Aiano",
    hotspots: [{
      key: "arch",
      label: "Arco",
      main: "Vai",
      response: {
        main: "Michele attraversa l'arco.",
      },
      bounds: { x: 3, y: 17, width: 17, height: 56 },
    }, {
      key: "vine",
      label: "Pergolato",
      main: "Guarda",
      secondary: "Usa",
      response: {
        main: "La vite ripara la terrazza dal sole.",
        secondary: "I tralci sono troppo alti per raggiungerli.",
      },
      bounds: { x: 24, y: 2, width: 48, height: 25 },
    }, {
      key: "bench",
      label: "Panca",
      main: "Siediti",
      secondary: "Guarda",
      response: {
        main: "Non è il momento di riposare.",
        secondary: "Una panca di pietra, fresca anche d'estate.",
      },
      bounds: { x: 73, y: 54, width: 22, height: 27 },
    }, {
      key: "garden-path",
      label: "Sentiero",
      main: "Vai",
      response: {
        main: "Michele scende lungo il sentiero.",
      },
      bounds: { x: 63, y: 58, width: 10, height: 31 },
    }],
  },
  boffe: {
    label: "Boffe",
    image: prototypeArtUrl("boffe"),
    alt: "Piazzetta delle Boffe",
    hotspots: [{
      key: "left-door",
      label: "Porta",
      main: "Apri",
      secondary: "Guarda",
      response: {
        main: "La porta è chiusa a chiave.",
        secondary: "Una vecchia porta consumata dal sole.",
      },
      bounds: { x: 12, y: 34, width: 9, height: 28 },
    }, {
      key: "alley",
      label: "Vicolo",
      main: "Vai",
      response: {
        main: "Michele si inoltra nel vicolo.",
      },
      bounds: { x: 25, y: 34, width: 14, height: 30 },
    }, {
      key: "millstone",
      label: "Macina",
      main: "Guarda",
      secondary: "Usa",
      response: {
        main: "Una macina troppo pesante per spostarla da solo.",
        secondary: "Non c'è nulla da macinare.",
      },
      bounds: { x: 65, y: 28, width: 14, height: 25 },
    }, {
      key: "right-door",
      label: "Portone",
      main: "Bussa",
      secondary: "Guarda",
      response: {
        main: "Nessuno risponde.",
        secondary: "Il portone sembra aperto di recente.",
      },
      bounds: { x: 91, y: 22, width: 8, height: 42 },
    }],
  },
};

const inventory: readonly InventoryItem[] = [
  { key: "key", label: "Chiave d'ottone", image: keyUrl },
  { key: "oil", label: "Ampolla d'olio", image: oilFlaskUrl },
  { key: "handle", label: "Manovella", image: winchHandleUrl },
];

function selectedItem(state: PrototypeState): InventoryItem | undefined {
  return inventory.find(({ key }) => key === state.selectedItem);
}

function hotspotFor(state: PrototypeState, hotspotKey: HotspotKey): HotspotDefinition {
  const hotspot = scenes[state.scene].hotspots.find(({ key }) => key === hotspotKey);
  if (!hotspot) throw new Error(`Unknown ${state.scene} hotspot: ${hotspotKey}`);
  return hotspot;
}

function actionsFor(state: PrototypeState, hotspotKey: HotspotKey): { main: string; secondary?: string } {
  const hotspot = hotspotFor(state, hotspotKey);
  const item = selectedItem(state);
  if (!item) return { main: hotspot.main, secondary: hotspot.secondary };
  if (hotspotKey === "raffaele") return { main: `Dai ${item.label}`, secondary: "Parla" };
  return { main: `Usa ${item.label}`, secondary: hotspot.main };
}

const commandTargets: Readonly<Record<HotspotKey, string>> = {
  winch: "l'argano",
  raffaele: "Raffaele",
  boat: "il gozzo",
  passage: "verso la piazza",
  arch: "l'arco",
  vine: "il pergolato",
  bench: "la panca",
  "garden-path": "il sentiero",
  "left-door": "la porta",
  alley: "il vicolo",
  millstone: "la macina",
  "right-door": "il portone",
};

function actionPhrase(state: PrototypeState, hotspotKey: HotspotKey, action: "main" | "secondary"): string | undefined {
  const item = selectedItem(state);
  if (item && action === "main") {
    return hotspotKey === "raffaele"
      ? `Dai ${item.label} a Raffaele`
      : `Usa ${item.label} con ${commandTargets[hotspotKey]}`;
  }

  const verb = actionsFor(state, hotspotKey)[action];
  if (!verb) return undefined;
  if (verb === "Parla") return `Parla con ${commandTargets[hotspotKey]}`;
  if (verb === "Siediti") return "Siediti sulla panca";
  if (verb === "Vai" && hotspotKey === "garden-path") return "Prendi il sentiero";
  return `${verb} ${commandTargets[hotspotKey]}`;
}

function responseFor(state: PrototypeState, hotspotKey: HotspotKey, action: "main" | "secondary"): string {
  const hotspot = hotspotFor(state, hotspotKey);
  const item = selectedItem(state);
  if (!item) return hotspot.response[action] ?? hotspot.response.main;
  if (action === "secondary") return hotspot.response.main;
  if (hotspotKey === "winch" && item.key === "oil") return "L'olio penetra negli ingranaggi dell'argano.";
  if (hotspotKey === "winch" && item.key === "handle") return "La manovella non entra finché gli ingranaggi sono bloccati.";
  if (hotspotKey === "raffaele") return `Raffaele non sembra interessato a ${item.label.toLowerCase()}.`;
  return `${item.label} non sembra utile con ${hotspot.label.toLowerCase()}.`;
}

function renderPrompt(state: PrototypeState, hotspotKey: HotspotKey): string {
  const secondary = actionPhrase(state, hotspotKey, "secondary");
  return `<span class="return-prompt ${secondary ? "has-secondary" : "is-single"}" aria-hidden="true">
    <span class="return-action is-main"><span class="return-input is-left"></span><span>${actionPhrase(state, hotspotKey, "main")}</span></span>
    ${secondary ? `<span class="return-action is-secondary"><span class="return-input is-right"></span><span>${secondary}</span></span>` : ""}
    <span class="return-leader"></span>
  </span>`;
}

function renderHotspots(state: PrototypeState): string {
  return scenes[state.scene].hotspots.map((hotspot) => {
    const key = hotspot.key;
    const { x, y, width, height } = hotspot.bounds;
    return `<button type="button" class="return-hotspot" data-hotspot="${key}" style="--x:${x}%;--y:${y}%;--width:${width}%;--height:${height}%" aria-label="${hotspot.label}">${renderPrompt(state, key)}</button>`;
  }).join("");
}

function renderInventory(state: PrototypeState): string {
  if (!state.inventoryOpen) return "";
  const slots = Array.from({ length: 8 }, (_, index) => inventory[index]);
  return `<div class="inventory-scrim" data-close-inventory></div>
    <aside class="return-inventory" aria-label="Inventario">
      <header><span>Inventario</span><button type="button" data-close-inventory aria-label="Chiudi inventario">×</button></header>
      <div class="return-inventory-grid">
        ${slots.map((item) => item
          ? `<button type="button" class="return-item ${state.selectedItem === item.key ? "is-selected" : ""}" data-item="${item.key}"><img src="${item.image}" alt="" /><span>${item.label}</span></button>`
          : '<span class="return-item is-empty" aria-hidden="true"></span>').join("")}
      </div>
      <p>Seleziona un Object, poi usalo con il click sinistro su un Noun.</p>
    </aside>`;
}

function renderInspector(state: PrototypeState): string {
  const hovered = state.hovered ? hotspotFor(state, state.hovered) : undefined;
  const actions = state.hovered ? actionsFor(state, state.hovered) : undefined;
  const snapshot = {
    model: "Return-style",
    scene: scenes[state.scene].label,
    inventoryOpen: state.inventoryOpen,
    selectedObject: selectedItem(state)?.label ?? null,
    hoveredNoun: hovered?.label ?? null,
    mainAction: actions?.main ?? null,
    secondaryAction: actions?.secondary ?? null,
    lastAction: state.lastAction ?? null,
  };
  return `<aside class="prototype-inspector return-inspector">
    <p class="eyebrow">PROTOTIPO USA-E-GETTA</p>
    <h1>Interazione Return-style</h1>
    <p class="summary">Passa sopra gli elementi della scena. Il prompt mostra una o due azioni contestuali.</p>
    <nav class="return-scene-switcher" aria-label="Scena del prototipo">
      ${(Object.entries(scenes) as [SceneKey, SceneDefinition][]).map(([key, scene]) => `<button type="button" data-scene="${key}" class="${state.scene === key ? "is-active" : ""}">${scene.label}</button>`).join("")}
    </nav>
    <dl class="return-controls">
      <div><dt>Click sinistro</dt><dd>Azione principale</dd></div>
      <div><dt>Click destro</dt><dd>Secondaria, se presente</dd></div>
      <div><dt>Sacchetto / I</dt><dd>Apri/chiudi Inventory</dd></div>
      <div><dt>Escape</dt><dd>Chiudi o deseleziona</dd></div>
    </dl>
    <div class="return-demo-buttons">
      <button type="button" data-open-inventory>Apri Inventory</button>
      <button type="button" data-clear-item ${state.selectedItem ? "" : "disabled"}>Deseleziona Object</button>
      <button type="button" data-reset-hint>Mostra suggerimento</button>
    </div>
    <pre data-state-readout>${JSON.stringify(snapshot, null, 2)}</pre>
  </aside>`;
}

function renderPrototype(target: HTMLElement, state: PrototypeState): void {
  const item = selectedItem(state);
  const scene = scenes[state.scene];
  target.innerHTML = `<main class="prototype-layout return-layout">
    <section class="stage-wrap">
      <div class="game-frame return-frame">
        <div class="scene-layer"><img class="scene-background" src="${scene.image}" alt="${scene.alt}" />${scene.actor ? `<img class="prototype-actor" src="${scene.actor}" alt="Raffaele" />` : ""}</div>
        ${renderHotspots(state)}
        ${item ? `<div class="selected-object-cursor"><img src="${item.image}" alt="" /><span>${item.label}</span></div>` : ""}
        <button type="button" class="return-inventory-trigger ${state.inventoryOpen ? "is-open" : ""}" data-toggle-inventory aria-label="${state.inventoryOpen ? "Chiudi" : "Apri"} inventario">
          <span class="return-bag" aria-hidden="true"></span><kbd>I</kbd><span class="return-inventory-label">Inventory</span>
        </button>
        <div class="return-feedback" role="status"></div>
        ${state.hintVisible ? '<div class="inventory-hint"><kbd>I</kbd><span>Clicca il sacchetto o premi I</span><button type="button" data-dismiss-hint aria-label="Chiudi suggerimento">×</button></div>' : ""}
        ${renderInventory(state)}
      </div>
    </section>
    ${renderInspector(state)}
  </main><div class="prototype-model-label">PROTOTIPO — modello Return to Monkey Island</div>`;
}

export function startReturnStylePrototype(target: HTMLElement): void {
  if (import.meta.env.MODE !== "prototype") return;
  document.title = "PROTOTIPO — Interazione Return-style";
  document.body.classList.add("prototype-mode", "return-style-mode");
  const requestedScene = new URLSearchParams(window.location.search).get("scene");
  const state: PrototypeState = {
    scene: requestedScene === "aiano" || requestedScene === "boffe" ? requestedScene : "harbour",
    inventoryOpen: false,
    hintVisible: true,
  };
  let feedbackTimer: number | undefined;

  const updateReadout = (): void => {
    const readout = target.querySelector<HTMLElement>("[data-state-readout]");
    if (!readout) return;
    const hovered = state.hovered ? hotspotFor(state, state.hovered) : undefined;
    const actions = state.hovered ? actionsFor(state, state.hovered) : undefined;
    readout.textContent = JSON.stringify({
      model: "Return-style",
      scene: scenes[state.scene].label,
      inventoryOpen: state.inventoryOpen,
      selectedObject: selectedItem(state)?.label ?? null,
      hoveredNoun: hovered?.label ?? null,
      mainAction: actions?.main ?? null,
      secondaryAction: actions?.secondary ?? null,
      lastAction: state.lastAction ?? null,
    }, null, 2);
  };

  const showFeedback = (text: string): void => {
    state.lastAction = text;
    const feedback = target.querySelector<HTMLElement>(".return-feedback");
    if (feedback) {
      feedback.textContent = text;
      feedback.classList.add("is-visible");
      if (feedbackTimer !== undefined) window.clearTimeout(feedbackTimer);
      feedbackTimer = window.setTimeout(() => feedback.classList.remove("is-visible"), 2600);
    }
    updateReadout();
  };

  const rerender = (): void => renderPrototype(target, state);

  target.addEventListener("mouseover", (event) => {
    const hotspot = (event.target as Element).closest<HTMLElement>("[data-hotspot]");
    if (!hotspot) return;
    state.hovered = hotspot.dataset.hotspot as HotspotKey;
    updateReadout();
  });

  target.addEventListener("mouseout", (event) => {
    const hotspot = (event.target as Element).closest<HTMLElement>("[data-hotspot]");
    if (!hotspot || hotspot.contains(event.relatedTarget as Node | null)) return;
    state.hovered = undefined;
    updateReadout();
  });

  target.addEventListener("mousemove", (event) => {
    const frame = target.querySelector<HTMLElement>(".return-frame");
    if (!frame) return;
    const bounds = frame.getBoundingClientRect();
    frame.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    frame.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  });

  target.addEventListener("click", (event) => {
    const element = event.target as Element;
    if (element.closest("[data-toggle-inventory]")) {
      state.inventoryOpen = !state.inventoryOpen;
      state.hintVisible = false;
      rerender();
      return;
    }
    const sceneButton = element.closest<HTMLButtonElement>("[data-scene]");
    if (sceneButton) {
      state.scene = sceneButton.dataset.scene as SceneKey;
      state.hovered = undefined;
      state.inventoryOpen = false;
      const url = new URL(window.location.href);
      url.searchParams.set("scene", state.scene);
      window.history.replaceState({}, "", url);
      rerender();
      return;
    }
    const hotspot = element.closest<HTMLElement>("[data-hotspot]");
    if (hotspot) {
      const key = hotspot.dataset.hotspot as HotspotKey;
      showFeedback(responseFor(state, key, "main"));
      return;
    }
    const item = element.closest<HTMLButtonElement>("[data-item]");
    if (item) {
      state.selectedItem = item.dataset.item as ItemKey;
      state.inventoryOpen = false;
      rerender();
      return;
    }
    if (element.closest("[data-open-inventory]")) {
      state.inventoryOpen = true;
      state.hintVisible = false;
      rerender();
      return;
    }
    if (element.closest("[data-close-inventory]")) {
      state.inventoryOpen = false;
      rerender();
      return;
    }
    if (element.closest("[data-clear-item]")) {
      state.selectedItem = undefined;
      rerender();
      return;
    }
    if (element.closest("[data-dismiss-hint]")) {
      state.hintVisible = false;
      rerender();
      return;
    }
    if (element.closest("[data-reset-hint]")) {
      state.hintVisible = true;
      rerender();
    }
  });

  target.addEventListener("contextmenu", (event) => {
    const hotspot = (event.target as Element).closest<HTMLElement>("[data-hotspot]");
    if (!hotspot) return;
    event.preventDefault();
    const key = hotspot.dataset.hotspot as HotspotKey;
    if (!actionsFor(state, key).secondary) return;
    showFeedback(responseFor(state, key, "secondary"));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "i") {
      state.inventoryOpen = !state.inventoryOpen;
      state.hintVisible = false;
      rerender();
      return;
    }
    if (event.key === "Escape") {
      if (state.inventoryOpen) state.inventoryOpen = false;
      else state.selectedItem = undefined;
      rerender();
    }
  });

  rerender();
}
