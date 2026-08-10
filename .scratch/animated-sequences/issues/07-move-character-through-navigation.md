# 07 — Muovere Character attraverso la navigazione

**What to build:** permettere alla regia di spostare automaticamente un Character nella Scene rispettando la navigazione, la walking Animation e l'orientamento finale, senza restituire controllo al Player durante il tragitto.

**Blocked by:** 02 — Applicare gli Animation Role automatici; 05 — Coordinare Animation concorrenti e loop.

**Status:** ready-for-human

- [x] Una Sequence può dirigere un Character della Scene corrente verso un Ground Point valido con orientamento finale facoltativo.
- [x] Il Character segue la Walkable Region e la stessa navigazione affidabile usata dal movimento normale.
- [x] Il ruolo walking viene selezionato automaticamente durante il Motion e la Default Animation riprende all'arrivo.
- [x] Posizione, orientamento e Animation restano coerenti per movimenti frontali, posteriori e laterali.
- [x] Il Player Character può essere diretto dalla Sequence senza creare un Player Intent concorrente.
- [x] Un Character non controllato dal Player usa lo stesso contratto Motion senza diventare una nuova classe di Actor.
- [x] Destinazioni fuori dalla Scene o Appearance senza walking quando richiesta producono Authoring Diagnostic prima dell'avvio.
- [x] Save e restore durante il percorso riprendono dallo stesso progresso logico senza ripetere il tragitto completo.
- [x] I normali input del mondo restano inattivi fino al termine della Sequence.
- [x] Test deterministici e browser verificano navigazione, walking, orientamento finale e restituzione del controllo.
