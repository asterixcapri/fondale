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
- Ubiquitous language, codice, commenti nel codice e interface pubbliche sono
  in inglese; ticket e discussioni di pianificazione possono restare in
  italiano.
- `examples/capri-1535` è la vertical slice di riferimento, non il gioco
  completo.
- Il lavoro della mappa produce decisioni, non implementazione.

## Decisions so far

- [Classificare l'eredità della vertical slice](issues/01-classificare-vertical-slice.md)
  — conserva i concetti già validati come capacità configurabili, ma riapre le
  API e separa valori, pipeline artistiche e contenuti specifici di Capri.
- [Verificare i vincoli della piattaforma web e di PixiJS](issues/03-fatti-piattaforma-web.md)
  — WebGL è la baseline produttiva più prudente; Canvas 2D è sperimentale,
  WebGPU non è ancora interoperabile, audio e asset impongono cicli asincroni e
  il pacchetto deve chiudere tipi ed entry point senza esporre PixiJS
  ([ricerca](research/fatti-piattaforma-web-pixijs-8.md)).
- [Definire il contratto pubblico di un progetto di gioco](issues/02-contratto-progetto.md)
  — helper tipizzati compongono registri di dominio in un `GameProject`
  immutabile; callback locali usano operazioni controllate e l'avvio esplicito
  supporta nuova partita o ripristino senza esporre gli interni del motore.
- [Definire il ciclo del runtime e la proprietà dello stato](issues/04-ciclo-runtime-e-stato.md)
  — una `Game Session` isolata evolve il proprio `Game State` con operazioni
  atomiche e clock fisso, separando il core deterministico dagli adapter di
  browser e test e rendendo transazionali lifecycle e cambi di `Scene`.
- [Definire il contratto di rendering e dello spazio di scena](issues/05-contratto-rendering.md)
  — fissa uno spazio logico per progetto e un quadro senza camera, componendo
  primitive dichiarative per profondità e prospettiva dietro un renderer WebGL
  interno.

## Not yet specified

- Se un verificatore generale della risolvibilità degli enigmi appartenga a
  Fondale oppure resti uno strumento specifico dei giochi; dipende dal modello
  di stato, condizioni ed effetti.
- Il livello di supporto alla localizzazione oltre alla separazione basilare
  dei testi; dipende dal contratto di dialoghi e contenuti.

## Out of scope

- Implementare il motore: dopo la mappa il lavoro passa a `/to-spec`,
  `/to-tickets` e `/implement`.
- Editor visuale e authoring no-code.
- API generale per plugin.
- Touch, gamepad, wrapper desktop, store e integrazioni Steam.
- Multiplayer, 3D, fisica generale, combattimento e sistemi RPG.
- Trama, Scene e produzione artistica del gioco Capri 1535 completo.
