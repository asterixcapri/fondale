# 08 — Coordinare le direzioni con Animation Cue

**What to build:** permettere a una Sequence di usare istanti nominati di un'Animation per avviare altre Animation o Motion con ordine deterministico, così che il contatto della manovella possa far reagire l'argano senza ritardi fragili o callback di frame.

**Blocked by:** 05 — Coordinare Animation concorrenti e loop; 06 — Muovere Object e Scenery durante una Sequence.

**Status:** ready-for-human

- [x] Un Author può dichiarare Animation Cue nominati in istanti validi di un'Animation.
- [x] Una direzione può attendere un Cue e avviare altre Animation o Motion nello stesso confine logico.
- [x] Più direzioni sbloccate dallo stesso Cue hanno un ordine causale deterministico e documentato.
- [x] Un Cue inesistente, duplicato in modo ambiguo o collocato fuori dalla durata produce un Authoring Diagnostic.
- [x] Un Cue non applica direttamente Game Operation e non espone callback, promise o accesso al clock.
- [x] Save e restore immediatamente prima e dopo un Cue non lo perdono e non lo eseguono due volte.
- [x] Lo stesso risultato viene prodotto con suddivisioni differenti del tempo reale.
- [x] Un passo continua a rispettare le regole di completamento delle proprie direzioni finite dopo l'attivazione del Cue.
- [x] Una fixture end-to-end coordina una performance iniziale, una reazione e un eventuale Motion usando soltanto dati dichiarativi.
- [x] La documentazione pubblica distingue Animation Cue da timer, frame callback e Game Operation.
