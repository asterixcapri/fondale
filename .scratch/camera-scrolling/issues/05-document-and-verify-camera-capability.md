# 05 — Documentare e verificare la Camera come Engine Capability

**What to build:** Rendere Scene Size e Camera parte coerente del contratto
pubblico di Fondale, aggiornare i documenti normativi e chiudere l'effort con
le gate complete del package e dell'Example Capri 1535.

**Blocked by:** 01, 02, 03, 04

**Status:** ready-for-agent

- [ ] Glossario, ADR, Concepts, Game Project authoring guide e Reference usano gli stessi termini canonici.
- [ ] La documentazione spiega che Logical Resolution è il viewport e Scene Size è l'estensione completa dello Scene Space.
- [ ] La recipe di una prima Scene mostra sia il default fisso sia una Scene panoramica.
- [ ] La Reference documenta default, invarianti, diagnostiche e compatibilità del nuovo campo.
- [ ] La Support Baseline conserva scaling uniforme, letterbox, mouse e profilo pixel durante lo scrolling.
- [ ] La documentazione chiarisce che la Camera è transitoria e assente dai Save Snapshot.
- [ ] Pan cinematografici, zoom, follow target alternativi, edge scrolling e tuning autoriale sono dichiarati fuori scope.
- [ ] La verifica documentale impedisce che esempi e Reference tornino ad assumere Scene Space uguale al viewport.
- [ ] `npm run build` passa per il package e per Capri 1535.
- [ ] `npm run verify` passa per l'Engine e per Capri 1535 con Chrome della Support Baseline.
- [ ] Una revisione visuale conferma pixel art, clamp, HUD fisso, Speech, Tab e fortificazione ai viewport supportati.
- [ ] Nessuna seam pubblica verso PixiJS o stato Camera viene introdotta durante la chiusura.
