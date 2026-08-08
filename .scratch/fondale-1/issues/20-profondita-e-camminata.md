# 20 — Comporre profondità, Perspective Scale e camminata

**What to build:** L'Example rende percepibili profondità e Perspective Scale:
il Character cammina nelle direzioni corrette, cambia dimensione lungo la Scene
e passa davanti o dietro a una Scenery senza che l'Author manipoli il display
tree o altri dettagli del renderer.

**Blocked by:** 19 — Rendere deterministico il movimento nella Walkable Region.

**Status:** ready-for-agent

- [ ] Scenery, Character e relativi Appearance vengono dichiarati tramite
      l'interface pubblica usando Ground Point, Visual Anchor e Baseline.
- [ ] Una Scenery può usare un PNG autonomo o una regione poligonale ritagliata
      dal Background senza introdurre un secondo asset.
- [ ] Character e Scenery partecipano allo stesso ordinamento del mondo; la
      profondità verticale determina chi appare davanti e i pareggi restano
      deterministici.
- [ ] Una Perspective Scale a fermate viene interpolata nello Scene Space e
      applicata automaticamente al Character senza modificare il Game State
      con valori derivati dal renderer.
- [ ] La camminata direzionale usa strisce PNG laterale, frontale e posteriore,
      specchia il lato opposto e conserva il primo frame come posa ferma.
- [ ] Numero di frame, altezza, cadenza, divisibilità, Visual Anchor e
      dimensioni effettive delle strisce vengono validati al primo livello che
      possiede i dati necessari.
- [ ] Appearance nominati e selezione iniziale appartengono al Game State;
      texture, frame corrente e interpolazione restano transitori.
- [ ] Tutti i PNG richiesti vengono caricati prima dell'avvio; un asset
      mancante, indecodificabile o incoerente fallisce atomicamente e ripulisce
      il target.
- [ ] Le prove osservano stato e risultato visivo attraverso le seam approvate,
      con screenshot diagnostici per profondità, scala, occlusione e direzioni,
      senza confronti pixel-perfect.
- [ ] Le nuove Game Definition e regole degli asset sono documentate con
      esempi compilati contro il pacchetto distribuibile.

