# 02 — Migrare fixture, test e ricette ai Noun proprietari

**What to build:** Convertire tutto l'authoring mantenuto insieme all'Engine
alla forma target-owned, così nessun test, fixture o public recipe del package
dipende più dal Noun legacy sull'Hotspot. Gli Object devono offrire una sola
Noun Definition per mondo e Inventory, con tutti i relativi Command Case e le
varianti condizionali guidate dal Game State.

**Blocked by:** 01 — Espandere la risoluzione dei Noun dal target

**Status:** ready-for-agent

- [ ] Ogni Object usato da un Hotspot possiede la propria Noun Definition e l'Hotspot non la ripete.
- [ ] Ogni Character usato da un Hotspot possiede la propria Noun Definition e l'Hotspot non la ripete.
- [ ] Ogni Scenery usato da un Hotspot possiede la propria Noun Definition e l'Hotspot non la ripete.
- [ ] I Background Hotspot continuano a dichiarare direttamente il proprio Noun.
- [ ] I Scene Passage continuano a dichiarare direttamente il proprio Noun.
- [ ] Le precedenti definizioni separate di uno stesso Object nel mondo e nell'Inventory confluiscono in una sola Noun Definition senza perdere Pick Up, Look At, Use o altri Command Case osservabili.
- [ ] Un test end-to-end cambia una Game Variable analoga a `keyCleaned` e osserva la stessa Noun Label aggiornata in ogni luogo in cui l'Object è disponibile.
- [ ] I test coprono ancora Selected Object Verb, fallback, risposta, Line, Sequence e Game Operation target-relative.
- [ ] Le public recipes insegnano esclusivamente l'authoring target-owned e compilano tramite la package root.
- [ ] Non resta alcun call site 0.1 del campo Noun sugli Hotspot Object, Character o Scenery nell'authoring del package.
- [ ] Le aspettative diagnostiche e di immutabilità restano coerenti dopo il trasferimento dei Noun ai proprietari.
- [ ] Build, type checking, verifica documentale e test browser del package restano verdi.
