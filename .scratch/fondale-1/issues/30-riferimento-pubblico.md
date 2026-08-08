# 30 — Completare il riferimento pubblico e il gate documentale

**What to build:** Un Author trova nel pacchetto un riferimento completo e
versionato per ogni parte dell'interface pubblica, mentre un controllo
automatico impedisce di pubblicare simboli, ricette o collegamenti privi del
contratto documentale richiesto.

**Blocked by:** 29 — Insegnare le Engine Capability con guide e ricette
verificate.

**Status:** ready-for-agent

- [ ] Ogni export pubblico e ogni struttura pubblica annidata documenta scopo,
      uso, valori ammessi, invarianti, default, errori e almeno un esempio.
- [ ] Il riferimento documenta codici e famiglie delle Authoring Diagnostic,
      ordine degli eventi e modalità di fallimento pertinenti.
- [ ] Il riferimento nasce accanto all'interface descritta; guide e ricette lo
      collegano senza duplicarlo come seconda fonte di verità.
- [ ] Un controllo automatico confronta l'intera interface pubblica con il
      riferimento e fallisce in presenza di export o campi non documentati.
- [ ] Collegamenti fra guida, ricette, diagnostiche, riferimento ed Example
      vengono verificati e non possono puntare a contenuti mancanti.
- [ ] Le sorgenti delle ricette vengono compilate e le prove comportamentali
      eseguite contro il pacchetto distribuibile, non tramite import interni.
- [ ] Codice eseguibile, tipi e documentazione richiesti vengono inclusi
      nell'artefatto installabile e restano versionati insieme.
- [ ] La documentazione descrive soltanto il contratto pubblico e non introduce
      CLI, inspector, plugin, renderer o altre capacità fuori scope.
- [ ] Il gate documentale è parte dei controlli obbligatori di pubblicazione e
      fallisce in modo stabile e azionabile.

