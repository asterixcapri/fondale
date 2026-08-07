# 06 — Il motore di rendering

Type: prototype
Status: open
Blocked by: 02, 03

## Question

Il nucleo grafico: fondale a 426x240 ingrandito con nearest-neighbour a schermo intero, sprite del personaggio composito, ordinamento in profondità, scaling per posizione verticale, maschere di foreground.

Da stabilire lavorando:

- il personaggio si scala a passi interi o continui? Lo scaling non intero su pixel art produce artefatti; Thimbleweed Park ha risolto in qualche modo e vale la pena capire come.
- il movimento fisico è fluido mentre l'animazione gira a 8-10 fps, come da documento: verificare che dia davvero il carattere anni '90 e non sembri a scatti.
- gestione del ridimensionamento della finestra e dei rapporti d'aspetto non 16:9.

Risolto quando Michele attraversa il vicolo scalando correttamente e passando dietro agli elementi giusti.
