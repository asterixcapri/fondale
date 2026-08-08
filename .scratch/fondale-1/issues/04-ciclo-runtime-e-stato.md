# Definire il ciclo del runtime e la proprietà dello stato

Type: grilling
Status: resolved
Blocked by: 01, 02

## Question

Chi crea, possiede e modifica lo stato di una partita; quali fasi attraversa il
runtime dall'avvio al cambio di `Scene`; e come interagiscono input, movimento,
interazioni, sequenze e rendering senza esporre l'implementazione? La decisione
deve fornire un modello deterministico e testabile su cui poggino gli altri
comportamenti del motore.

## Answer

Ogni `Game Session` è l'unica autorità sul proprio `Game State`; renderer,
input e pathfinding non possiedono copie concorrenti dello stato
canonico.

- Il `GameProject` è immutabile e contiene definizioni e stato iniziale.
  `await startGame(...)` crea per ogni invocazione un `Game State` indipendente
  dallo stato iniziale o da un salvataggio validato e restituisce la
  `Game Session` soltanto quando la prima `Scene` è pronta e la sessione è
  `running`. Un errore durante l'avvio rigetta la Promise. Più sessioni dello
  stesso progetto possono convivere su target DOM distinti; un target già
  occupato viene rifiutato.
- Appartiene al `Game State` ogni fatto necessario affinché `GameProject`, stato
  corrente, input futuri e passi temporali uguali producano la stessa
  evoluzione: `Scene` corrente, stato logico delle `Scenery`, posizioni e stato
  logico di `Character` e `Object`, selezioni persistenti degli `Appearance`,
  inventario, selezione, variabili del gioco e progresso della `Game Activity`
  dominante. Definizioni, asset caricati, geometrie derivate, input non ancora
  elaborati, oggetti PixiJS e interpolazione visiva restano fuori.
- Input, callback e clock logico producono `Game Operation`. Il core della
  sessione le valida, serializza e applica come transizioni atomiche dallo stato
  committed precedente al successivo, insieme agli effetti da realizzare. Un
  errore non produce commit parziali; lo snapshot corrente, non un event log, è
  la fonte di verità.
- I `Game Behavior` sono callback sincrone. Ricevono un contesto temporaneo di
  letture e operazioni controllate, e le operazioni richieste vengono applicate
  atomicamente dopo il ritorno. Promise, timer, accesso al browser e side effect
  arbitrari non fanno parte del loro contratto; movimento, attese, dialoghi e
  sequenze diventano `Game Activity` controllate dal motore.

Il tempo della simulazione avanza a passi fissi. A parità di `GameProject`,
`Game State`, input ordinati e passi del clock, il core produce gli stessi stati
committed ed effetti indipendentemente dal frame rate. Una scheda sospesa
riprende dal passo successivo senza recuperare in blocco il tempo reale
trascorso.

Ogni passo segue quest'ordine:

1. acquisisce gli input arrivati prima del passo;
2. li traduce in `Game Operation` secondo la politica dell'attività dominante;
3. avanza una volta la `Game Activity` corrente;
4. applica in ordine causale le operazioni prodotte;
5. pubblica uno snapshot committed;
6. lascia a rendering e animazioni ambientali la realizzazione degli
   effetti, senza permettere loro di modificare il `Game State`.

Gli input arrivati durante un passo attendono quello successivo. Esiste al
massimo una `Game Activity` dominante: un nuovo `Player Intent` sostituisce
quello in corso, mentre una sequenza controllata governa temporaneamente input
e avanzamento. Attività puramente visive possono procedere in parallelo
perché non sono fonti di verità.

Il lifecycle interno della `Game Session` comprende `starting`, `running`,
`transitioning`, `stopped` e `failed`:

- un cambio di `Scene` è una `Game Activity` dominante e transazionale. La
  vecchia `Scene` resta canonica e l'input è sospeso mentre la destinazione viene
  preparata; un solo commit conclude le attività locali, aggiorna `Scene` e
  posizione e pubblica il nuovo snapshot;
- un errore prima del commit conserva lo stato precedente per la diagnostica e
  porta la sessione in `failed`;
- `stop()` è idempotente e terminale: interrompe clock e attività, scollega
  input e renderer e rilascia le risorse. Una nuova partita richiede una
  nuova chiamata a `startGame`.

Precondizioni non soddisfatte e usi errati di un `Object` sono esiti normali del
gioco. Definizioni invalide sono errori di authoring rilevati prima
dell'esecuzione; callback che lanciano, operazioni invalide ed errori
infrastrutturali non recuperabili impediscono il commit e portano una sessione
già avviata in `failed`, con diagnostica contestuale.

La seam di test resta interna. Un modulo core riceve input ordinati e passi
espliciti e restituisce snapshot ed effetti; un browser adapter collega DOM,
clock reale, input e renderer, mentre un test adapter controlla input e tempo e
osserva gli stessi risultati. L'interface pubblica dell'autore non espone
questi interni né aggiunge accesso mutabile allo stato.

## Scope amendment for Fondale 1.0

Il core deterministico, lo stato serializzabile e la ripresa esatta restano
necessari ai salvataggi. [Definire lo scenario di accettazione di Fondale
1.0](15-scenario-accettazione.md) rinvia invece sessioni concorrenti e mantiene
interni gli stati dettagliati del lifecycle; nessun adapter audio appartiene
alla Versione 1.
