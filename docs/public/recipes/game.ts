import { startGame, type GameProject } from "fondale";

import { keeper, player } from "./characters";
import { commandFallbacks, commandLexicon } from "./commands";
import { lantern } from "./lantern";
import { notice } from "./notice";
import { backOutside, firstLight } from "./sequences";
import { quay, storeroom } from "./world";

/**
 * The whole example, assembled.
 *
 * A lantern under a crate, a brazier to light it with, a storeroom that stays
 * shut until it burns, and a ledger that ends the game. Every other recipe in
 * this directory is a part of this one game, so the pieces can be read
 * separately and still be seen fitting together.
 */
export const project = ({
  identity: "com.example.lantern",
  version: "1",
  logicalResolution: { width: 1280, height: 720 },
  scenes: { quay, storeroom },
  characters: { player, keeper },
  playerCharacter: "player",
  objects: { lantern },
  sequences: { firstLight, backOutside },
  detailViews: { notice },
  variables: { lanternHeld: false, lanternLit: false, sawTheStoreroom: false, readTheLedger: false },
  inventoryAppearanceSize: 64,
  initialScene: "quay",
  commandLexicon,
  commandFallbacks,
  // No `hudTheme`: see the note in commands.ts. The Engine uses its defaults.
} satisfies GameProject);

/** What a shipped game does on load. */
export async function open(target: HTMLElement) {
  return startGame(project, { target });
}
