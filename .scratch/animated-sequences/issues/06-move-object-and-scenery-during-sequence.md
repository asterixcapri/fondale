# 06 — Muovere Object e Scenery durante una Sequence

**What to build:** permettere a una Sequence di dirigere il Motion di Object e Scenery lungo percorsi autoriali mentre le loro Animation procedono indipendentemente, così da rappresentare una barca che oscilla e avanza senza trasformarne i frame in posizione.

**Blocked by:** 05 — Coordinare Animation concorrenti e loop.

**Status:** ready-for-agent

- [ ] Una direzione Motion può riferire un Object o una Scenery disponibile nella Scene corrente e un percorso valido nello Scene Space.
- [ ] La posizione evolve attraverso tempo logico indipendentemente dai frame dell'Animation dello stesso soggetto.
- [ ] Animation e Motion dello stesso soggetto possono iniziare insieme e concludersi secondo i confini dichiarati del passo.
- [ ] Un Object conserva il proprio Ground Point canonico coerentemente con le regole esistenti della sua collocazione.
- [ ] Una Scenery termina il Motion nella propria posizione di riposo autoriale e non aggiunge una coordinata arbitraria persistente al Game State.
- [ ] Appearance e Game Operation continuano a esprimere il risultato permanente osservabile al termine del Motion.
- [ ] Percorsi, punti o soggetti fuori dalla Scene corrente producono Authoring Diagnostic contestuali.
- [ ] Save e restore durante il Motion ricostruiscono la stessa posizione logica e producono lo stesso risultato finale dell'esecuzione ininterrotta.
- [ ] La fase della Default Animation resta derivata e non modifica il percorso o il risultato.
- [ ] Test deterministici e browser mostrano una Scenery animata che percorre il proprio tragitto e si assesta nello stato finale.
