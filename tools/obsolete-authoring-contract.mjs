const obsoleteAuthoringContracts = [
  /\bdefine(?:Game|Character|Object|Scene|Sequence|Noun|CommandLexicon|HUDTheme)\b/,
  /\bvalidateSaveSnapshot\b/,
  /\bValidatedSaveSnapshot\b/,
  /\bSaveSnapshotValidation\b/,
  /\bGameInput\b/,
  /opaque (?:Game Project|project)/i,
  /pre-validat(?:ed|o) Save Snapshot/i,
];

export function findObsoleteAuthoringContract(source) {
  return obsoleteAuthoringContracts.find((obsolete) => obsolete.test(source));
}
