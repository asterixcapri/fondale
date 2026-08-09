// PROTOTYPE — throw this UI away after it answers which actions belong in the contextual verb coin.
// Three content policies on the selected full-scene architecture, switchable via ?focus=verb-coin&variant=A|B|C.

import harbourBackgroundUrl from "../scenes/harbour/background.png";
import raffaeleUrl from "../characters/raffaele/idle.png";
import "./hud-architecture-prototype.css";
import "./verb-coin-prototype.css";

type VariantKey = "A" | "B" | "C";
type NounKey = "winch" | "raffaele" | "gate" | "key";
type InventoryKey = "none" | "oil" | "key";
type VerbKey = "open" | "pick-up" | "push" | "close" | "look-at" | "pull" | "give" | "talk-to" | "use";

interface VariantDefinition {
  key: VariantKey;
  name: string;
  summary: string;
  tradeoff: string;
}

interface NounScenario {
  label: string;
  preferred: VerbKey;
  authored: readonly VerbKey[];
  x: number;
  y: number;
}

interface PrototypeState {
  noun: NounKey;
  inventory: InventoryKey;
  expanded: boolean;
}

const variants: readonly VariantDefinition[] = [
  {
    key: "A",
    name: "Solo pertinenti",
    summary: "Mostra soltanto Preferred Verb e Command Case specifici per il Noun corrente.",
    tradeoff: "Pulitissimo, ma nasconde tutti i fallback e riduce la sperimentazione.",
  },
  {
    key: "B",
    name: "Progressivo",
    summary: "Primo livello pertinente; “Tutte” espande le nove azioni classiche quando il Player vuole sperimentare.",
    tradeoff: "Mantiene il frame leggero senza perdere i fallback, al costo di un secondo livello volontario.",
  },
  {
    key: "C",
    name: "Nove sempre",
    summary: "Il coin presenta ogni Verb in posizione stabile, anche quando produrrà soltanto un fallback.",
    tradeoff: "Massima grammatica visibile, ma il menu torna grande e affollato.",
  },
];

const nouns: Readonly<Record<NounKey, NounScenario>> = {
  winch: { label: "Argano", preferred: "look-at", authored: ["look-at", "use"], x: 72, y: 58 },
  raffaele: { label: "Raffaele", preferred: "talk-to", authored: ["talk-to"], x: 79, y: 63 },
  gate: { label: "Cancello", preferred: "open", authored: ["open", "use"], x: 66, y: 52 },
  key: { label: "Chiave d'ottone", preferred: "pick-up", authored: ["pick-up"], x: 48, y: 67 },
};

const verbs: Readonly<Record<VerbKey, { label: string; glyph: string }>> = {
  open: { label: "Apri", glyph: "↗" },
  "pick-up": { label: "Raccogli", glyph: "↑" },
  push: { label: "Spingi", glyph: "→|" },
  close: { label: "Chiudi", glyph: "↙" },
  "look-at": { label: "Guarda", glyph: "◉" },
  pull: { label: "Tira", glyph: "|←" },
  give: { label: "Dai", glyph: "⇢" },
  "talk-to": { label: "Parla", glyph: "“”" },
  use: { label: "Usa", glyph: "✋" },
};

const verbOrder = ["open", "pick-up", "push", "close", "look-at", "pull", "give", "talk-to", "use"] as const;

function readVariant(): VariantKey {
  const value = new URLSearchParams(window.location.search).get("variant")?.toUpperCase();
  return value === "B" || value === "C" ? value : "A";
}

function readNoun(): NounKey {
  const value = new URLSearchParams(window.location.search).get("noun");
  return value === "raffaele" || value === "gate" || value === "key" ? value : "winch";
}

function readInventory(): InventoryKey {
  const value = new URLSearchParams(window.location.search).get("inventory");
  return value === "oil" || value === "key" ? value : "none";
}

function updateQuery(values: { variant?: VariantKey; noun?: NounKey; inventory?: InventoryKey }): void {
  const url = new URL(window.location.href);
  url.searchParams.set("focus", "verb-coin");
  if (values.variant) url.searchParams.set("variant", values.variant);
  if (values.noun) url.searchParams.set("noun", values.noun);
  if (values.inventory) url.searchParams.set("inventory", values.inventory);
  window.history.replaceState({}, "", url);
}

function preferredVerb(state: PrototypeState): VerbKey {
  if (state.inventory === "oil" && state.noun === "winch") return "use";
  if (state.inventory === "key" && state.noun === "gate") return "use";
  if (state.inventory !== "none" && state.noun === "raffaele") return "give";
  return nouns[state.noun].preferred;
}

function relevantVerbs(state: PrototypeState): readonly VerbKey[] {
  const preferred = preferredVerb(state);
  const relevant = [preferred, ...nouns[state.noun].authored];
  return [...new Set(relevant)];
}

function renderScene(state: PrototypeState): string {
  const noun = nouns[state.noun];
  return `<div class="scene-layer">
    <img class="scene-background" src="${harbourBackgroundUrl}" alt="Porto di Capri" />
    <img class="prototype-actor" src="${raffaeleUrl}" alt="Raffaele" />
    <div class="coin-target" style="--target-x:${noun.x}%;--target-y:${noun.y}%">
      <span>${noun.label}</span><i aria-hidden="true"></i>
    </div>
  </div>`;
}

function renderVerbButton(verb: VerbKey, preferred: VerbKey, angle: number, fallbackOnly: boolean): string {
  const definition = verbs[verb];
  return `<button type="button" class="coin-action ${verb === preferred ? "is-preferred" : ""} ${fallbackOnly ? "is-fallback" : ""}" style="--angle:${angle}deg" title="${definition.label}${fallbackOnly ? " — risposta generica" : ""}">
    <span class="coin-glyph" aria-hidden="true">${definition.glyph}</span><span class="coin-label">${definition.label}</span>
  </button>`;
}

function radialAngles(length: number): number[] {
  if (length === 1) return [-90];
  if (length === 2) return [-145, -35];
  if (length === 3) return [-170, -90, -10];
  return Array.from({ length }, (_, index) => -180 + (360 / length) * index);
}

function renderRelevantCoin(state: PrototypeState, includeMore: boolean): string {
  const preferred = preferredVerb(state);
  const relevant = relevantVerbs(state);
  const angles = radialAngles(relevant.length + (includeMore ? 1 : 0));
  return `<div class="verb-coin-prototype coin-relevant">
    <div class="coin-core"><span>pressione lunga</span><strong>${nouns[state.noun].label}</strong></div>
    ${relevant.map((verb, index) => renderVerbButton(verb, preferred, angles[index]!, false)).join("")}
    ${includeMore ? `<button type="button" class="coin-action coin-more" style="--angle:${angles.at(-1)}deg" data-expand><span class="coin-glyph">•••</span><span class="coin-label">Tutte</span></button>` : ""}
  </div>`;
}

function renderFullCoin(state: PrototypeState, progressive: boolean): string {
  const preferred = preferredVerb(state);
  const authored = new Set(relevantVerbs(state));
  const ordered = progressive ? [preferred, ...verbOrder.filter((verb) => verb !== preferred)] : verbOrder;
  const angles = radialAngles(ordered.length);
  return `<div class="verb-coin-prototype coin-full ${progressive ? "is-progressive" : "is-stable"}">
    <button type="button" class="coin-core coin-close" ${progressive ? "data-collapse" : ""}><span>${progressive ? "Tutte le azioni" : "Nove azioni"}</span><strong>${nouns[state.noun].label}</strong></button>
    ${ordered.map((verb, index) => renderVerbButton(verb, preferred, angles[index]!, !authored.has(verb))).join("")}
  </div>`;
}

function renderCoin(state: PrototypeState, variant: VariantKey): string {
  if (variant === "A") return renderRelevantCoin(state, false);
  if (variant === "B" && !state.expanded) return renderRelevantCoin(state, true);
  return renderFullCoin(state, variant === "B");
}

function visibleVerbNames(state: PrototypeState, variant: VariantKey): readonly string[] {
  if (variant === "C" || (variant === "B" && state.expanded)) return verbOrder.map((verb) => verbs[verb].label);
  return relevantVerbs(state).map((verb) => verbs[verb].label);
}

function renderInspector(state: PrototypeState, variant: VariantDefinition): string {
  const preferred = preferredVerb(state);
  const relevant = relevantVerbs(state);
  const fallbackOnly = verbOrder.filter((verb) => !relevant.includes(verb));
  const snapshot = {
    policy: variant.key,
    hoveredNoun: nouns[state.noun].label,
    selectedInventory: state.inventory,
    preferredVerb: verbs[preferred].label,
    authoredOrContextual: relevant.map((verb) => verbs[verb].label),
    visibleNow: visibleVerbNames(state, variant.key),
    fallbackOnly: fallbackOnly.map((verb) => verbs[verb].label),
    expanded: variant.key === "B" ? state.expanded : undefined,
  };

  return `<aside class="prototype-inspector coin-inspector">
    <p class="eyebrow">PROTOTIPO USA-E-GETTA</p>
    <h1>${variant.key} — ${variant.name}</h1>
    <p class="summary">${variant.summary}</p>
    <p class="coin-tradeoff">${variant.tradeoff}</p>
    <fieldset><legend>Noun sotto il cursore</legend><div class="control-row noun-controls">
      ${(Object.entries(nouns) as [NounKey, NounScenario][]).map(([key, noun]) => `<button type="button" data-noun="${key}" class="${state.noun === key ? "is-active" : ""}">${noun.label}</button>`).join("")}
    </div></fieldset>
    <fieldset><legend>Object selezionato</legend><div class="control-row inventory-controls">
      ${([[
        "none", "Nessuno"
      ], ["oil", "Olio"], ["key", "Chiave"]] as const).map(([key, label]) => `<button type="button" data-held="${key}" class="${state.inventory === key ? "is-active" : ""}">${label}</button>`).join("")}
    </div></fieldset>
    <p class="prototype-hint">Le azioni attenuate producono soltanto un fallback. Usa <kbd>←</kbd> e <kbd>→</kbd> per cambiare politica.</p>
    <pre>${JSON.stringify(snapshot, null, 2)}</pre>
  </aside>`;
}

function renderSwitcher(variant: VariantDefinition): string {
  return `<nav class="prototype-switcher" aria-label="Varianti del verb coin">
    <button type="button" data-cycle="previous" aria-label="Variante precedente">←</button>
    <strong>${variant.key} — ${variant.name}</strong>
    <button type="button" data-cycle="next" aria-label="Variante successiva">→</button>
  </nav>`;
}

export function startVerbCoinPrototype(target: HTMLElement): void {
  if (import.meta.env.MODE !== "prototype") return;

  document.title = "PROTOTIPO — Contenuto del verb coin";
  document.body.classList.add("prototype-mode", "verb-coin-mode");
  let currentVariant = readVariant();
  const state: PrototypeState = { noun: readNoun(), inventory: readInventory(), expanded: false };

  const render = (): void => {
    const variant = variants.find(({ key }) => key === currentVariant) ?? variants[0]!;
    const noun = nouns[state.noun];
    target.innerHTML = `<main class="prototype-layout"><section class="stage-wrap"><div class="game-frame verb-coin-frame variant-${currentVariant.toLowerCase()}" style="--coin-x:${noun.x}%;--coin-y:${noun.y}%">${renderScene(state)}${renderCoin(state, currentVariant)}<div class="hold-progress">Click sinistro: ${verbs[preferredVerb(state)].label} · pressione lunga: apri coin</div></div></section>${renderInspector(state, variant)}</main>${renderSwitcher(variant)}`;
  };

  const cycle = (direction: -1 | 1): void => {
    const current = variants.findIndex(({ key }) => key === currentVariant);
    currentVariant = variants[(current + direction + variants.length) % variants.length]!.key;
    state.expanded = false;
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
    if (button.dataset.noun) {
      state.noun = button.dataset.noun as NounKey;
      state.expanded = false;
      updateQuery({ noun: state.noun });
      render();
      return;
    }
    if (button.dataset.held) {
      state.inventory = button.dataset.held as InventoryKey;
      state.expanded = false;
      updateQuery({ inventory: state.inventory });
      render();
      return;
    }
    if (button.hasAttribute("data-expand")) {
      state.expanded = true;
      render();
      return;
    }
    if (button.hasAttribute("data-collapse")) {
      state.expanded = false;
      render();
    }
  });

  window.addEventListener("keydown", (event) => {
    const active = document.activeElement;
    const editing = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active?.getAttribute("contenteditable") === "true";
    if (editing) return;
    if (event.key === "ArrowLeft") cycle(-1);
    if (event.key === "ArrowRight") cycle(1);
    if (event.key === "Escape" && state.expanded) {
      state.expanded = false;
      render();
    }
  });

  render();
}
