# 14 — Migrare gli Appearance rimanenti di Capri

**What to build:** portare tutti i Character, Object e Scenery rimanenti di Capri sul modello definitivo di Appearance, Default Animation e Animation Role, preservando grafica, enigma, navigazione e dialoghi già approvati.

**Blocked by:** 12 — Animare l'inserimento della manovella nell'argano; 13 — Mostrare l'approdo della barca dalla torre.

**Status:** ready-for-agent

- [ ] Ogni Appearance di Character, Object e Scenery dell'Example usa la nuova forma con Default Animation esplicita.
- [ ] I Character mobili dichiarano walking e quelli che parlano usano speaking oppure il fallback default intenzionale.
- [ ] Gli elementi statici usano Default Animation a un fotogramma senza asset artificiosi o duplicazioni non necessarie.
- [ ] Anchor, Ground Point, Baseline, Perspective Scale, profondità e orientamento percepibile rimangono invariati.
- [ ] Le Game Operation che selezionano Appearance continuano a produrre gli stessi stati semantici dell'avventura.
- [ ] Dialoghi, Inventory, Scene Passage e puzzle non cambiano comportamento a causa della migrazione visiva.
- [ ] Nessun modulo o fixture di Capri conserva le forme Appearance legacy.
- [ ] Gli asset continuano a essere posseduti dai rispettivi moduli di gioco e caricati tramite l'interface pubblica.
- [ ] Le verifiche browser di Capri coprono almeno camminata, Line, Object, Scenery e Save/Load dopo la migrazione.
- [ ] Build e acceptance completa di Capri rimangono verdi.
