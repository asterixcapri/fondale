# Verso Fondale 1.0

Type: wayfinder:map

## Destination

Un insieme completo e coerente di decisioni di prodotto e architettura dal
quale `/to-spec` possa produrre la specifica costruibile di Fondale 1.0: un
motore web-native con cui un autore realizza e distribuisce una piccola
avventura completa senza modificare gli interni del motore. La Versione 1
stabilizza soltanto capacità esercitate dal suo Example di accettazione.

## Notes

- Consultare `/domain-modeling` per il linguaggio e `/codebase-design` per i
  confini dei moduli; usare `/prototype` quando un comportamento non può essere
  deciso affidabilmente sulla carta.
- Fondale è open source MIT, TypeScript-first e garantisce inizialmente Chrome
  desktop corrente, mouse e controlli da tastiera per HUD e dialoghi.
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
- Fondale 1.0 non dichiara, carica o riproduce audio.
- I salvataggi versionati e validati appartengono al motore; slot, UI e storage
  appartengono al `Game Project`.
- Ogni export dell'interface pubblica deve avere documentazione completa di
  scopo, uso, invarianti, default, errori ed esempio; un Author deve poter
  costruire l'Example esterno usando la documentazione pubblicata col pacchetto.
- La documentazione deve affiancare all'Example completo esempi di codice
  focalizzati sulle singole Engine Capability e sui loro casi principali;
  entrambi devono usare soltanto l'interface pubblica ed essere verificati
  automaticamente contro il pacchetto distribuito.
- Editor visuale e authoring no-code non appartengono alla direzione del
  prodotto, neppure come candidati della Versione 2.
- I candidati della Versione 2 richiedono un nuovo effort e un Example che li
  eserciti; questa mappa non ne progetta anticipatamente l'interface.
- Il lavoro della mappa produce decisioni, non implementazione.

## Decisions so far

- [Classificare l'eredità della vertical slice](issues/01-classificare-vertical-slice.md)
  — conserva come evidenza i concetti validati, ma stabilizza soltanto il loro
  sottoinsieme esercitato dall'Example e riapre le API.
- [Verificare i vincoli della piattaforma web e di PixiJS](issues/03-fatti-piattaforma-web.md)
  — WebGL è la baseline produttiva più prudente; Canvas 2D è sperimentale,
  WebGPU non è ancora interoperabile, gli asset impongono cicli asincroni e il
  pacchetto deve chiudere tipi ed entry point senza esporre PixiJS
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
  — fissa un quadro logico `pixel` senza camera e le primitive visive esercitate
  dall'Example dietro un renderer WebGL interno.
- [Definire Scene, navigazione e attraversamento](issues/06-stanze-e-navigazione.md)
  — usa geometria statica, una regione e un approccio per bersaglio con passaggi
  nominati, nascondendo pathfinding e transizioni atomiche dietro il runtime.
- [Definire interazioni, condizioni ed effetti](issues/07-interazioni-condizioni-effetti.md)
  — unifica le forme minime di azione primaria e uso dell'inventario in casi
  validabili, con fallback, operazioni atomiche e comportamenti TypeScript
  controllati.
- [Definire lo scenario di accettazione di Fondale 1.0](issues/15-scenario-accettazione.md)
  — limita la Versione 1 a un Example esterno di due Scene che esercita
  navigazione, interazione, dialogo, inventario, salvataggio e finale senza
  audio; tutto il resto richiede una nuova rotta.
- [Definire dialoghi e sequenze controllate](issues/08-dialoghi-e-sequenze.md)
  — una `Sequence` nominata compone soltanto Line manuali, Choice finite,
  diramazioni e operazioni atomiche in un'attività modale e ripristinabile.
- [Definire inventario e oggetti utilizzabili](issues/09-inventario.md)
  — riduce l'Inventory a Object collocati, posseduti o consumati, con raccolta,
  ordine di acquisizione, selezione singola e uso contestuale governati dal
  motore.
- [Definire salvataggi e caricamento versionati](issues/10-salvataggi-versionati.md)
  — uno snapshot JSON-safe dell'ultimo stato committed viene validato contro
  formato, progetto e invarianti prima di riprendere esattamente l'attività.
- [Definire il contratto degli asset visivi](issues/11-asset-e-audio.md)
  — usa PNG riferiti direttamente e mai corretti nelle dimensioni, con
  Appearance uniformi, camminata direzionale minima e caricamento atomico
  completo all'avvio.
- [Determinare le dimensioni dell'Inventory Appearance](issues/17-dimensioni-inventory-appearance.md)
  — usa una misura quadrata condivisa dal progetto, `32×32` nell'Example, e
  scala Inventory, cursore e mondo insieme verso lo schermo.
- [Definire Fondale come libreria per progetti esterni](issues/12-pacchetto-e-progetto-esterno.md)
  — distribuisce una sola interface pubblica consumabile da un Game Project
  indipendente, lasciando applicazione, asset, storage e build al consumer.
- [Definire validazione, diagnostica e documentazione pubblica](issues/13-strumenti-autore.md)
  — assegna ogni controllo al primo livello competente e rende diagnostiche,
  documentazione completa, ricette verificate ed Example vincoli di
  pubblicazione del pacchetto.
- [Definire qualità, compatibilità e accessibilità di base](issues/14-qualita-e-compatibilita.md)
  — limita la Support Baseline a Chrome desktop corrente, input realmente
  esercitati, determinismo dello stato e gate di pubblicazione non aggirabili.

## Not yet specified

- Nessuno.

## Out of scope

- Implementare il motore: dopo la mappa il lavoro passa a `/to-spec`,
  `/to-tickets` e `/implement`.
- Editor visuale e authoring no-code, permanentemente estranei alla direzione
  del prodotto.
- Audio e localizzazione nella Versione 1; restano candidati non impegnativi
  per un nuovo effort della Versione 2.
- Rendering, asset, navigazione, inventario e Sequence avanzati elencati in
  [Definire lo scenario di accettazione di Fondale
  1.0](issues/15-scenario-accettazione.md); non entrano nel contratto per
  completezza futura.
- UI, slot, storage e cloud dei salvataggi; migrazioni concrete finché non
  esistono due versioni reali del formato.
- [Definire il confine della verifica di
  risolvibilità](issues/16-verifica-risolvibilita.md) — un solver generale non
  è necessario all'Example e non può offrire garanzie complete sui
  `Game Behavior` opachi.
- API generale per plugin.
- Touch, gamepad, wrapper desktop, store e integrazioni Steam.
- Multiplayer, 3D, fisica generale, combattimento e sistemi RPG.
- Trama, Scene e produzione artistica del gioco Capri 1535 completo.
