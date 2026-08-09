# 09 — Choice nel HUD inferiore

**What to build:** trasformare il HUD inferiore nello spazio delle risposte
durante un dialogo e far pronunciare al Player Character la frase selezionata.

**Blocked by:** 02 — HUD con nove Verb e Walk To; 08 — Speech sopra i Character.

**Status:** ready-for-human

- [x] Durante una Choice, le alternative sostituiscono temporaneamente Verb e Inventory nella fascia inferiore.
- [x] Sono visibili al massimo sei alternative e i tasti 1–6 selezionano quelle eleggibili.
- [x] Più di sei alternative eleggibili producono un Authoring Diagnostic contestuale.
- [x] La frase selezionata viene pronunciata dal Player Character prima di proseguire, salvo `spoken: false`.
- [x] Gli input di mondo restano bloccati per tutta la Choice e la Sequence dominante.
- [x] Al termine della Choice viene ripristinato il Command State precedentemente sospeso.
- [x] Test pubblici e browser coprono condizioni, fallback, scorciatoie, spoken false e ripristino.
