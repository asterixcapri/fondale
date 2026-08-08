# Verso Fondale 1.0

Type: wayfinder:map

## Destination

Un insieme completo e coerente di decisioni di prodotto e architettura dal
quale `/to-spec` possa produrre la specifica costruibile di Fondale 1.0: un
motore web-native con cui un autore realizza e distribuisce una piccola
avventura completa senza modificare gli interni del motore.

## Notes

- Consultare `/domain-modeling` per il linguaggio e `/codebase-design` per i
  confini dei moduli; usare `/prototype` quando un comportamento non può essere
  deciso affidabilmente sulla carta.
- Fondale è open source MIT, TypeScript-first e destinato inizialmente ai
  browser desktop moderni con mouse e tastiera.
- L'authoring è dichiarativo, con comportamenti TypeScript mirati; non richiede
  PixiJS né ereditarietà dagli interni del motore.
- PixiJS può restare il renderer interno, ma non appartiene al contratto
  pubblico.
- Il pacchetto previsto è `@asterixcapri/fondale`; giochi in repository esterni
  devono poterlo consumare.
- `examples/capri-1535` è la vertical slice di riferimento, non il gioco
  completo.
- Il lavoro della mappa produce decisioni, non implementazione.

## Decisions so far

<!-- Vuoto durante il charting; ogni decisione sarà indicizzata quando il suo ticket viene risolto. -->

## Not yet specified

- Se un verificatore generale della risolvibilità degli enigmi appartenga a
  Fondale oppure resti uno strumento specifico dei giochi; dipende dal modello
  di stato, condizioni ed effetti.
- Il livello di supporto alla localizzazione oltre alla separazione basilare
  dei testi; dipende dal contratto di dialoghi e contenuti.
- Se il runtime 1.0 debba supportare più risoluzioni logiche o una camera oltre
  la singola scena classica; dipende dal contratto di rendering.
- La divisione precisa fra CLI, validazione in build e strumenti diagnostici in
  scena; dipende dal contratto pubblico di authoring.

## Out of scope

- Implementare il motore: dopo la mappa il lavoro passa a `/to-spec`,
  `/to-tickets` e `/implement`.
- Editor visuale e authoring no-code.
- API generale per plugin.
- Touch, gamepad, wrapper desktop, store e integrazioni Steam.
- Multiplayer, 3D, fisica generale, combattimento e sistemi RPG.
- Trama, stanze e produzione artistica del gioco Capri 1535 completo.
