# 16 — Migrazione dei consumer pubblici

**What to build:** dimostrare che documentazione, recipe e fixture possono usare
integralmente il nuovo contratto pubblico senza dipendere dal modello
contestuale o da import interni.

**Blocked by:** 03 — Preferred Verb e fallback percepibili; 05 — Command binari Give e Use; 07 — Passage leggibili e Tab reveal; 08 — Speech sopra i Character; 09 — Choice nel HUD inferiore.

**Status:** ready-for-human

- [x] Quick Start, concepts, reference, Support Baseline e recipe descrivono Fondale 1.1 con la canonical domain language.
- [x] Le recipe compilate mostrano Noun, Command unari e binari, fallback, Passage, Speech, Choice e Save Snapshot.
- [x] Tutti gli esempi documentali importano soltanto dalla package root e vengono verificati nella build.
- [x] Le fixture browser non Capri usano il nuovo contratto mantenendo copertura di startup, asset failure e lifecycle.
- [x] Una guida di migrazione spiega come sostituire Primary Action e Inventory Use senza esporre dettagli interni.
- [x] La documentazione chiarisce input supportati, comportamenti fuori scope e separazione fra Game State e Player Preferences.
- [x] Build e gate documentale passano mentre il modello legacy resta temporaneamente disponibile.
