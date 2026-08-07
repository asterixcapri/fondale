# 01 — Come produciamo lo sprite di Michele

Type: prototype
Status: open

## Question

È il collo di bottiglia dell'intero progetto e l'unico punto dove la generazione AI di immagini non risolve da sola. I fondali si generano; otto frame coerenti dello stesso personaggio no.

Serve Michele alto circa 100 pixel in primo piano, con come minimo camminata in 4 direzioni a 6-8 frame, idle e parlata. Coerente frame per frame, in palette con i fondali. Da evitare il look "pirata caraibico": è un giovane caprese del Cinquecento.

Sotto il vincolo di autonomia, l'agente deve arrivarci da solo. Strade da provare, in ordine di probabilità:

- **costruzione procedurale a codice** — corpo scomposto in parti (busto, braccia, gambe, testa) disegnate a codice e animate per interpolazione. Coerenza garantita per costruzione, ed è l'unica via completamente sotto controllo dell'agente. Rischio: sembra rigido.
- **posato singolo generato dall'AI, scomposto e animato** — si genera un Michele fermo, lo si ritaglia in parti e le si anima. Compromesso tra qualità del disegno e coerenza.
- **render di un modello 3D grezzo ridotto a pixel art** — tecnica usata da diverse avventure moderne proprio per garantire coerenza tra i frame. Costo di setup alto.

Il ticket è risolto quando esiste **un ciclo di camminata vero, guardato in movimento** dall'agente tramite il banco di verifica, e sappiamo quanto costa produrne un altro. Non quando è stato scelto un metodo in teoria.

Se nessuna delle strade dà un risultato accettabile, è l'informazione più importante dell'intera mappa e va riportata subito all'umano: cambia il preventivo del progetto.

## Comments

### Sheet v1 — scartato come animazione

`art/concept/personaggi/michele-walk-cycle-v1.png`, generato con AI. Inutilizzabile: le righe non corrispondono alle etichette (sotto "WALK RIGHT" convivono frontali, di spalle e di profilo), alone luminoso non ritagliabile, 235.000 colori, celle da 256x341. E il design è il "pirata caraibico" che il documento di progetto esclude esplicitamente. Resta valido come riferimento di corporatura.

### Sheet v2 — vicino, misurato

`art/concept/personaggi/michele-walk-cycle-v2.png`. Netto miglioramento: 4 righe corrette e coerenti con le etichette, sfondo nero scontornabile, e soprattutto il design giusto — camicia con maniche arrotolate, gilet, brache, borsa alla cintura. Nessun pirata.

Misure prese sui 24 frame, normalizzati sul proprio ingombro e allineati ai piedi:

| riga | testa | busto | gambe |
|---|---|---|---|
| WALK RIGHT | 21% | 55% | 24% |
| WALK LEFT | 19% | 60% | 20% |
| WALK FRONT | 22% | 54% | 24% |
| WALK BACK | 18% | 53% | 28% |

Il cambiamento tra frame consecutivi si concentra nel **busto**, non nelle gambe, e la testa cambia quanto le gambe. In un ciclo di camminata autentico il rapporto è rovesciato. Diagnosi: ogni riquadro è una generazione indipendente con la camminata *suggerita*, non una posa di una sequenza. Riprodotti a 10 fps, le gambe camminano e il resto ribolle.

Verificato che non fosse un artefatto della normalizzazione guardando i frame ingranditi e allineati: il volume dei capelli, l'allacciatura del gilet e la larghezza delle spalle oscillano visibilmente.

**Attenuante importante:** nello sheet la figura è alta 182px, nel gioco ne serve 84-100. La riduzione assorbe gran parte del tremolio. Prodotta una GIF alla scala reale sul fondale del vicolo e sottoposta all'umano, che è l'unico dei due a poter guardare un'animazione in movimento.

### Correzione pronta, se serve

Se il ribollimento risulta inaccettabile, **non servono nuove generazioni**: si scompone. Un solo frame fa da corpo canonico dalla vita in su; sotto gli si montano le gambe delle diverse pose, allineate sulla fascia in vita. La coerenza diventa garantita per costruzione — testa e busto sono gli stessi pixel a ogni frame — e si conserva la qualità del disegno. È la sintesi delle due strade elencate nella domanda: qualità dell'AI, coerenza del procedurale.
