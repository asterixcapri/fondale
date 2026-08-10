# 03 — Proiettare input e overlay attraverso la Camera

**What to build:** Usare una sola proiezione coerente fra coordinate del
viewport e Scene Space dopo lo scrolling. Tutte le intenzioni sul mondo devono
raggiungere il Core con l'offset Camera, mentre HUD e testo ancorato al mondo
mantengono la corretta appartenenza visiva.

**Blocked by:** 02

**Status:** resolved

- [x] Click sinistro sul terreno o su un Hotspot usa il punto corretto nello Scene Space dopo lo scrolling.
- [x] Click destro, doppio click, hover e Scene Passage usano la stessa proiezione.
- [x] Il cursore direzionale e il Contextual Action corrispondono al Noun realmente sotto il puntatore.
- [x] Il Command Preview rimane accanto al puntatore in coordinate del viewport.
- [x] Le Line seguono la silhouette visibile del Character e restano nella safe area del viewport.
- [x] Una Line di un altro Character non prende il controllo della Camera.
- [x] La rivelazione con Tab proietta e ritaglia Hotspot e Passage rispetto alla Camera corrente.
- [x] Inventory, Choice, Command Response, Narration, Options, Help, Save e Load restano fissi nel viewport.
- [x] Background Region e maschere di Scenery restano allineati al Background durante lo scrolling.
- [x] I test browser verificano l'interazione soltanto dopo aver spostato la Camera dall'origine.
- [x] Nessuna proprietà pubblica o test-only espone direttamente le coordinate Camera.
