# Definire salvataggi e caricamento versionati

Type: grilling
Status: resolved
Blocked by: 04, 08, 09, 15

## Question

Qual è il più piccolo snapshot JSON-safe, versionato e validato con cui Fondale
salva soltanto uno stato committed e lo ripristina deterministicamente, inclusa
la `Game Activity` dominante? La decisione deve identificare progetto e formato,
escludere definizioni e interni derivati e rifiutare dati corrotti o versioni
incompatibili; slot, UI, storage, cloud e migrazioni fra versioni non ancora
esistenti non appartengono al motore 1.0.

## Answer

Fondale 1.0 produce un `Save Snapshot` JSON-safe, ispezionabile e persistibile
con gli strumenti scelti dal `Game Project`, ma costruito e interpretato
soltanto dal motore. Non è uno slot né un record di storage e non contiene
etichetta, data, anteprima o tempo giocato.

Ogni `Game Project` dichiara due valori stabili:

- una `Project Identity`, scelta dall'Author e indipendente dal titolo visibile
  o dal nome del pacchetto;
- una `Project Version` che esprime esclusivamente la compatibilità dei
  salvataggi, non la versione commerciale o npm del gioco.

Lo snapshot porta entrambe insieme a una versione del formato posseduta da
Fondale. Un salvataggio è compatibile soltanto quando formato, Project Identity
e Project Version coincidono esattamente. La Versione 1 non migra salvataggi in
avanti o indietro. Una release del gioco può mantenere la Project Version se
l'Author garantisce che i suoi cambiamenti sono compatibili; Fondale continua
comunque a verificare i riferimenti alle definizioni, ma non può dedurre se un
nuovo `Game Behavior` abbia cambiato il significato narrativo dello stato.

### Contenuto dello snapshot

Lo snapshot rappresenta uno e un solo `Game State` committed. Contiene tutti e
soltanto i fatti canonici necessari alla ripresa deterministica:

- Scene corrente, stato logico locale e Appearance selezionato delle Scenery;
- stato logico, posizione, orientamento e Appearance dei Character;
- collocazione e Appearance di ogni Object, ordine dell'Inventory e selezione
  corrente;
- Game Variable;
- identità e progresso logico dell'eventuale Game Activity dominante,
  compresi Player Intent, movimento, Sequence, Line o Choice attivi.

Non contiene `Game Definition`, callback, asset, geometrie e percorsi derivati,
oggetti del renderer, interpolazione visiva, effetti già realizzati, input non
ancora elaborati o altri interni ricostruibili. Lo stato ripristinato deriva di
nuovo questi elementi dal `Game Project` e continua dall'attività esatta senza
rieseguire Game Operation già committed.

### Creazione, validazione e ripristino

La `Game Session` offre un'unica operazione per creare su richiesta lo snapshot
dell'ultimo stato committed. La richiesta resta valida durante il normale gioco
anche se movimento o transizione sono in corso: non cattura mai preparazione
parziale o stato del renderer. Fondale non decide quando salvare, non effettua
autosalvataggi e non notifica lo storage. Dopo `stop()` o il fallimento
terminale della sessione non è più possibile creare uno snapshot.

Un dato recuperato dallo storage è `unknown`, anche se era stato originariamente
prodotto da Fondale. Il contratto pubblico separa tre atti:

1. la sessione crea un Save Snapshot JSON-safe;
2. il Game Project lo serializza e lo conserva dove preferisce;
3. Fondale convalida il dato recuperato rispetto al Game Project e soltanto il
   risultato validato può essere passato a `startGame`.

La validazione controlla forma JSON, versione del formato, identità e versione
del progetto, tipi e valori ammessi, esistenza dei riferimenti e invarianti del
Game State: fra gli altri, Scene e posizioni valide, collocazione esclusiva
degli Object, coerenza di Inventory e selezione e progresso valido della Game
Activity. Dati incompleti, campi inattesi, riferimenti mancanti o stati
contraddittori vengono rifiutati con una diagnostica contestuale. Non esistono
riparazioni, default tardivi o fallback silenzioso a una nuova partita.

Il ripristino crea una nuova Game Session indipendente, come già stabilito dal
contratto del runtime. Il salvataggio non è una misura di sicurezza: Fondale
garantisce coerenza strutturale e semantica rispetto alle regole conoscibili,
ma non offre firma, cifratura, protezione anti-cheat o prova di autenticità.
