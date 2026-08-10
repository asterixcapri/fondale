# 06 — Muovere Object e Scenery durante una Sequence

**What to build:** permettere a una Sequence di dirigere il Motion di Object e Scenery lungo percorsi autoriali mentre le loro Animation procedono indipendentemente, così da rappresentare una barca che oscilla e avanza senza trasformarne i frame in posizione.

**Blocked by:** 05 — Coordinare Animation concorrenti e loop.

**Status:** ready-for-human

- [x] Una direzione Motion può riferire un Object o una Scenery disponibile nella Scene corrente e un percorso valido nello Scene Space.
- [x] La posizione evolve attraverso tempo logico indipendentemente dai frame dell'Animation dello stesso soggetto.
- [x] Animation e Motion dello stesso soggetto possono iniziare insieme e concludersi secondo i confini dichiarati del passo.
- [x] Un Object conserva il proprio Ground Point canonico coerentemente con le regole esistenti della sua collocazione.
- [x] Una Scenery termina il Motion nella propria posizione di riposo autoriale e non aggiunge una coordinata arbitraria persistente al Game State.
- [x] Appearance e Game Operation continuano a esprimere il risultato permanente osservabile al termine del Motion.
- [x] Percorsi, punti o soggetti fuori dalla Scene corrente producono Authoring Diagnostic contestuali.
- [x] Save e restore durante il Motion ricostruiscono la stessa posizione logica e producono lo stesso risultato finale dell'esecuzione ininterrotta.
- [x] La fase della Default Animation resta derivata e non modifica il percorso o il risultato.
- [x] Test deterministici e browser mostrano una Scenery animata che percorre il proprio tragitto e si assesta nello stato finale.
