# 05 — Pubblicare contratto e migrazione Fondale 0.2

**What to build:** Rendere Fondale 0.2 un contratto alpha coerente e
comprensibile per un Author. La documentazione normativa deve descrivere
soltanto i Noun target-owned, la numerazione corrente deve usare la linea 0.x e
la migration guide deve accompagnare chi porta un Game Project dalla forma 0.1
alla forma 0.2.

**Blocked by:** 04 — Migrare Capri 1535 e produrre il package 0.2.0

**Status:** ready-for-agent

- [ ] README, public reference e support baseline identificano il contratto corrente come Fondale 0.2 alpha.
- [ ] Le descrizioni product-facing della baseline precedente usano Fondale 0.1 invece della precedente numerazione 1.1.
- [ ] La migration guide 0.1 → 0.2 spiega perché il Noun appartiene al target e perché gli override degli Hotspot non sono più ammessi.
- [ ] La migration guide mostra trasformazioni complete per Object, Character e Scenery Hotspot.
- [ ] La migration guide chiarisce che Background Hotspot e Scene Passage conservano il proprio Noun locale.
- [ ] La migration guide spiega come unificare i precedenti Noun world e Inventory di un Object senza perdere Command Case o varianti di Game State.
- [ ] La documentazione chiarisce che Object, Character e Scenery non interattivi possono omettere il Noun, mentre un target referenziato deve possederlo.
- [ ] La documentazione descrive la diagnostica sul percorso del proprietario quando manca un Noun richiesto.
- [ ] La documentazione distingue la versione npm 0.2.0 dal Project Version e dal formato dei Save Snapshot.
- [ ] La documentazione pubblica non presenta registri globali di Noun o wrapper superficiali come pattern raccomandati.
- [ ] I riferimenti normativi rispettano il glossario e gli ADR su ownership, authoring dichiarativo, risoluzione runtime e stato alpha.
- [ ] La roadmap Fondale 1.0 resta esplicitamente fuori dallo scope della release 0.2.
- [ ] Ricette, link, indice pubblico e artefatto npm costruito superano la verifica documentale.
- [ ] Build completa, type checking, test browser del package e acceptance dell'esempio vendorizzato passano sullo stato finale combinato.
- [ ] Nessuna pubblicazione effettiva su npm viene eseguita da questo ticket.
