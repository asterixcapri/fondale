# 02 — Line visivamente legata al Character

**What to build:** Rendere `Line` una frase pronunciata esclusivamente da un
Character visibile e valido. La presentazione deve identificare subito chi
parla e liberare definitivamente il modello dalla precedente ambiguità con la
`Narration`.

**Blocked by:** 01 — Narration esplicita end-to-end.

**Status:** ready-for-human

- [x] Ogni `Line` richiede un Character esistente; una `Line` senza Character
  o con un riferimento sconosciuto produce una diagnostica di authoring.
- [x] Tutte le precedenti `Line` usate come prosa del narratore vengono migrate
  a `Narration`, quindi la compatibilità transitoria viene rimossa senza
  lasciare consumer pubblici nel vecchio formato.
- [x] Il testo di una `Line` appare sopra la sagoma effettivamente renderizzata
  del Character e non sopra un offset fisso dal Ground Point.
- [x] La `Line` usa il colore del Character configurato nell'HUD Theme, un
  contorno nero di due pixel logici, nessun pannello e nessuna etichetta col
  nome dello speaker.
- [x] Posizionamento e leggibilità restano corretti vicino ai bordi della Scene
  e sui fondali chiari, scuri o visivamente densi del Capri Example.
