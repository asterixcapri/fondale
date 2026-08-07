# 02 — Pipeline dei fondali: da immagine AI a scena giocabile

Type: task
Status: resolved

## Question

Trasformare in modo ripetibile un fondale generato dall'AI (1586x992, 16:10, circa 400.000 colori) nel formato che il gioco carica: 426x240, 16:9, palette limitata.

Già verificato in sessione: il ritaglio a 16:9 costa 100px di cielo ed è invisibile, e la quantizzazione a 64 colori regge benissimo. Qui si tratta di renderlo uno strumento invece di un esperimento.

Domande aperte da chiudere lavorando:

- una palette **condivisa tra tutte le scene**, o una per scena? La prima dà coerenza cromatica al gioco intero e permette effetti di palette; la seconda dà più fedeltà alla singola immagine.
- 64 colori è il numero giusto, o conviene salire?
- dithering in fase di quantizzazione: sì o no, e quale.

Non bloccato dal ticket 04, ma ne dipende: l'altezza utile della stanza cambia se l'interfaccia a verbi si mangia il quarto inferiore dello schermo. Lo strumento va quindi scritto con le dimensioni finali come parametro, non cablate.

Risolto quando esiste un comando che, dato un PNG, produce il fondale definitivo, e i quattro concept esistenti sono passati attraverso di esso.

## Answer

Status: resolved

`tools/process_background.py` — ritaglia al rapporto d'aspetto togliendo cielo dall'alto, riduce con LANCZOS, quantizza con MEDIANCUT. Larghezza, altezza e numero di colori sono parametri, non costanti, così la decisione sui verbi (ticket 04) non obbliga a riscrivere niente.

Tutti e quattro i concept sono passati attraverso lo strumento e stanno in `art/rooms/`. Vite li serve direttamente da lì (`publicDir: "art"`), quindi non esiste un passo di copia da dimenticare.

Decisioni prese: **palette per scena, 64 colori, senza dithering**. Il dithering in quantizzazione si somma alla texture di dithering già dipinta nell'immagine AI e produce rumore invece di gradienti.

Resta aperta, e non blocca lo slice: se convenga una **palette condivisa tra tutte le scene**. Darebbe coerenza cromatica al gioco intero e aprirebbe gli effetti di palette (notte, tramonto) a costo quasi zero. Va guardata quando le scene saranno abbastanza da poterla giudicare — annotata nella nebbia della mappa.
