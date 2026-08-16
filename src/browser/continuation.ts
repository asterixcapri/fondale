import type {
  BrowserStartProjectView,
  CompiledGameProject,
} from "../capabilities/game-project";
import type { SaveSnapshot, ValidatedSaveSnapshot } from "../capabilities/save";
import { createSave } from "../capabilities/save";
import { BrowserFrameSurface } from "./frame";

export interface BrowserContinuationState {
  readonly formatVersion: 1;
  readonly providerSessionId: string;
  readonly snapshot: SaveSnapshot;
}

export interface ValidatedBrowserContinuationState extends BrowserContinuationState {
  readonly snapshot: ValidatedSaveSnapshot;
}

export type BrowserContinuationRead =
  | { readonly status: "absent" }
  | { readonly status: "invalid" }
  | { readonly status: "valid"; readonly state: ValidatedBrowserContinuationState };

/** Browser-owned persistence adjacent to, but deliberately outside, Game State. */
export class BrowserContinuation {
  private readonly key: string;

  constructor(
    private readonly project: CompiledGameProject,
    projectIdentity: string,
  ) {
    this.key = `fondale.continuation.${encodeURIComponent(projectIdentity)}`;
  }

  read(): BrowserContinuationRead {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw === null) return { status: "absent" };
      const value: unknown = JSON.parse(raw);
      if (!isContinuationState(value)) return { status: "invalid" };
      const validation = createSave(this.project).validate(value.snapshot);
      if (!validation.ok) return { status: "invalid" };
      return {
        status: "valid",
        state: Object.freeze({
          formatVersion: 1,
          providerSessionId: value.providerSessionId,
          snapshot: validation.snapshot,
        }),
      };
    } catch {
      return { status: "invalid" };
    }
  }

  write(providerSessionId: string, snapshot: SaveSnapshot): boolean {
    try {
      localStorage.setItem(this.key, JSON.stringify({
        formatVersion: 1,
        providerSessionId,
        snapshot,
      } satisfies BrowserContinuationState));
      return true;
    } catch {
      // Browser persistence is best-effort and must never fail a Game Session.
      return false;
    }
  }
}

/** Presents the only startup choice needed when compatible progress exists. */
export function chooseContinuation(
  target: HTMLElement,
  settings: BrowserStartProjectView,
  canContinue: boolean,
): Promise<"continue" | "new-game"> {
  const surface = new BrowserFrameSurface(target, settings);
  const panel = document.createElement("section");
  panel.dataset.fondaleContinuation = "";
  panel.setAttribute("aria-label", "Game startup");
  Object.assign(panel.style, {
    alignItems: "center",
    background: "#15101d",
    color: "white",
    display: "flex",
    flexDirection: "column",
    font: "16px monospace",
    gap: "16px",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  });
  const title = document.createElement("h1");
  title.textContent = "Fondale";
  const actions = document.createElement("div");
  Object.assign(actions.style, { display: "flex", gap: "12px" });
  const continueButton = startupButton("Continue");
  const newGameButton = startupButton("New Game");
  if (canContinue) actions.append(continueButton);
  actions.append(newGameButton);
  panel.append(title, actions);
  surface.mount(panel);
  (canContinue ? continueButton : newGameButton).focus();

  return new Promise((resolve) => {
    const finish = (choice: "continue" | "new-game") => {
      surface.destroy();
      resolve(choice);
    };
    continueButton.addEventListener("click", () => finish("continue"), { once: true });
    newGameButton.addEventListener("click", () => finish("new-game"), { once: true });
  });
}

function startupButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  Object.assign(button.style, {
    background: "#211b2d",
    border: "2px solid white",
    color: "white",
    cursor: "pointer",
    font: "inherit",
    padding: "8px 12px",
  });
  return button;
}

function isContinuationState(value: unknown): value is BrowserContinuationState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return Object.keys(candidate).length === 3 &&
    candidate.formatVersion === 1 &&
    typeof candidate.providerSessionId === "string" &&
    candidate.providerSessionId.trim().length > 0 &&
    candidate.providerSessionId.length <= 200 &&
    typeof candidate.snapshot === "object" && candidate.snapshot !== null;
}
