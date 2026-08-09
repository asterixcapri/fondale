# 07 — Passage leggibili e Tab reveal

**What to build:** permettere al Player di riconoscere le uscite di una Scene,
capirne direzione e destinazione e rivelare temporaneamente i Noun attivi.

**Blocked by:** 03 — Preferred Verb e fallback percepibili; 04 — Player Intent, revalidation e Fast Walk.

**Status:** ready-for-human

- [x] Ogni Scene Passage usa una Noun Definition e dichiara una Passage Direction tra left, right, up, down ed enter.
- [x] Hover su un Passage presenta label e cursore direzionale; i percorsi noti possono nominare la destinazione.
- [x] Tenere premuto Tab rivela contorno e label dei soli Noun e Passage attivi e il reveal scompare al rilascio.
- [x] Tab non attiva bersagli, non naviga il HUD e non espone destinazioni non dichiarate dall'Author.
- [x] Hotspot, Passage, Approach Point o Walkable Region nella fascia HUD riservata producono Authoring Diagnostic stabili.
- [x] Test browser verificano tutti i cursori, reveal temporaneo, filtri condizionali e transizione attraverso un Passage.
- [x] Test di authoring verificano geometria riservata e aggregazione di problemi indipendenti.
