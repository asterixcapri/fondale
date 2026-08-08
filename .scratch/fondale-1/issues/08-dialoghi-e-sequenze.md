# Definire dialoghi e sequenze controllate

Type: grilling
Status: resolved
Blocked by: 04, 07, 15

## Question

Qual è il più piccolo modello dichiarativo e strettamente sequenziale con cui
l'Example presenta una breve conversazione, una scelta finita e i relativi
cambiamenti di stato? La decisione deve coprire soltanto `Line`, `Choice`,
condizioni e `Game Operation` esercitate dallo scenario di accettazione,
mantenendo leggibile il contenuto e deterministico il runtime.

## Answer

Una `Sequence` è una definizione radice nominata del `Game Project`, dichiarata
con l'helper tipizzato pertinente e avviata attraverso una `Game Operation`.
È un copione finito, modale e strettamente sequenziale; la sua esecuzione è la
`Game Activity` dominante, non una Promise o una callback asincrona dell'Author.

La Versione 1 offre soltanto questi passi dichiarativi:

- una `Line` contiene il testo e, facoltativamente, il `Character` che parla;
  senza Character è narrazione. Resta visibile finché il Player la avanza;
- una `Choice` presenta nell'ordine dichiarato tutte le alternative le cui
  condizioni sono vere nello snapshot committed. Le alternative non eleggibili
  restano nascoste e un fallback obbligatorio viene mostrato soltanto quando
  nessun'altra alternativa è disponibile;
- una diramazione condizionale sceglie il primo caso eleggibile e richiede un
  fallback, riusando le `Interaction Condition` della Versione 1;
- un passo di operazioni richiede un gruppo ordinato di `Game Operation`,
  applicato atomicamente secondo il contratto del runtime.

Ogni alternativa o diramazione prosegue con una lista finita di passi. Non può
tornare a un passo precedente, richiamare un'altra Sequence o creare cicli. I
riferimenti, i fallback e la finitezza strutturale vengono verificati da
`defineGame`.

Durante l'esecuzione Fondale accetta soltanto l'avanzamento della Line o la
selezione richiesta dalla Choice. Gli altri `Player Intent` vengono scartati,
non accodati; tentare di avviare esternamente un'altra Sequence è un'operazione
invalida. Ogni gruppo di operazioni produce il proprio commit: la Sequence
intera non è una transazione e le modifiche già committed non vengono annullate
se un passo successivo fallisce.

Il `Game State` conserva l'identità della Sequence, il percorso strutturale del
passo corrente e l'eventuale Choice attiva. Un salvataggio può quindi riprendere
esattamente la stessa Line o Choice senza rieseguire operazioni già committed.
Al termine la Game Activity si chiude e il controllo torna al Player; `stop()`
o il fallimento della `Game Session` sono le sole interruzioni forzate.

Movimento di Character, attese, Line temporizzate, pensieri distinti, skip
completo, cicli di dialogo, Sequence annidate, cambio di Scene e `Game Behavior`
come passo non appartengono alla Versione 1. Audio e localizzazione restano
candidati di un effort successivo.
