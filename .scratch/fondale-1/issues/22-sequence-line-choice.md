# 22 — Eseguire una Sequence con Line e Choice

**What to build:** Una Primary Action avvia una Sequence finita e modale nella
quale il Player avanza Line, compie una Choice e osserva le Game Operation del
ramo scelto prima di tornare all'esplorazione.

**Blocked by:** 21 — Risolvere una Primary Action a un Approach Point.

**Status:** ready-for-human

- [x] Una Sequence è una definizione radice nominata, finita e validata che può
      essere avviata da una Game Operation.
- [x] I passi pubblici sono Line con Character facoltativo, Choice,
      diramazione condizionale e gruppo ordinato di Game Operation.
- [x] Ogni Line resta visibile fino all'avanzamento manuale; una Line senza
      Character viene presentata come narrazione.
- [x] Una Choice mostra in ordine soltanto le alternative eleggibili nello
      snapshot committed e usa un fallback obbligatorio quando nessun'altra è
      disponibile.
- [x] Diramazioni e alternative proseguono con liste finite; riferimenti
      mancanti, assenza di fallback, cicli, ritorni e Sequence annidate vengono
      rifiutati da `defineGame`.
- [x] La Sequence è la Game Activity dominante: accetta soltanto avanzamento
      della Line o selezione della Choice e scarta gli altri Player Intent senza
      accodarli.
- [x] Ogni gruppo di operazioni produce il proprio commit; un fallimento futuro
      non annulla i commit precedenti della Sequence.
- [x] Il Game State conserva identità, percorso strutturale e Line o Choice
      attiva senza memorizzare Promise, callback o dettagli della UI.
- [x] Al termine della Sequence l'attività si chiude e il controllo torna al
      Player.
- [x] Le prove coprono Line, Choice con alternativa nascosta, fallback,
      diramazione, input scartati, commit intermedi e ritorno al gioco.
- [x] Interface e invarianti della Sequence sono documentate con una ricetta
      compilata e verificata.

