# Definire interazioni, condizioni ed effetti

Type: grilling
Status: resolved
Blocked by: 01, 02, 04

## Question

Come esprime un progetto di gioco hotspot, azioni primarie, uso di inventario,
precondizioni, risposte ed effetti sul mondo; quali parti restano dati
validabili e quando entra un comportamento TypeScript? La decisione deve
preservare il contratto contestuale già scelto senza codificare gli enigmi di
Capri nel motore.

## Answer

Fondale risolve `Primary Action` e `Inventory Use` attraverso lo stesso
modello di `Interaction`, mantenendo però distinte e leggibili le due forme
nell'authoring. Ogni `Hotspot` dichiara casi condizionali ordinati e una
`Interaction Response`; il primo caso applicabile vince e un fallback garantisce
sempre un esito percepibile.

### Hotspot e azioni

- Un `Hotspot` resta una superficie senza identità, locale alla `Scene`, che
  può rendere interattivi sfondo, `Scenery`, `Character` e `Object` presenti.
  Una `Interaction Condition` separata ne controlla l'attivazione: quando è
  inattivo non riceve input e non viene rivelato dall'HUD.
- Geometria e `Approach Point` sono assoluti nello `Scene Space` per bersagli
  fissi e relativi al `Ground Point` per bersagli mobili; Fondale applica
  posizione, orientamento e `Perspective Scale` senza esporre il renderer.
- La `Primary Action` ha casi ordinati e un fallback locale obbligatorio. Ogni
  caso può sostituire l'etichetta mostrata dall'HUD, consentendo azioni come
  `Open` e `Close` sullo stesso bersaglio.
- Gli usi di inventario sono indicizzati dall'identità dell'`Object`. Ogni
  combinazione può avere casi ordinati; un fallback locale facoltativo precede
  il fallback obbligatorio del `Game Project` per gli usi non riconosciuti.

### Condizioni e stato autoriale

- Le condizioni comuni sono dati validabili: compositori `all`, `any` e `not`
  combinano predicati tipizzati su `Scene`, collocazione o possesso di un
  `Object`, stato di un `Navigation Obstacle` e `Game Variable`.
- Il `Game Project` dichiara un registro nominato di `Game Variable`. Il valore
  iniziale, limitato a booleano, stringa o numero finito, ne fissa il tipo; le
  variabili appartengono al `Game State` e quindi ai salvataggi. Non duplicano
  fatti già rappresentati da una `Engine Capability`.
- Non esistono accessi tramite percorsi arbitrari nello stato. Una condizione
  eccezionale può essere un predicato TypeScript sincrono e di sola lettura,
  valutato attraverso un contesto temporaneo controllato.

### Risoluzione e movimento

Il `Player Intent` conserva il bersaglio semantico e l'eventuale `Object`
selezionato, non la risposta osservata al click. Per un bersaglio mobile il
motore rivaluta deterministicamente gli approcci e ricalcola il percorso quando
necessario. Soltanto dopo l'arrivo e l'orientamento rivaluta i casi sull'ultimo
snapshot committed.

Se il bersaglio diventa inattivo, lascia la `Scene` o non è più raggiungibile,
l'intento termina con un esito normale senza eseguire l'interazione. La
selezione dell'inventario resta attiva. Più in generale ogni `Inventory Use`
dichiara esplicitamente successo o fallimento, indipendentemente dalle
operazioni richieste: soltanto il successo termina la selezione, mentre
entrambi gli esiti possono produrre risposta e modifiche al mondo.

### Operazioni e comportamento TypeScript

- Le operazioni dichiarative coprono l'aggiornamento delle `Game Variable`, il
  cambiamento di collocazione degli `Object`, l'attivazione dei
  `Navigation Obstacle` e l'avvio di `Game Activity` nominate. I ticket su
  inventario, dialoghi e sequenze ne preciseranno le forme specifiche.
- Non sono ammesse scritture generiche nello stato, nuovi tipi di operazione
  definiti dal gioco o transizioni che aggirano un `Scene Passage`.
- Ogni caso sceglie una sola modalità: una lista di operazioni dichiarative
  oppure un `Game Behavior`. Il comportamento può leggere soltanto fatti di
  dominio committed, bersaglio e oggetto selezionato e può richiedere le stesse
  operazioni controllate. Non riceve lo snapshot grezzo, attività interne,
  input, renderer o lifecycle della sessione.
- I `Game Behavior` sono deterministici per contratto: niente Promise, timer,
  casualità globale, rete o stato esterno mutabile. Fondale 1.0 non tenta di
  isolarli in una sandbox; contesto ristretto, diagnostica e test rendono
  verificabile il contratto.

Le operazioni vengono validate e applicate in ordine a uno stato transazionale
provvisorio, nel quale ciascuna vede il risultato delle precedenti. Un solo
commit le rende visibili; soltanto dopo parte l'eventuale risposta percepibile
o `Game Activity`. Un'operazione invalida o una callback che lancia scarta
l'intero gruppo e segue la politica d'errore della `Game Session`, senza
provare un altro caso o il fallback. I cambiamenti distribuiti nel tempo
appartengono invece a una sequenza controllata.

### Validazione e riuso

Gli helper locali e `defineGame` verificano tipi, riferimenti, fallback,
operazioni e casi staticamente irraggiungibili, come un caso posto dopo uno
incondizionato. Condizioni sovrapposte restano valide perché l'ordine ha
semantica. Il contenuto delle callback è opaco all'analisi statica e viene
verificato attraverso il contesto controllato e i test.

L'autore riusa condizioni, risposte e comportamenti con normale composizione
TypeScript — costanti, funzioni e factory tipizzate — mentre le definizioni
finali restano sul `Hotspot` pertinente. Il motore non introduce registri di
regole, ereditarietà o una nuova seam per plugin.

## Scope amendment for Fondale 1.0

Condizioni, operazioni, `Game Variable` e fallback pubblici si limitano alle
forme esercitate da [Definire lo scenario di accettazione di Fondale
1.0](15-scenario-accettazione.md). Etichette dinamiche, ostacoli di navigazione,
predicati generali e fallback locali aggiuntivi restano candidati della
Versione 2; ogni risposta della Versione 1 è testuale o visiva, non audio.
