# 14 — Migrazione dell’enigma principale di Capri

**What to build:** rendere giocabile in italiano l'intero enigma dell'argano con
il nuovo sistema Command, usando i master approvati per le Scene principali.

**Blocked by:** 05 — Command binari Give e Use; 06 — Inventory permanente e feedback degli Object; 07 — Passage leggibili e Tab reveal; 08 — Speech sopra i Character; 09 — Choice nel HUD inferiore.

**Status:** ready-for-agent

- [ ] Alley, Town Square, Harbour e Grotto usano Noun Label, Preferred Verb, Command Case e fallback italiani coerenti con Michele.
- [ ] I percorsi principali sono bidirezionali e dichiarano label italiane sufficienti a comprendere la destinazione.
- [ ] Chiave, ampolla d'olio e manovella restano sempre rintracciabili attraverso mondo, Inventory e feedback.
- [ ] L'argano conserva condizioni, operazioni, trasformazioni visuali e soluzione narrativa esistenti.
- [ ] I master approvati restano integri; ogni Background runtime usa un crop 16:9 art-directed e resize 426×240 senza stretching.
- [ ] Art Master e note di generazione restano separati dai Runtime Asset posseduti dai moduli di gioco.
- [ ] La suite browser completa il percorso fino alla grotta e risolve l'argano usando mouse e tastiera reali.
