import type { CoreSession } from "@asterixcapri/fondale/testing";
import {
  activateNoun,
  advanceActivity,
  advanceToLine,
  chooseAlternative,
  leaveActivity,
  presentedDetailView,
  pressOn,
  selectObject,
  settle,
  skipSequence,
  stepUntil,
} from "@asterixcapri/fondale/testing";


/**
 * The canonical route through the prologue, expressed as milestones.
 *
 * Each function drives Capri 1535 the way a Player does and stops where a spec
 * can say something about the world. Nothing here asserts: the specs own what
 * they are proving.
 */

/** Accepts Raffaele's job through his authored alternatives alone. */
export function acceptHarbourJob(session: CoreSession): void {
  activateNoun(session, "Raffaele");
  chooseAlternative(session, "Cerchi qualcuno per un lavoro?");
  advanceToLine(session, "monete", "raffaele");
  chooseAlternative(session, "Quanto vale il lavoro?");
  advanceToLine(session, "rubato", "raffaele");
  advanceToLine(session, "lettera sigillata", "raffaele");
}

/** Pulls the fishing nets aside and collects the flask they concealed. */
export function pullNetsAndCollectOil(session: CoreSession): void {
  activateNoun(session, "Reti da pesca");
  pressOn(session);
  activateNoun(session, "Ampolla d'olio");
  pressOn(session);
}

export function travelToCloister(session: CoreSession): void {
  activateNoun(session, "Passaggio verso il chiostro");
  pressOn(session);
  stepUntil(session, "the cloister to be presented", () => scene(session) === "cloister");
}

export function travelToHarbour(session: CoreSession): void {
  activateNoun(session, "Passaggio verso il porto");
  pressOn(session);
  stepUntil(session, "the harbour to be presented", () => scene(session) === "harbour");
}

/** Gives Raffaele's letter to Brother Elia and hears the true account. */
export function deliverLetter(session: CoreSession): void {
  selectObject(session, "sealedLetter");
  activateNoun(session, "Frate Elia");
  advanceToLine(session, "prestato volontariamente", "brotherElia");
  pressOn(session);
}

/** Oils the dry pulley support, frees the well and collects the handle. */
export function freeWellAndCollectHandle(
  session: CoreSession,
  options: { readonly skip?: boolean } = {},
): void {
  selectObject(session, "oilFlask");
  activateNoun(session, "Supporto della carrucola");
  pressOn(session);
  activateNoun(session, "Pozzo lubrificato");
  if (options.skip) skipSequence(session);
  else advanceToLine(session, "secchio è risalito", "brotherElia");
  pressOn(session);
  activateNoun(session, "Manovella liberata");
  pressOn(session);
}

/** The authored chain from the opening harbour to the handle in hand. */
export function recoverHandle(session: CoreSession): void {
  acceptHarbourJob(session);
  leaveActivity(session);
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
  selectObject(session, "winchHandle");
  activateNoun(session, "Argano senza manovella");
  if (options.skip) skipSequence(session);
  else advanceToLine(session, "argano", "michele");
  pressOn(session);
}

/** Answers Raffaele after the repair, which is what opens the fortification. */
export function answerRaffaele(
  session: CoreSession,
  choice = "Non dirò nulla del prestito.",
): void {
  activateNoun(session, "Raffaele");
  chooseAlternative(session, choice);
  settle(session);
  leaveActivity(session);
}

export function boardGozzo(session: CoreSession): void {
  activateNoun(session, "Gozzo verso la fortificazione");
  stepUntil(session, "the fortification to be presented", () => scene(session) === "coastalFortification");
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
  pressOn(session);
}

/** Commits the sighting from the lookout. */
export function observeSighting(session: CoreSession): void {
  activateNoun(session, "Belvedere della fortificazione");
  advanceToLine(session, "una piccola barca alla deriva");
  advanceToLine(session, "non dovrebbe essere qui", "michele");
}

/** Climbs back down and boards the drifting boat. */
export function descendToBoat(session: CoreSession): void {
  activateNoun(session, "Scaletta verso gli scogli");
  stepUntil(session, "the drifting boat to be presented", () => scene(session) === "driftingBoat");
}

/** Everything between landing at the fortification and boarding the boat. */
export function reachDriftingBoat(session: CoreSession): void {
  settle(session);
  observeSighting(session);
  descendToBoat(session);
}

/** Plays the sailor encounter through to the presented close-up of the bundle. */
export function playSailorEncounter(session: CoreSession): void {
  activateNoun(session, "Marinaio ferito", "secondary");
  advanceToLine(session, "quel viso", "woundedSailor");
  advanceToLine(session, "Mi scambi per un altro", "michele");
  advanceToLine(session, "Ho navigato con tuo padre", "woundedSailor");
  advanceToLine(session, "non è mai tornata", "michele");
  advanceToLine(session, "Ti appartiene", "woundedSailor");
  advanceToLine(session, "resta soltanto il respiro");
  advanceToLine(session, "resta con me", "michele");
  advanceToLine(session, "apre il fagotto");
  stepUntil(session, "the opened bundle to be presented", () => presentedDetailView(session) === "openedBundle");
}

/** Reads the broken seal inside the presented close-up. */
export function readBrokenSeal(session: CoreSession): void {
  activateNoun(session, "Sigillo spezzato");
  advanceToLine(session, "ceralacca", "michele");
  advanceToLine(session, "Santa Marta", "michele");
  advanceToLine(session, "ottobre del 1533", "michele");
}

/** Reads the torn registry fragment inside the presented close-up. */
export function readRegistryFragment(session: CoreSession): void {
  activateNoun(session, "Frammento di registro");
  advanceToLine(session, "registro", "michele");
  advanceToLine(session, "Amalfi", "michele");
  advanceToLine(session, "Giugno del 1534", "michele");
}

/** Hears the contradiction the completed reading commits. */
export function hearTheContradiction(session: CoreSession): void {
  advanceToLine(session, "Ottobre del 1533", "michele");
  advanceToLine(session, "Otto mesi dopo", "michele");
  stepUntil(session, "the world to be watched again", () => presentedDetailView(session) === undefined);
}

/** Watches the sailor die. */
export function watchSailorDie(session: CoreSession): void {
  advanceToLine(session, "non si sente più");
  advanceToLine(session, "Riposa, marinaio", "michele");
}

/** Lets Michele's closing gesture play out, which ends the Game Session. */
export function closeOnTheEnding(session: CoreSession): void {
  advanceActivity(session);
  stepUntil(session, "the Ending to be presented", () => presentedDetailView(session) === "prologueEnding");
}

/** The Scene currently presented. */
export function scene(session: CoreSession): string {
  return session.snapshot().currentScene;
}
