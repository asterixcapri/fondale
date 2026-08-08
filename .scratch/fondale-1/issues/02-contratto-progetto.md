# Definire il contratto pubblico di un progetto di gioco

Type: grilling
Status: resolved
Blocked by: 01

## Question

Qual è la più piccola interfaccia pubblica con cui un autore dichiara un gioco,
ne compone Scene, Personaggi, Oggetti ed elementi locali, aggiunge
comportamenti TypeScript e avvia Fondale? La decisione deve separare dati
serializzabili, callback e servizi del motore, stabilendo anche quali import
sono pubblici e quali interni.

## Answer

Il contratto pubblico è un piccolo insieme di helper di authoring composto da
`defineGame` e `startGame` attraverso il solo entry point
`@asterixcapri/fondale`.

- Gli helper `defineScene`, `defineCharacter`, `defineObject` e gli equivalenti
  che emergeranno per altre definizioni radice forniscono inferenza dei tipi,
  default e validazione locale. `Scenery` e `Hotspot` restano oggetti inline
  nella `Scene` che li possiede.
- `defineGame` compone registri nominati di `Scene`, `Character`, `Object` e
  altre definizioni radice. La chiave del registro è l'identità, quindi non si
  ripete un campo `id` e l'ordine non ha semantica. Una `Scene` possiede soltanto
  i suoi elementi locali; `Character` e `Object` hanno identità autonoma e
  dichiarano una posizione iniziale. Un `Object` è per definizione
  raccoglibile.
- I comportamenti TypeScript sono dichiarati direttamente sull'elemento a cui
  appartengono, per mantenere locality. I campi dati restano distinguibili e
  serializzabili; le callback stanno in campi dedicati e ricevono soltanto un
  contesto temporaneo di letture e operazioni controllate. Non accedono allo
  stato mutabile, al DOM, a PixiJS o ad altri interni del motore.
- L'autore non assembla `systems`: movimento, interazioni, inventario, dialoghi
  e le altre capacità previste appartengono al motore. Un progetto può
  adattarle attraverso Impostazioni di gioco, non sostituirle tramite plugin.
- Gli helper verificano immediatamente le singole definizioni; `defineGame`
  verifica struttura e riferimenti complessivi anche a runtime, oltre agli
  errori rilevabili da TypeScript. Restituisce un `GameProject` opaco,
  immutabile e già validato. Errori che richiedono browser o asset appartengono
  invece all'avvio asincrono.
- Il `GameProject` contiene lo stato iniziale canonico di una nuova partita.
  `startGame(project, { target })` monta il gioco nell'`HTMLElement` fornito;
  può ricevere in alternativa un salvataggio opaco e validato da Fondale, e
  restituisce una sessione arrestabile con `stop()`.
- Tutti i simboli autoriali provengono dalla radice
  `@asterixcapri/fondale`. Import profondi, renderer, stato interno e tipi
  PixiJS non sono parte del contratto pubblico.

Le forme precise delle definizioni, delle operazioni disponibili alle
callback, dello stato iniziale e del salvataggio restano ai ticket di dominio
che dipendono da questa decisione; non possono però allargare le seam stabilite
qui.
