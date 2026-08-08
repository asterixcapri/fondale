# Definire validazione, diagnostica e documentazione pubblica

Type: grilling
Status: resolved
Blocked by: 02, 06, 07, 08, 09, 10, 11, 12, 15

## Question

Quali errori richiesti dall'Example rilevano gli helper, `defineGame` e
`startGame`, quale contesto minimo rende comprensibile ogni diagnostica e quale
documentazione accompagna l'intera interface pubblica? La decisione deve
richiedere per ogni export scopo, uso, invarianti, default, errori ed esempio,
oltre a una guida iniziale e ai concetti necessari per costruire il progetto
esterno. Deve affiancare al gioco completo esempi focalizzati e verificabili per
le singole Engine Capability e per i casi principali di Scene, Appearance,
navigazione, interazione, Sequence, Inventory, salvataggio, ripristino e Game
Behavior, mostrando come comporli attraverso la sola interface pubblica. Deve
inoltre stabilire come verificarne completezza e correttezza contro il pacchetto
distribuito, senza introdurre CLI, inspector, dashboard, editor visuale o altri
strumenti pubblici non esercitati dall'Example.

## Comments

### Grilling — primo round

L'Author conferma che:

- ogni errore viene rilevato al primo livello che possiede il contesto
  sufficiente; gli helper validano localmente, `defineGame` valida l'insieme e
  `startGame` riserva i controlli dipendenti da asset e browser;
- una diagnostica espone categoria stabile, percorso preciso, spiegazione e,
  quando utile, una correzione suggerita;
- ogni livello raccoglie tutti gli errori indipendenti in ordine stabile e
  sopprime quelli meramente conseguenti;
- la documentazione separa avvio rapido, concetti, esempi focalizzati e
  riferimento, mentre l'Example prova la composizione completa;
- la pubblicazione richiede copertura di ogni export pubblico, verifica degli
  esempi contro il pacchetto distribuito e percorso automatico dell'Example.

### Grilling — secondo round

L'Author conferma che:

- la validazione di un dato di salvataggio restituisce un esito esplicito,
  perché un dato esterno invalido è prevedibile e non un errore di
  programmazione;
- ogni regola violata possiede un codice stabile, raggruppato nelle famiglie
  definizione, riferimento, stato o salvataggio, asset, ambiente e
  `Game Behavior`;
- Fondale 1.0 non emette warning: rifiuta ciò che può dimostrare invalido e
  accetta ciò che è soltanto insolito;
- gli esempi focalizzati sono ricette minime e complete, verificate senza
  diventare Game Project autonomi; l'Example resta la composizione completa;
- la documentazione descrive soltanto il contratto pubblico, senza richiedere
  conoscenza di renderer, algoritmi o organizzazione interna.

### Grilling — terzo round

L'Author conferma che:

- la validazione rifiuta soltanto invalidità dimostrabili, non contenuti
  insoliti, apparentemente inutilizzati o una possibile irrisolvibilità globale;
- la documentazione copre export, strutture annidate, valori, default,
  invarianti, codici diagnostici e modalità di fallimento;
- il riferimento pubblico nasce accanto all'interface che descrive, mentre
  guide e spiegazioni non ne duplicano il contratto;
- ogni ricetta documentata deriva da sorgenti realmente compilati e verificati
  contro il pacchetto distribuito.

## Answer

Fondale 1.0 tratta la validazione come parte dell'interface pubblica di
authoring, non come uno strumento accessorio. Ogni problema dimostrabile viene
rilevato dal primo livello che possiede il contesto sufficiente; nessun livello
rimanda controlli che può concludere autonomamente.

### Responsabilità dei livelli

- Un helper di definizione verifica completamente la propria definizione:
  forma, valori richiesti, intervalli e geometrie locali, ordine e fallback
  locali, metadati degli Appearance e ogni altra invariante che non richiede
  registri esterni. Se la definizione è invalida, l'helper lancia un unico
  errore contenente tutte le diagnostiche locali indipendenti.
- `defineGame` verifica il progetto composto: chiavi e riferimenti fra registri,
  collocazioni e stato iniziale, passaggi ed entrate, condizioni, operazioni,
  fallback, finitezza delle Sequence, casi certamente irraggiungibili e
  coerenza delle impostazioni condivise. Restituisce un `GameProject` soltanto
  quando l'intero insieme è valido; altrimenti lancia un unico errore con tutte
  le diagnostiche indipendenti.
- La validazione di un dato di salvataggio considera l'input `unknown` e
  restituisce un esito esplicito di successo o fallimento. Controlla forma JSON,
  campi inattesi, versioni, Project Identity, riferimenti e invarianti del Game
  State e dell'eventuale Game Activity. Un dato esterno corrotto o incompatibile
  non è un'eccezione di programmazione e non viene riparato né trasformato
  silenziosamente in una nuova partita.
- `startGame` conserva soltanto i controlli che richiedono il browser: target
  DOM valido e libero, disponibilità dell'ambiente WebGL, raggiungibilità e
  decodifica dei PNG, dimensioni reali, coerenza delle strisce animate e limiti
  effettivi del dispositivo. Raccoglie tutti i fallimenti indipendenti
  conoscibili nello stesso tentativo, ripulisce ogni montaggio parziale e
  rigetta la Promise senza creare una Game Session.
- Un `Game Behavior` resta opaco alla validazione anticipata. Se lancia o
  richiede una Game Operation invalida, il gruppo non produce commit, la
  sessione entra in `failed` e la diagnostica conserva il percorso del
  comportamento e la causa originale disponibile.

Fondale rifiuta soltanto ciò che può dimostrare invalido. Contenuto insolito,
Scene apparentemente inutilizzate, scelte narrative sospette e risolvibilità
globale non producono errori o warning. Fondale 1.0 non emette warning: una
segnalazione è sempre un'invalidità azionabile.

### Contratto delle diagnostiche

Ogni `Authoring Diagnostic` contiene almeno:

- un codice stabile per la regola violata e una famiglia stabile fra
  definizione, riferimento, stato o salvataggio, asset, ambiente e
  `Game Behavior`;
- un percorso stabile fino alla parte del Game Project interessata, basato sui
  nomi autoriali e sui campi pubblici; per un asset include anche il relativo
  URL;
- una spiegazione comprensibile del problema;
- una correzione suggerita quando Fondale può indicarne una senza indovinare
  l'intenzione dell'Author;
- la causa originale quando proviene dal browser o da un `Game Behavior` ed è
  disponibile.

Codici, famiglie e semantica del percorso appartengono al contratto pubblico;
la formulazione del testo può migliorare senza costituire una rottura. Le
diagnostiche vengono ordinate stabilmente. Fondale raccoglie i problemi
indipendenti ma sopprime quelli puramente conseguenti, così un riferimento
mancante non genera una cascata di errori fittizi.

### Documentazione pubblica

La documentazione distribuita e versionata con il pacchetto offre quattro
percorsi distinti:

1. un avvio rapido che porta un Author da un progetto TypeScript esterno alla
   prima Scene eseguibile;
2. una guida concettuale a Engine, Game Project, Game Definition, Game
   Behavior, Game Session, Game State, Scene Space, Game Activity, salvataggio
   e diagnostica;
3. ricette focalizzate per i casi principali di Scene, Appearance statici e
   camminata, navigazione, Interaction, condizioni e operazioni, Sequence,
   Inventory, creazione-validazione-ripristino dei salvataggi e Game Behavior;
4. il riferimento completo dell'intera interface pubblica.

Per ogni export e per ogni struttura pubblica annidata, il riferimento dichiara
scopo, uso, valori ammessi, invarianti, default, errori e almeno un esempio.
Documenta inoltre codici diagnostici, ordine degli eventi e modalità di
fallimento. Il riferimento nasce accanto all'interface che descrive; guide e
ricette lo collegano senza ricopiarlo come una seconda fonte di verità.

Le ricette mostrano una sola idea con il minimo contesto completo e provengono
da sorgenti compilati e verificati, anche quando la pagina ne presenta soltanto
la parte rilevante. Non diventano piccoli Game Project autonomi. L'Example
esterno Capri 1535 resta la dimostrazione completa di come le capacità si
compongono usando soltanto l'interface pubblica.

La documentazione parla esclusivamente attraverso il linguaggio e le garanzie
pubbliche. Può spiegare comportamento, ordine, limiti ed errori, ma non richiede
conoscenza di PixiJS, algoritmi o organizzazione interna.

### Verifica e pubblicazione

La pubblicazione è bloccata se una delle seguenti prove fallisce:

- ogni export e ogni parte annidata dell'interface pubblica deve risultare nel
  riferimento con tutti i contenuti obbligatori; non sono ammessi simboli
  pubblici non documentati;
- le ricette sono compilate e, quando mostrano comportamento, verificate
  automaticamente contro il pacchetto realmente distribuito, non tramite
  import interni al repository;
- l'Example esterno installa quello stesso pacchetto, produce la propria build
  e supera il percorso Playwright di accettazione;
- collegamenti e riferimenti fra guida, ricette, diagnostiche ed Example non
  possono puntare a contenuti mancanti.

Questa decisione non introduce CLI, inspector, dashboard, editor, warning,
analisi generale di risolvibilità o altri strumenti pubblici non esercitati
dall'Example.
