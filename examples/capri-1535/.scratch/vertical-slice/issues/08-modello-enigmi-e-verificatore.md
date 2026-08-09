# 08 — Il modello dichiarativo degli enigmi e il verificatore

Type: prototype
Status: open
Blocked by: 03

## Question

Dare forma concreta al modello deciso in charting: precondizioni ed effetti come dato invece che `if` sparsi negli script.

Da definire: il vocabolario delle condizioni (possiede, stato di, flag attivo) e degli effetti (cambia stato, aggiungi all'inventario, dì, avvia cutscene); come si aggancia ai dialoghi; e dove finisce il dichiarativo e comincia la sequenza imperativa delle cutscene.

Il pezzo che giustifica l'intera scelta di costruire invece di ereditare è il **verificatore**: esplora esaustivamente lo spazio degli stati e dimostra che il gioco è completabile, che nessuna azione produce uno stato insolubile, che non esistono oggetti inutilizzabili né enigmi irraggiungibili.

Da valutare anche: generare il **diagramma del grafo degli enigmi** dallo stesso dato, come strumento di design.

Risolto quando un enigma a due passaggi gira nel gioco e il verificatore rileva correttamente un vicolo cieco introdotto apposta.
