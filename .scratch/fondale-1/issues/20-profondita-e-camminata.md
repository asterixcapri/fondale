# 20 — Comporre profondità, Perspective Scale e camminata

**What to build:** L'Example rende percepibili profondità e Perspective Scale:
il Character cammina nelle direzioni corrette, cambia dimensione lungo la Scene
e passa davanti o dietro a una Scenery senza che l'Author manipoli il display
tree o altri dettagli del renderer.

**Blocked by:** 19 — Rendere deterministico il movimento nella Walkable Region.

**Status:** ready-for-human

- [x] Scenery, Character e relativi Appearance vengono dichiarati tramite
      l'interface pubblica usando Ground Point, Visual Anchor e Baseline.
- [x] Una Scenery può usare un PNG autonomo o una regione poligonale ritagliata
      dal Background senza introdurre un secondo asset.
- [x] Character e Scenery partecipano allo stesso ordinamento del mondo; la
      profondità verticale determina chi appare davanti e i pareggi restano
      deterministici.
- [x] Una Perspective Scale a fermate viene interpolata nello Scene Space e
      applicata automaticamente al Character senza modificare il Game State
      con valori derivati dal renderer.
- [x] La camminata direzionale usa strisce PNG laterale, frontale e posteriore,
      specchia il lato opposto e conserva il primo frame come posa ferma.
- [x] Numero di frame, altezza, cadenza, divisibilità, Visual Anchor e
      dimensioni effettive delle strisce vengono validati al primo livello che
      possiede i dati necessari.
- [x] Appearance nominati e selezione iniziale appartengono al Game State;
      texture, frame corrente e interpolazione restano transitori.
- [x] Tutti i PNG richiesti vengono caricati prima dell'avvio; un asset
      mancante, indecodificabile o incoerente fallisce atomicamente e ripulisce
      il target.
- [x] Le prove osservano stato e risultato visivo attraverso le seam approvate,
      con screenshot diagnostici per profondità, scala, occlusione e direzioni,
      senza confronti pixel-perfect.
- [x] Le nuove Game Definition e regole degli asset sono documentate con
      esempi compilati contro il pacchetto distribuibile.

