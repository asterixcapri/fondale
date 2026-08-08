# Authoring dichiarativo con comportamenti TypeScript

Un progetto Fondale descrive stanze, attori, hotspot, dialoghi e inventario
come dati validabili e usa funzioni TypeScript soltanto per i comportamenti
specifici che i dati non esprimono bene. Abbiamo scartato sia l'ereditarietà
dalle classi interne del motore, che accoppierebbe ogni gioco
all'implementazione, sia editor visuale e authoring no-code, che non appartengono
alla direzione del prodotto: l'Author di Fondale è uno sviluppatore TypeScript e
il formato dichiarativo resta la sua interface anche nelle versioni future.
