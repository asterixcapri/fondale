# 05 — Pubblicare il contratto di authoring Fondale 0.2

**What to build:** Rendere Fondale 0.2 un contratto alpha coerente e
comprensibile per un Author. La documentazione normativa deve descrivere tutte
le funzionalità del motore utilizzabili da un Game Project, mostrare esempi
compilati e presentare soltanto i Noun target-owned. Le versioni restano interne
durante l'alpha e non richiedono una migration guide pubblica.

**Blocked by:** 04 — Migrare Capri 1535 e produrre il package 0.2.0

**Status:** ready-for-human

- [x] README, public reference e support baseline identificano il contratto corrente come Fondale 0.2 alpha.
- [x] Le descrizioni product-facing della baseline precedente usano Fondale 0.1 invece della precedente numerazione 1.1.
- [x] La guida di authoring descrive composizione, Scene Space, navigation, ownership dei Noun, Command, Inventory, Appearance, Sequence, HUD, runtime e persistence.
- [x] La guida mostra esempi correnti completi per Object, Character e Scenery Hotspot.
- [x] La guida chiarisce con esempi che Background Hotspot e Scene Passage conservano il proprio Noun locale.
- [x] La guida mostra come un solo Object Noun governa mondo e Inventory, inclusi Command Case e varianti di Game State.
- [x] La documentazione chiarisce che Object, Character e Scenery non interattivi possono omettere il Noun, mentre un target referenziato deve possederlo.
- [x] La documentazione descrive la diagnostica sul percorso del proprietario quando manca un Noun richiesto.
- [x] La documentazione distingue la versione npm 0.2.0 dal Project Version e dal formato dei Save Snapshot.
- [x] La documentazione pubblica non presenta registri globali di Noun o wrapper superficiali come pattern raccomandati.
- [x] I riferimenti normativi rispettano il glossario e gli ADR su ownership, authoring dichiarativo, risoluzione runtime e stato alpha.
- [x] La roadmap Fondale 1.0 resta esplicitamente fuori dallo scope della release 0.2.
- [x] Ricette, link, indice pubblico e artefatto npm costruito superano la verifica documentale.
- [x] Build completa, type checking, test browser del package e acceptance dell'esempio vendorizzato passano sullo stato finale combinato.
- [x] Nessuna pubblicazione effettiva su npm viene eseguita da questo ticket.

## Comments

- 2026-08-10: l'utente ha chiarito che le versioni Fondale sono ancora interne;
  il deliverable documentale è una guida completa al contratto corrente con
  esempi, non una migration guide tra versioni non pubblicate.
