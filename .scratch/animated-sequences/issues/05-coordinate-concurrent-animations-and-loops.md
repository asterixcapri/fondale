# 05 — Coordinare Animation concorrenti e loop

**What to build:** permettere a un singolo passo della Sequence di dirigere più Animation nello stesso momento e avanzare soltanto quando tutte le direzioni finite richieste sono concluse, senza introdurre Choreography, thread o callback.

**Blocked by:** 04 — Dirigere una Animation finita dalla Sequence.

**Status:** ready-for-agent

- [ ] Un passo può contenere direttamente più direzioni Animation e le avvia nello stesso tick logico.
- [ ] Il passo rimane attivo finché l'ultima direzione finita richiesta non è conclusa.
- [ ] Animation finite di durate differenti conservano il proprio playback senza serializzare i frame correnti.
- [ ] Un loop può accompagnare una direzione finita e viene terminato quando il passo avanza.
- [ ] Un passo composto soltanto da loop, senza durata o altro confine finito, produce un Authoring Diagnostic.
- [ ] Il Player rimane senza controllo normale per l'intera durata del passo concorrente.
- [ ] Save e restore a durate intermedie ricostruiscono tutte le direzioni senza riavviare quelle già concluse.
- [ ] Il completamento e il Game State finale sono identici con suddivisioni differenti del tempo reale.
- [ ] L'interface pubblica non introduce una definizione Choreography o una Sequence annidata.
- [ ] Una fixture browser mostra almeno due soggetti animati contemporaneamente e il corretto ritorno alle Default Animation.
