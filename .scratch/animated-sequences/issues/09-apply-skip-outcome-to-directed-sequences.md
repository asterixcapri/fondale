# 09 — Applicare uno Skip Outcome alle Sequence dirette

**What to build:** permettere al Player di saltare una Sequence dichiarata skippable durante Animation, Motion o coordinamento tramite Cue, ottenendo una sola volta il risultato permanente esplicitamente scelto dall'Author.

**Blocked by:** 06 — Muovere Object e Scenery durante una Sequence; 07 — Muovere Character attraverso la navigazione; 08 — Coordinare le direzioni con Animation Cue.

**Status:** ready-for-agent

- [ ] Una Sequence skippable dichiara uno Skip Outcome composto da Game Operation validate.
- [ ] Lo skip interrompe Animation, Motion e loop transitori senza eseguire implicitamente tutti i passi rimanenti.
- [ ] Le Game Operation dello Skip Outcome vengono applicate atomicamente ed esattamente una volta.
- [ ] Appearance, Game Variable, posizioni canoniche e Default Animation risultano coerenti con il Game State finale.
- [ ] Dopo lo skip la Sequence termina e il Player recupera il normale controllo.
- [ ] Una Sequence non skippable ignora la richiesta senza alterare progresso o presentazione.
- [ ] Lo skip prima di un Cue, durante il Cue e dopo il Cue produce sempre il risultato finale dichiarato senza duplicazioni.
- [ ] Save e restore prima o dopo una richiesta di skip restano equivalenti a un'esecuzione ininterrotta.
- [ ] Uno Skip Outcome con riferimenti o operazioni invalidi produce Authoring Diagnostic prima dell'avvio.
- [ ] I comportamenti di skip già esistenti per Line e Narration rimangono coerenti con il nuovo contratto.
