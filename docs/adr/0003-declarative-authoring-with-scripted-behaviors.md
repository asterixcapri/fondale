# Authoring dichiarativo con comportamenti TypeScript

Un progetto Fondale descrive stanze, attori, hotspot, dialoghi e inventario
come dati validabili e usa funzioni TypeScript soltanto per i comportamenti
specifici che i dati non esprimono bene. Abbiamo scartato sia l'ereditarietà
dalle classi interne del motore, che accoppierebbe ogni gioco
all'implementazione, sia un editor visuale nella prima versione, che renderebbe
stabile troppo presto un formato di contenuto ancora da validare.
