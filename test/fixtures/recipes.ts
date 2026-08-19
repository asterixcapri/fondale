import { startGame, type GameSession } from "@asterixcapri/fondale";

import { project } from "../../docs/public/recipes/game";

/**
 * The published recipes, mounted as the one game they describe.
 *
 * Nothing is redefined here: the fixture starts the same `project` an Author
 * would import, so the browser proof and the documentation cannot drift apart.
 */
const target = document.querySelector<HTMLElement>('[data-recipe-target="lantern"]')!;
let session: GameSession = await startGame(project, { target });

document.querySelector<HTMLButtonElement>("#restore-choice")!.addEventListener("click", async () => {
  const raw: unknown = JSON.parse(JSON.stringify(session.createSaveSnapshot()));
  session.stop();
  session = await startGame(project, { target, snapshot: raw });
});
