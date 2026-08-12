import type { CoreSession } from "../capabilities/game-session";
import type { AuthoringDiagnostic, CompiledGameProject } from "../capabilities/game-project";
import type { HUDSaveSlotFacts } from "../capabilities/hud";
import {
  createSave,
  type SaveSnapshot,
  type ValidatedSaveSnapshot,
} from "../capabilities/save";

export interface BrowserSaveSlot extends HUDSaveSlotFacts {
  readonly name: string;
  readonly savedAt: string;
  readonly snapshot: SaveSnapshot | unknown;
}

export interface BrowserSessionControls {
  slots(): readonly BrowserSaveSlot[];
  save(name: string): void;
  load(index: number): { readonly ok: true } | {
    readonly ok: false;
    readonly diagnostics: readonly AuthoringDiagnostic[];
  };
}

interface StoredSaveSlot {
  readonly name: string;
  readonly savedAt: string;
  readonly snapshot: unknown;
}

const saveSlotsKey = "fondale.save-slots";

/** Adapts Save-owned snapshots and compatibility decisions to localStorage. */
export function createBrowserSessionControls(
  project: CompiledGameProject,
  currentCore: () => CoreSession,
  replaceCore: (snapshot: ValidatedSaveSnapshot) => void,
): BrowserSessionControls {
  const read = (): StoredSaveSlot[] => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(saveSlotsKey) ?? "[]");
      if (!Array.isArray(value)) return [];
      return value.flatMap((slot) => {
        if (!slot || typeof slot !== "object") return [];
        const candidate = slot as Record<string, unknown>;
        return typeof candidate.name === "string" && typeof candidate.savedAt === "string"
          ? [{ name: candidate.name, savedAt: candidate.savedAt, snapshot: candidate.snapshot }]
          : [];
      });
    } catch {
      return [];
    }
  };
  const write = (slots: readonly StoredSaveSlot[]) => {
    localStorage.setItem(saveSlotsKey, JSON.stringify(slots));
  };
  const saveCapability = createSave(project);
  const describe = (slot: StoredSaveSlot): BrowserSaveSlot => {
    const validation = saveCapability.validate(slot.snapshot);
    return {
      ...slot,
      compatible: validation.ok,
      diagnostics: validation.ok ? [] : validation.diagnostics,
    };
  };
  return {
    slots: () => read().map(describe),
    save(name) {
      const normalized = name.trim() || "Save";
      const slots = read();
      const next = {
        name: normalized,
        savedAt: new Date().toISOString(),
        snapshot: currentCore().createSaveSnapshot(),
      };
      const existing = slots.findIndex((slot) => slot.name === normalized);
      if (existing >= 0) slots[existing] = next;
      else slots.push(next);
      write(slots);
    },
    load(index) {
      const slot = read()[index];
      const validation = saveCapability.validate(slot?.snapshot);
      if (!validation.ok) return { ok: false, diagnostics: validation.diagnostics };
      replaceCore(validation.snapshot);
      return { ok: true };
    },
  };
}
