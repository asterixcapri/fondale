# 04 — Dirigere una Animation finita dalla Sequence

**What to build:** permettere a una Sequence di togliere temporaneamente la regia al Player, eseguire una Animation nominata su un Character, Object o Scenery, attenderne la conclusione e restituire il controllo nello stesso stato logico anche dopo Save e restore.

**Blocked by:** 01 — Espandere Appearance con Animation.

**Status:** ready-for-human

- [x] Una Sequence può dirigere una Animation finita disponibile nell'Appearance corrente di un Character, Object o Scenery.
- [x] L'avvio della direzione rende la Sequence la Game Activity dominante e impedisce nuovi Command, camminata libera e uso dell'Inventory.
- [x] Il passo successivo non inizia finché l'Animation finita non è conclusa nel tempo logico.
- [x] Terminata l'Animation, il soggetto torna alla propria Default Animation e, terminata la Sequence, il Player recupera il controllo.
- [x] Una Animation esplicita assente dall'Appearance corrente produce un Authoring Diagnostic e non un fallback silenzioso.
- [x] Il Game State conserva percorso e progresso logico sufficienti senza serializzare frame, texture o oggetti renderer.
- [x] Save e restore durante l'Animation producono lo stesso ordine e Game State finale dell'esecuzione ininterrotta.
- [x] La direzione non può riferire soggetti di un'altra Scene né produrre un cambio di Scene.
- [x] Line, Narration, Choice, branch e Game Operation esistenti continuano a funzionare nelle Sequence.
- [x] Test pubblici, deterministici e browser verificano l'intero trasferimento e ritorno della regia.
