# 04 — Migrare Capri 1535 e produrre il package 0.2.0

**What to build:** Portare il Game Project Capri 1535 sulla forma target-owned
e usarlo come prova reale del package Fondale 0.2.0. Ogni Noun deve vivere
accanto al proprio Object, Character, Scenery, background region o Scene
Passage; il registro globale e i wrapper superficiali devono scomparire senza
alterare enigmi, dialoghi, Inventory o navigazione.

**Blocked by:** 03 — Contrarre l'interfaccia Hotspot di Fondale 0.2

**Status:** ready-for-human

- [x] I Noun di key, oil flask e winch handle sono definiti direttamente con i rispettivi Object e governano sia mondo sia Inventory.
- [x] I Noun di Raffaele e dell'host sono definiti direttamente con i rispettivi Character.
- [x] I Noun di gate, winch e degli altri Scenery sono definiti direttamente nelle Scene proprietarie.
- [x] I Background Hotspot e Scene Passage definiscono localmente i propri Noun accanto a geometria, condizioni e destinazione.
- [x] Il modulo globale dei Noun viene eliminato e nessun import vi fa più riferimento.
- [x] I wrapper globali per Noun unari e Passage vengono eliminati; l'esempio mostra direttamente `defineNoun`.
- [x] La chiave apre ancora il cancello e il relativo cambio di Game State, Appearance e navigazione resta osservabile.
- [x] Oil flask e winch handle riparano ancora il winch nella sequenza prevista, inclusi consumo, ricollocamento e sblocco del Passage.
- [x] Raffaele, host, traveller e gli altri Noun mantengono Preferred, Secondary e Selected Object Verb, Line, Sequence e response previste.
- [x] Inventory, conditional label, Tab reveal, Contextual Action e Scene Passage restano osservabilmente invariati.
- [x] Il package root, i lockfile e il package installato dall'esempio adottano la versione 0.2.0.
- [x] Il tarball vendorizzato, i riferimenti di dipendenza e gli strumenti che lo costruiscono o verificano concordano sul nome e sulla versione 0.2.0.
- [x] Il package viene costruito prima di generare l'artefatto vendorizzato e l'esempio viene verificato contro quell'artefatto, non contro sorgenti implicite del workspace.
- [x] Build dell'Engine, build dell'esempio e acceptance browser di Capri 1535 restano verdi.
