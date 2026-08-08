# 06 — Il motore di rendering

Type: prototype
Status: resolved
Blocked by: 02, 03

## Question

Il nucleo grafico: fondale a 426x240 ingrandito con nearest-neighbour a schermo intero, sprite del personaggio composito, ordinamento in profondità, scaling per posizione verticale, maschere di foreground.

Da stabilire lavorando:

- il personaggio si scala a passi interi o continui? Lo scaling non intero su pixel art produce artefatti; Thimbleweed Park ha risolto in qualche modo e vale la pena capire come.
- il movimento fisico è fluido mentre l'animazione gira a 8-10 fps, come da documento: verificare che dia davvero il carattere anni '90 e non sembri a scatti.
- gestione del ridimensionamento della finestra e dei rapporti d'aspetto non 16:9.

Risolto quando Michele attraversa il vicolo scalando correttamente e passando dietro agli elementi giusti.

## Answer

Status: resolved

Il nucleo grafico gira nel browser a **426x240** e viene ingrandito alla
massima scala intera che entra nella finestra, con letterbox sullo spazio
residuo. Texture e fondale usano nearest-neighbour; anche posizione e origine
della scena vengono arrotondate a pixel interi, quindi il ridimensionamento non
reintroduce bordi interpolati o shimmering.

Michele si muove in modo continuo sul ticker mentre il ciclo di camminata resta
a **10 fps**. La velocità fisica diminuisce con la scala del personaggio, così
la traversata in fondo al vicolo non sembra più veloce di quella in primo
piano. La scala è interpolata continuamente tra le fermate della stanza: nel
vicolo passa dal 55% presso l'arco al 100% sul bordo inferiore.

L'ordinamento in profondità non contiene confronti speciali: il personaggio
porta come `zIndex` la coordinata dei piedi e ogni elemento di foreground porta
la propria baseline. La giara è ritagliata dal fondale attraverso il suo
poligono e ridisegnata nello stesso contenitore ordinato; Michele passa quindi
dietro a `y=184` e davanti a `y=196`, come mostrano gli screenshot del banco di
verifica.

Verifica conclusiva:

- `npm run build`: riuscito;
- `npm run verify`: 4 test su 4;
- screenshot esaminati per scala vicino/lontano, davanti/dietro la giara e
  overlay di allestimento;
- nessun errore di console o risorsa mancante.

Il banco ora usa il canale Playwright `chrome`, non un percorso assoluto legato
a una specifica immagine del container.

Il calcolo di percorsi che aggirano spigoli resta al ticket 07. Le viste
frontale e posteriore mancanti dello sprite restano il debito già dichiarato
nel ticket 01: non cambiano il funzionamento del renderer.
