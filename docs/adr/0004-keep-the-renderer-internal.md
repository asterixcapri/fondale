# Renderer confinato agli interni del motore

Fondale può continuare a usare PixiJS per il rendering, ma i progetti di gioco
non manipolano direttamente i suoi oggetti. Esporre soltanto concetti di
Fondale mantiene coerente l'authoring, rende testabile il contratto pubblico e
consente di sostituire o aggiornare il renderer senza riscrivere i giochi.
