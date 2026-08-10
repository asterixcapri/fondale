# 10 — Avviare una Sequence all'arrivo in una Scene

**What to build:** permettere a una Scene di prendere immediatamente la regia dopo una normale transizione, in base alla Scene Entrance utilizzata e al Game State, senza concedere al Player un intervallo di controllo e senza introdurre trigger spaziali.

**Blocked by:** 04 — Dirigere una Animation finita dalla Sequence.

**Status:** ready-for-agent

- [ ] Una Scene può dichiarare regole condizionali di avvio di una Sequence all'arrivo.
- [ ] Una regola può filtrare una Scene Entrance specifica oppure applicarsi a ogni ingresso pertinente.
- [ ] Le condizioni leggono il Game State committed dopo la transizione.
- [ ] Il normale Scene Passage completa atomicamente cambio di Scene, Ground Point e orientamento prima dell'avvio della Sequence.
- [ ] Una regola applicabile avvia la Sequence prima che un nuovo input del mondo possa produrre un Player Intent.
- [ ] Nessuna regola applicabile restituisce normalmente il controllo al Player nella Scene di destinazione.
- [ ] Più regole applicabili allo stesso arrivo producono un Authoring Diagnostic invece di scegliere silenziosamente.
- [ ] L'avvio di una nuova Game Session e il restore di un Save Snapshot già nella Scene non vengono trattati come arrivi.
- [ ] Una Game Variable può impedire che la stessa Sequence riparta durante visite successive.
- [ ] Test deterministici e browser attraversano un portone reale, osservano l'avvio immediato e dimostrano l'assenza di Sequence Trigger spaziali o cambi multi-Scene.
