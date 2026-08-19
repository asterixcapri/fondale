import type { CoreSession } from "@asterixcapri/fondale";

import {
  activate,
  advance,
  advanceTo,
  choose,
  clear,
  detailView,
  leaveConversation,
  pick,
  rest,
  select,
  skipSequence,
  until,
} from "./play";

/**
 * The canonical route through the prologue, expressed as milestones.
 *
 * Each function drives Capri 1535 the way a Player does and stops where a spec
 * can say something about the world. Nothing here asserts: the specs own what
 * they are proving.
 */

/** Accepts Raffaele's job through his authored alternatives alone. */
export function acceptHarbourJob(session: CoreSession): void {
  activate(session, "Raffaele");
  choose(session, "Cerchi qualcuno per un lavoro?");
  advanceTo(session, "monete", "raffaele");
  pick(session, "Quanto vale il lavoro?");
  advanceTo(session, "rubato", "raffaele");
  advanceTo(session, "lettera sigillata", "raffaele");
}

/** Pulls the fishing nets aside and collects the flask they concealed. */
export function pullNetsAndCollectOil(session: CoreSession): void {
  activate(session, "Reti da pesca");
  clear(session);
  activate(session, "Ampolla d'olio");
  clear(session);
}

export function travelToCloister(session: CoreSession): void {
  activate(session, "Passaggio verso il chiostro");
  clear(session);
  until(session, "the cloister to be presented", () => scene(session) === "cloister");
}

export function travelToHarbour(session: CoreSession): void {
  activate(session, "Passaggio verso il porto");
  clear(session);
  until(session, "the harbour to be presented", () => scene(session) === "harbour");
}

/** Gives Raffaele's letter to Brother Elia and hears the true account. */
export function deliverLetter(session: CoreSession): void {
  select(session, "sealedLetter");
  activate(session, "Frate Elia");
  advanceTo(session, "prestato volontariamente", "brotherElia");
  clear(session);
}

/** Oils the dry pulley support, frees the well and collects the handle. */
export function freeWellAndCollectHandle(
  session: CoreSession,
  options: { readonly skip?: boolean } = {},
): void {
  select(session, "oilFlask");
  activate(session, "Supporto della carrucola");
  clear(session);
  activate(session, "Pozzo lubrificato");
  if (options.skip) skipSequence(session);
  else advanceTo(session, "secchio è risalito", "brotherElia");
  clear(session);
  activate(session, "Manovella liberata");
  clear(session);
}

/** The authored chain from the opening harbour to the handle in hand. */
export function recoverHandle(session: CoreSession): void {
  acceptHarbourJob(session);
  leaveConversation(session);
  pullNetsAndCollectOil(session);
  travelToCloister(session);
  deliverLetter(session);
  freeWellAndCollectHandle(session);
  travelToHarbour(session);
}

/** Installs the handle, playing or skipping the choreographed Sequence. */
export function installHandle(
  session: CoreSession,
  options: { readonly skip?: boolean } = {},
): void {
  select(session, "winchHandle");
  activate(session, "Argano senza manovella");
  if (options.skip) skipSequence(session);
  else advanceTo(session, "argano", "michele");
  clear(session);
}

/** Answers Raffaele after the repair, which is what opens the fortification. */
export function answerRaffaele(
  session: CoreSession,
  choice = "Non dirò nulla del prestito.",
): void {
  activate(session, "Raffaele");
  choose(session, choice);
  rest(session);
  leaveConversation(session);
}

export function boardGozzo(session: CoreSession): void {
  activate(session, "Gozzo verso la fortificazione");
  until(session, "the fortification to be presented", () => scene(session) === "coastalFortification");
}

/**
 * Repairs the winch and sails to the fortification landing.
 *
 * The directed arrival Sequence runs on landing; `skipArrival` cuts it short the
 * way Escape does, which is how a spec proves the skip commits the same world.
 */
export function repairWinchAndSail(
  session: CoreSession,
  options: { readonly skipArrival?: boolean } = {},
): void {
  recoverHandle(session);
  installHandle(session);
  answerRaffaele(session);
  boardGozzo(session);
  if (options.skipArrival) skipSequence(session);
  clear(session);
}

/** Commits the sighting from the lookout. */
export function observeSighting(session: CoreSession): void {
  activate(session, "Belvedere della fortificazione");
  advanceTo(session, "una piccola barca alla deriva");
  advanceTo(session, "non dovrebbe essere qui", "michele");
}

/** Climbs back down and boards the drifting boat. */
export function descendToBoat(session: CoreSession): void {
  activate(session, "Scaletta verso gli scogli");
  until(session, "the drifting boat to be presented", () => scene(session) === "driftingBoat");
}

/** Everything between landing at the fortification and boarding the boat. */
export function reachDriftingBoat(session: CoreSession): void {
  rest(session);
  observeSighting(session);
  descendToBoat(session);
}

/** Plays the sailor encounter through to the presented close-up of the bundle. */
export function playSailorEncounter(session: CoreSession): void {
  activate(session, "Marinaio ferito", { action: "secondary" });
  advanceTo(session, "quel viso", "woundedSailor");
  advanceTo(session, "Mi scambi per un altro", "michele");
  advanceTo(session, "Ho navigato con tuo padre", "woundedSailor");
  advanceTo(session, "non è mai tornata", "michele");
  advanceTo(session, "Ti appartiene", "woundedSailor");
  advanceTo(session, "resta soltanto il respiro");
  advanceTo(session, "resta con me", "michele");
  advanceTo(session, "apre il fagotto");
  until(session, "the opened bundle to be presented", () => detailView(session) === "openedBundle");
}

/** Reads the broken seal inside the presented close-up. */
export function readBrokenSeal(session: CoreSession): void {
  activate(session, "Sigillo spezzato");
  advanceTo(session, "ceralacca", "michele");
  advanceTo(session, "Santa Marta", "michele");
  advanceTo(session, "ottobre del 1533", "michele");
}

/** Reads the torn registry fragment inside the presented close-up. */
export function readRegistryFragment(session: CoreSession): void {
  activate(session, "Frammento di registro");
  advanceTo(session, "registro", "michele");
  advanceTo(session, "Amalfi", "michele");
  advanceTo(session, "Giugno del 1534", "michele");
}

/** Hears the contradiction the completed reading commits. */
export function hearTheContradiction(session: CoreSession): void {
  advanceTo(session, "Ottobre del 1533", "michele");
  advanceTo(session, "Otto mesi dopo", "michele");
  until(session, "the world to be watched again", () => detailView(session) === undefined);
}

/** Watches the sailor die. */
export function watchSailorDie(session: CoreSession): void {
  advanceTo(session, "non si sente più");
  advanceTo(session, "Riposa, marinaio", "michele");
}

/** Lets Michele's closing gesture play out, which ends the Game Session. */
export function closeOnTheEnding(session: CoreSession): void {
  advance(session);
  until(session, "the Ending to be presented", () => detailView(session) === "prologueEnding");
}

/** The Scene currently presented. */
export function scene(session: CoreSession): string {
  return session.snapshot().currentScene;
}
