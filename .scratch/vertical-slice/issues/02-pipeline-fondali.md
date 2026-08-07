# 02 — Pipeline dei fondali: da immagine AI a scena giocabile

Type: task
Status: open

## Question

Trasformare in modo ripetibile un fondale generato dall'AI (1586x992, 16:10, circa 400.000 colori) nel formato che il gioco carica: 426x240, 16:9, palette limitata.

Già verificato in sessione: il ritaglio a 16:9 costa 100px di cielo ed è invisibile, e la quantizzazione a 64 colori regge benissimo. Qui si tratta di renderlo uno strumento invece di un esperimento.

Domande aperte da chiudere lavorando:

- una palette **condivisa tra tutte le scene**, o una per scena? La prima dà coerenza cromatica al gioco intero e permette effetti di palette; la seconda dà più fedeltà alla singola immagine.
- 64 colori è il numero giusto, o conviene salire?
- dithering in fase di quantizzazione: sì o no, e quale.

Risolto quando esiste un comando che, dato un PNG, produce il fondale definitivo, e i quattro concept esistenti sono passati attraverso di esso.
