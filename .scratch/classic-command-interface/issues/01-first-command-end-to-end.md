# 01 — Primo Command end-to-end

**What to build:** introdurre il nuovo modello Command accanto al modello
contestuale esistente e rendere giocabile un primo percorso completo `Look At →
Noun → Command Response` attraverso la public authoring interface e il browser.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Un Author può definire Noun Label, Command Case e un Command Lexicon usando soltanto gli export della package root.
- [ ] Un Game Project minimo può eseguire `Look At` su un Noun del mondo e mostrare una Command Response percepibile.
- [ ] I Command Case eleggibili vengono valutati nell'ordine dichiarato sul Game State più recente.
- [ ] Le nuove definizioni sono immutabili e producono Authoring Diagnostic aggregati per input locali o riferimenti non validi.
- [ ] Il modello Primary Action continua temporaneamente a funzionare, così che i consumer non ancora migrati rimangano verdi.
- [ ] Test pubblici e browser coprono il tracer bullet senza importare moduli interni.
