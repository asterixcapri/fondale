# 31 — Verificare Fondale 1.0 dal pacchetto allo stato finale

**What to build:** Un unico percorso di accettazione prende l'artefatto
candidato alla pubblicazione, lo installa nell'Example esterno e dimostra in
Chrome con input reali che Fondale 1.0 costruisce e completa la piccola
avventura promessa, inclusi Save Snapshot, documentazione e gate di qualità.

**Blocked by:** 30 — Completare il riferimento pubblico e il gate documentale.

**Status:** ready-for-human

- [x] L'Example installa l'esatto artefatto candidato, compila contro i suoi
      tipi e produce una build statica senza import interni o dipendenze dirette
      da PixiJS.
- [x] Playwright avvia una nuova Game Session in Google Chrome stabile e usa
      soltanto mouse e tastiera reali attraverso l'interface pubblica.
- [x] Il percorso esplora due Scene, muove il Character nella Walkable Region e
      rende percepibili profondità, Perspective Scale e Scenery.
- [x] Il percorso raggiunge un Hotspot, esegue una Primary Action e completa una
      Sequence con Line, Choice, condizioni, Game Operation e cambio di
      Appearance del Character.
- [x] Il percorso raccoglie un Object, lo seleziona, prova un Inventory Use
      fallito che conserva la selezione e completa quello valido cambiando Game
      Variable, Appearance, collocazione e disponibilità del passaggio.
- [x] Il percorso esercita un Game Behavior sincrono attraverso il contesto
      pubblico ristretto.
- [x] Durante la Choice crea un Save Snapshot, arresta la sessione, valida il
      dato e riprende la stessa attività senza ripetere operazioni.
- [x] Il Player attraversa il Scene Passage e raggiunge uno stato finale
      osservabile senza leggere o mutare interni dell'Engine.
- [x] L'equivalenza fra percorso ininterrotto e ripristinato viene verificata
      attraverso il core deterministico.
- [x] Il percorso passa in almeno due finestre desktop rappresentative, non
      produce errori di console o eccezioni e genera screenshot diagnostici
      stabili per la revisione visiva umana.
- [x] Type-check, build, prove rapide del core, casi negativi essenziali,
      documentazione, ricette, link e percorso Playwright formano un unico gate
      di pubblicazione.
- [x] Un fallimento intermittente resta rosso: un nuovo tentativo può raccogliere
      diagnostica ma non autorizza la release.
- [x] Il gate non stabilizza capacità fuori scope soltanto perché presenti
      accidentalmente nell'implementazione o nel browser.
