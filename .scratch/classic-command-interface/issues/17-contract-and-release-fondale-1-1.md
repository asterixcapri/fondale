# 17 — Contrazione e rilascio Fondale 1.1

**What to build:** chiudere la migrazione eliminando il vecchio modello
contestuale e consegnare Engine, documentazione e Capri come un unico sistema
Fondale 1.1 verificato.

**Blocked by:** 10 — Command State nei Save Snapshot; 12 — Save/Load visibile al Player; 13 — HUD Theme “A — Moderno trasparente”; 15 — Taverna e Monte Solaro; 16 — Migrazione dei consumer pubblici.

**Status:** ready-for-human

- [x] Primary Action, Inventory Use e ogni percorso runtime legacy vengono rimossi dalla public API, dal core, dal renderer e dai consumer.
- [x] Nessun Game Project può abilitare il vecchio modello come setting alternativo.
- [x] Capri usa Project Version 4 e mostra i Save Snapshot versione 3 come incompatibili con spiegazione.
- [x] Route, switcher, font proxy e stato del prototipo throwaway non fanno parte della build di produzione.
- [x] Il package e la documentazione identificano la capacità come Fondale 1.1 e non contengono riferimenti normativi a Fondale 2.0.
- [x] Il gate finale verifica build root, documentazione, suite browser root, build Example, project verification e suite Playwright Capri senza retry tollerati.
- [x] Una revisione visuale finale conferma HUD, font, cursori, crop, Speech e Choice ai viewport della Support Baseline.
