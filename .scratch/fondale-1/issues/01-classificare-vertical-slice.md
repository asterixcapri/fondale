# Classificare l'eredità della vertical slice

Type: grilling
Status: resolved

## Question

Quali decisioni e prototipi della precedente mappa `vertical-slice` sono
contratti generali di Fondale, quali appartengono soltanto a Capri 1535 e quali
devono essere riaperti perché erano ottimizzati per un unico gioco? La risposta
deve preservare l'evidenza già prodotta senza trasformare accidentalmente ogni
scelta del prototipo in API pubblica.

## Answer

La vertical slice è evidenza progettuale, non il contratto pubblico già pronto
di Fondale.

- Fondale conserva come capacità configurabili risoluzione logica, scaling
  intero e resa pixel art; `426×240`, palette da 64 colori e dimensioni degli
  sprite appartengono a Capri 1535.
- Regioni percorribili multiple, coordinate nello spazio della Scena,
  foreground, baseline e fermate di scala restano concetti validati. I ticket
  sul contratto pubblico, rendering e navigazione ne ridisegneranno però l'API,
  senza promuovere automaticamente gli attuali tipi TypeScript.
- L'intento del giocatore conserva la sequenza raggiungi-orientati-interagisci,
  la sostituzione dell'intento precedente e l'uso dell'inventario. HUD a scena
  intera e numero di azioni visibili sono una politica predefinita sostituibile
  dal progetto di gioco.
- Profondità, occlusione, scala prospettica, orientamento e animazione dei
  Personaggi sono capacità del motore; velocità, frame rate e valori analoghi sono
  impostazioni del gioco.
- Gli script Python per fondali e sprite restano strumenti di Capri 1535.
  Fondale definirà e validerà gli asset consumati, non il processo artistico che
  li produce.
- Il debug overlay evolve verso uno strumento pubblico per l'autore. Playwright
  resta infrastruttura interna con cui il repository verifica motore ed esempio.
- I vecchi ticket incompleti non proseguono come una seconda roadmap: il
  pathfinding confluisce in “Definire Scene, navigazione e attraversamento”;
  condizioni ed effetti nel ticket omonimo; il verificatore degli enigmi resta
  nella nebbia finché quel modello non è deciso; l'enigma di Capri confluisce
  nello scenario di accettazione finale.
