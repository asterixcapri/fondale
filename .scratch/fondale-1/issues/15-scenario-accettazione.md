# Definire lo scenario di accettazione di Fondale 1.0

Type: grilling
Status: resolved
Blocked by: 06, 07

## Question

Qual è il più piccolo Example completo che esercita una volta ogni capacità di
Fondale 1.0 e raggiunge uno stato finale verificabile? La risposta deve fissare
il perimetro della Versione 1 rispetto ai candidati della Versione 2 e usare
l'Example come prova del contratto pubblico, non come pretesto per progettare
capacità che non esercita.

## Answer

Fondale 1.0 stabilizza soltanto il contratto esercitato dal più piccolo Example
capace di dimostrare una breve avventura completa. Una capacità non usata
dall'Example non entra nella Versione 1 per completezza futura.

### Example di accettazione

Un progetto TypeScript esterno installa `@asterixcapri/fondale`, avvia una nuova
partita e permette al Player di:

1. esplorare due `Scene` collegate da un `Scene Passage`;
2. muovere un `Character` in una `Walkable Region`, con profondità e
   `Perspective Scale` percepibili rispetto a una `Scenery`;
3. raggiungere un `Hotspot` attraverso il suo unico `Approach Point` ed eseguire
   una `Primary Action`;
4. parlare con un `Character` attraverso una `Sequence` finita composta da
   `Line`, una `Choice`, condizioni e `Game Operation`;
5. raccogliere un `Object`, selezionarlo nell'inventario e usarlo su un
   bersaglio; un esito invalido conserva la selezione, quello valido cambia una
   `Game Variable` booleana, consuma o ricolloca l'Object e rende disponibile il
   passaggio finale;
6. esercitare un piccolo `Game Behavior` sincrono attraverso lo stesso contesto
   ristretto delle operazioni dichiarative;
7. esportare un salvataggio durante la `Choice`, arrestare la sessione,
   ripristinare lo snapshot validato e ritrovare esattamente la stessa attività
   dominante;
8. attraversare il passaggio e raggiungere uno stato finale osservabile.

La fixture esterna deve avviarsi in sviluppo e produrre una build statica. Un
test Playwright percorre nuova partita, navigazione, conversazione, inventario,
salvataggio, ripristino e finale usando la sola interface pubblica.

### Contratto della Versione 1

- Authoring dichiarativo TypeScript tramite `defineGame` e helper effettivamente
  usati dall'Example; `GameProject` opaco, immutabile e validato; `startGame`
  avvia una nuova partita o uno snapshot validato.
- Renderer WebGL interno con profilo `pixel`, una `Logical Resolution`, quadro
  fisso, `Background`, `Scenery`, `Character`, `Object`, ordinamento tramite
  `Ground Point` o `Baseline`, animazione basilare del Character e asset visivi
  caricati all'avvio.
- Una `Walkable Region` per `Scene`, geometria statica, un `Approach Point` per
  bersaglio, pathfinding interno, `Scene Entrance` e `Scene Passage` direzionali.
- `Primary Action`, `Inventory Use`, condizioni e operazioni minime richieste
  dallo scenario, fallback percepibile, variabili booleane e un `Game Behavior`
  deterministico e controllato.
- Inventario minimo: raccolta, elenco degli Object posseduti, selezione,
  deselezione, uso sul bersaglio e consumo o ricollocazione.
- `Sequence` nominata, finita, modale e strettamente sequenziale; `Line` manuali
  con Character facoltativo, `Choice` con alternative eleggibili e fallback,
  condizioni e `Game Operation`. Alla fine il controllo torna al Player.
- Snapshot JSON-safe creato soltanto da stato committed, con identità del
  progetto e versione del formato, validazione, ripresa esatta e rifiuto
  comprensibile di dati corrotti o incompatibili. Storage, slot e UI restano al
  Game Project.
- Chrome desktop corrente come browser garantito, mouse per il mondo, tastiera
  per HUD e dialoghi, build e test Playwright del percorso completo.

Fondale 1.0 non dichiara, carica o riproduce audio.

### Candidati della Versione 2

Audio; localizzazione; profilo `smooth`, camera, animazioni e caricamento asset
avanzati; regioni percorribili multiple, ostacoli dinamici, approcci multipli e
bersagli mobili; combinazione e quantità di Object; Line temporizzate, movimento
e attese narrative, skip completo, cicli e composizione fra Sequence; tipi di
Game Variable e condizioni ulteriori; migrazioni quando esisteranno davvero
più versioni; supporto browser e accessibilità più ampi; CLI e strumenti tecnici
pubblici.

Questi candidati non sono promesse della Versione 2: richiederanno un nuovo
effort Wayfinder e un Example che li eserciti.

### Fuori dalla direzione del prodotto

Editor visuale e authoring no-code non interessano al prodotto e non sono
candidati futuri. Restano inoltre fuori da questa rotta plugin generici,
verificatore generale di risolvibilità, multiplayer, 3D, fisica generale,
combattimento, sistemi RPG e produzione del gioco Capri 1535 completo.
