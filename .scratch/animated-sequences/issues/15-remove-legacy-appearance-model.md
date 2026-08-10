# 15 — Rimuovere il vecchio modello Appearance

**What to build:** concludere l'expand–contract eliminando le forme Appearance static e walking precedenti, così che pacchetto, documentazione, recipe, fixture e Capri espongano e verifichino una sola interface definitiva basata su Animation e Animation Role.

**Blocked by:** 03 — Migrare i consumatori dell'Engine al nuovo Appearance; 14 — Migrare gli Appearance rimanenti di Capri.

**Status:** ready-for-human

- [x] L'interface pubblica non esporta più le forme Appearance legacy né permette di dichiararle.
- [x] Validazione, caricamento asset, rendering e Save non contengono rami di compatibilità dedicati alle forme rimosse.
- [x] Tutti i Game Project, fixture, recipe, test e documenti normativi del repository usano il modello definitivo.
- [x] La reference pubblica descrive Appearance, Animation, Default Animation, Animation Role, Motion, Animation Cue, Camera diretta e Skip Outcome senza termini legacy.
- [x] Gli Authoring Diagnostic riguardano soltanto il contratto definitivo e conservano percorsi e messaggi stabili.
- [x] Il pacchetto distribuibile espone tutti i tipi e helper necessari dalla sola radice e non espone interni del renderer.
- [x] Le fixture dell'argano e della torre funzionano contro il pacchetto costruito, non soltanto contro sorgenti interne.
- [x] Una ricerca del repository non trova utilizzi autoriali delle forme Appearance rimosse.
- [x] `npm run build` completa type-check, package build e verifica documentale.
- [x] `npm run verify` completa la suite browser, comprese le vertical slice di argano e barca.
