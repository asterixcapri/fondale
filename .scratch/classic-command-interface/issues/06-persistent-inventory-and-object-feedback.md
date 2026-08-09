# 06 — Inventory permanente e feedback degli Object

**What to build:** rendere sempre visibili gli Object trasportati e spiegare
ogni acquisizione, consumo o ricollocazione attraverso HUD e feedback del mondo.

**Blocked by:** 05 — Command binari Give e Use.

**Status:** ready-for-agent

- [ ] Il HUD mostra permanentemente otto Inventory Slot in una griglia 4×2, inclusi gli slot vuoti.
- [ ] Frecce e rotellina permettono di raggiungere Object oltre gli otto visibili senza cambiare l'ordine dell'Inventory.
- [ ] Un Object appena acquisito viene portato automaticamente nella pagina visibile.
- [ ] Hover, selezione e primo Noun sono distinguibili senza affidarsi soltanto al colore.
- [ ] Raccolta, consumo e collocazione producono feedback percepibile e aggiornano atomicamente mondo, Inventory e Command State.
- [ ] Nessun Object scompare senza Command Response o feedback breve.
- [ ] I test browser verificano Inventory vuoto, paginazione, raccolta, uso fallito, consumo e collocazione.
