# 09 — Choice nel HUD inferiore

**What to build:** trasformare il HUD inferiore nello spazio delle risposte
durante un dialogo e far pronunciare al Player Character la frase selezionata.

**Blocked by:** 02 — HUD con nove Verb e Walk To; 08 — Speech sopra i Character.

**Status:** ready-for-agent

- [ ] Durante una Choice, le alternative sostituiscono temporaneamente Verb e Inventory nella fascia inferiore.
- [ ] Sono visibili al massimo sei alternative e i tasti 1–6 selezionano quelle eleggibili.
- [ ] Più di sei alternative eleggibili producono un Authoring Diagnostic contestuale.
- [ ] La frase selezionata viene pronunciata dal Player Character prima di proseguire, salvo `spoken: false`.
- [ ] Gli input di mondo restano bloccati per tutta la Choice e la Sequence dominante.
- [ ] Al termine della Choice viene ripristinato il Command State precedentemente sospeso.
- [ ] Test pubblici e browser coprono condizioni, fallback, scorciatoie, spoken false e ripristino.
