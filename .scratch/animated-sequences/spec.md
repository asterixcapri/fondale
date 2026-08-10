# Fondale — Animation, Motion, and Camera direction in Sequence

Status: ready-for-human

## Problem Statement

Fondale può oggi rappresentare Appearance statici alternativi, la camminata
direzionale basilare di un Character e Sequence composte da Line, Narration,
Choice, condizioni e Game Operation. Un Author non può però descrivere con la
stessa interface dichiarativa una scena diretta in cui più elementi del mondo
si animano e si spostano insieme mentre il Player rimane a guardare.

Questo impedisce di esprimere momenti ordinari di un'avventura grafica: Michele
inserisce una manovella nell'argano, il meccanismo gira e infine rimane nello
stato riparato; un Character passa dall'idle alla parola e poi torna all'idle;
una barca oscilla mentre avanza dall'orizzonte alla spiaggia; più Character e
Scenery reagiscono l'uno all'altro con tempi coordinati; la Camera accompagna
l'azione e poi torna a seguire il Player Character.

Trattare ogni fotogramma come Appearance o Game State renderebbe permanenti
dettagli transitori. Esporre callback, thread o oggetti PixiJS sposterebbe la
regia nei Game Project, rendendo authoring, Save, skip e verifica fragili. Un
secondo contenitore chiamato Choreography duplicherebbe invece il ruolo già
posseduto da Sequence.

Serve quindi estendere i concetti esistenti mantenendo una distinzione netta
fra il risultato permanente dell'avventura e la sua rappresentazione lungo il
tempo logico.

## Solution

Sequence rappresenta un trasferimento temporaneo della regia: la toglie al
Player e la assegna alla progressione dichiarata dall'Author. Rimane l'unica
regia finita e dominante e, quando termina, restituisce il controllo al Player.
Una Sequence può dirigere Line, Narration, Choice, condizioni, Animation,
Motion, Camera e Game Operation all'interno di una sola Scene. I suoi passi
avanzano in ordine; un singolo passo può avviare più Animation e Motion
contemporaneamente e termina quando tutte le direzioni finite richieste sono
concluse. Durante la regia i normali Command, la camminata libera e l'Inventory
non sono disponibili. Restano soltanto le partecipazioni esplicitamente
previste, come avanzare una Line, scegliere una Choice o saltare una Sequence
skippable.

Appearance rappresenta la condizione visiva semantica e permanente di un
Character, Object o Scenery. Ogni Appearance possiede le Animation disponibili
mentre è selezionato. Animation rappresenta invece una performance visiva
transitoria e non cambia da sola Game State o posizione. Ogni Appearance ha una
Default Animation, eventualmente composta da un solo fotogramma. I ruoli
speaking e walking permettono all'Engine di scegliere automaticamente la
Animation pertinente; speaking può ricadere sulla Default Animation, mentre
walking è obbligatoria quando il Character si muove in quell'Appearance.

Motion descrive separatamente lo spostamento nello Scene Space. Un Character
segue la navigazione della Scene verso la destinazione e usa automaticamente
la propria walking Animation. Un Object o una Scenery segue un percorso
autoriale. Animation e Motion possono procedere insieme: la barca può quindi
oscillare e avanzare senza confondere i fotogrammi con la sua posizione.

Un Animation Cue è un istante nominato interno a un'Animation. Una Sequence lo
usa per coordinare altre Animation, Motion o futuri suoni senza dipendere da un
ritardo fragile. Il Cue non muta direttamente il Game State. Il risultato
permanente viene applicato attraverso Game Operation esplicite, normalmente al
confine del passo o al termine della Sequence.

La Camera continua normalmente a seguire il Player Character, ma una Sequence
può temporaneamente dirigerne l'inquadratura nella Scene corrente. Può
riposizionarla immediatamente, muoverla lungo il tempo logico, mantenerla ferma
o farle seguire un altro soggetto. Alla fine della Sequence la Camera torna
automaticamente a seguire il Player Character. La Camera rimane presentazione
transitoria e non viene salvata indipendentemente.

Una Scene può dichiarare l'avvio condizionale di una Sequence quando una
transizione arriva, con un filtro facoltativo sulla Scene Entrance. La Sequence
applicabile prende il controllo prima che il Player possa impartire un nuovo
Command. Il ripristino di un Save Snapshot già collocato nella Scene non è un
nuovo arrivo e non riavvia la Sequence.

Il caso guida della torre usa soltanto questi concetti. Il Player controlla
Michele durante la salita e gli ordina di attraversare il portone, rappresentato
da un normale Scene Passage. La transizione colloca Michele nella Scene Entrance
della nuova Scene; soltanto allora parte `boat-arrival`. La Sequence può
spostare la Camera, animare e muovere una o più barche e applicare lo stato
finale `boatLanded`, quindi restituisce il controllo. La Sequence non attraversa
il portone e non continua fra più Scene.

La barca osservata dalla torre è una Scenery locale alla Scene. Il suo Motion
parte dall'orizzonte e termina nella posizione di riposo autoriale sulla
spiaggia. Il risultato permanente è espresso da un'Appearance approdata e da
Game Operation coerenti, non da una coordinata arbitraria della Scenery salvata
nel Game State. Se un'altra Scene mostra la stessa barca, usa la propria
Scenery locale e deriva la presentazione dallo stesso stato dell'avventura.

Una Sequence skippable dichiara uno Skip Outcome formato dalle Game Operation
necessarie a raggiungere un risultato coerente senza eseguire i passi rimasti.
Il progresso logico esatto della Sequence appartiene al Game State; i
fotogrammi, la fase delle Default Animation e la posizione indipendente della
Camera rimangono derivati.

## User Stories

1. Come Player, voglio vedere Michele compiere fisicamente un'azione, così da non percepire gli enigmi come cambi di immagine istantanei.
2. Come Player, voglio vedere l'argano animarsi quando Michele inserisce la manovella, così da comprendere la relazione fra Command e risultato.
3. Come Player, voglio che l'argano rimanga visivamente con la manovella inserita dopo l'animazione, così da riconoscere lo stato permanente dell'enigma.
4. Come Player, voglio che un Character abbia una presentazione idle quando non agisce, così da sembrare presente nella Scene.
5. Come Player, voglio che un Character usi una Animation di parola durante una Line, così da collegare testo e performance.
6. Come Player, voglio che il Character torni automaticamente all'idle dopo aver parlato, così da evitare pose bloccate.
7. Come Player, voglio che un Character usi una Animation di camminata mentre cambia posizione, così da non scivolare nella Scene.
8. Come Player, voglio che direzione, posizione e Animation di camminata restino coerenti, così da percepire un movimento credibile.
9. Come Player, voglio vedere una barca oscillare mentre si avvicina, così da percepire insieme moto del mare e avanzamento.
10. Come Player, voglio vedere più barche o altri elementi animarsi nello stesso momento, così da assistere a una scena viva.
11. Come Player, voglio che due Character o Scenery possano reagire in momenti coordinati, così da comprendere la loro interazione.
12. Come Player, voglio che un gesto possa provocare immediatamente la reazione di un altro elemento, così da non percepire ritardi arbitrari.
13. Come Player, voglio che la Camera accompagni l'azione quando il soggetto non è già visibile, così da sapere dove guardare.
14. Come Player, voglio che la Camera possa spostarsi gradualmente verso la barca, così da ottenere una regia contemplativa.
15. Come Player, voglio che la Camera possa cambiare immediatamente inquadratura, così da supportare uno stacco rapido nella stessa Scene.
16. Come Player, voglio che la Camera possa restare immobile quando l'azione è già ben composta, così da evitare movimenti superflui.
17. Come Player, voglio che la Camera possa seguire temporaneamente una barca o un Character, così da mantenere il soggetto inquadrato durante il Motion.
18. Come Player, voglio che la Camera torni a seguire Michele al termine della Sequence, così da riprendere l'esplorazione senza correggere l'inquadratura.
19. Come Player, voglio perdere temporaneamente il controllo durante una Sequence osservativa, così da non interrompere accidentalmente la regia.
20. Come Player, voglio che Command, camminata libera e Inventory non interferiscano con una Sequence attiva, così da non creare azioni concorrenti.
21. Come Player, voglio poter avanzare una Line quando la Sequence lo permette, così da mantenere il controllo sul ritmo di lettura.
22. Come Player, voglio poter selezionare una Choice prevista dalla Sequence, così da partecipare soltanto nei punti stabiliti dall'Author.
23. Come Player, voglio poter saltare una Sequence dichiarata skippable, così da non essere obbligato a rivederla interamente.
24. Come Player, voglio che lo skip produca lo stesso risultato logico coerente della regia completata, così da non rompere l'avventura.
25. Come Player, voglio che una Sequence non skippable ignori la richiesta di skip, così da preservare i momenti che l'Author considera necessari.
26. Come Player, voglio che il cambio di Scene attraverso il portone termini prima dell'inizio della Sequence, così da comprendere dove si svolge l'azione.
27. Come Player, voglio che la Sequence inizi immediatamente all'arrivo nella nuova Scene, così da non vedere un breve intervallo in cui posso impartire un Command fuori luogo.
28. Come Player, voglio che la Sequence della barca parta soltanto al primo arrivo pertinente, così da non rivedere l'approdo tornando successivamente.
29. Come Player, voglio che caricare una partita già nella torre non simuli un nuovo ingresso, così da non riavviare una Sequence conclusa.
30. Come Player, voglio riprendere una Sequence salvata dal suo progresso logico corretto, così da non ripetere o saltare eventi permanenti.
31. Come Player, voglio che un ripristino durante una regia mostri Animation, Motion e Camera coerenti con quel progresso, così da ritrovare la stessa situazione percepibile.
32. Come Player, voglio che le fasi casuali o ambientali delle Animation non modifichino l'esito del gioco, così da ottenere lo stesso risultato indipendentemente dalla presentazione.
33. Come Player, voglio che una Scenery approdata appaia direttamente nella posizione finale dopo il caricamento, così da non dover riprodurre il viaggio.
34. Come Player, voglio che l'Appearance finale sia visibile anche se ho saltato la Sequence, così da vedere un mondo coerente con il Game State.
35. Come Author, voglio usare Sequence come unica regia, così da non imparare un secondo contenitore chiamato Choreography.
36. Come Author, voglio mantenere i passi della Sequence ordinati, così da leggere la progressione narrativa dall'alto verso il basso.
37. Come Author, voglio avviare più Animation e Motion nello stesso passo, così da descrivere azioni concorrenti senza thread o callback.
38. Come Author, voglio che un passo attenda tutte le direzioni finite richieste, così da conoscere il suo confine di completamento.
39. Come Author, voglio accompagnare un'azione finita con una Default Animation in loop, così da mantenere movimento ambientale senza bloccare la Sequence.
40. Come Author, voglio ricevere una diagnostica quando un passo contiene soltanto loop senza durata o altra direzione finita, così da evitare Sequence che non possono terminare.
41. Come Author, voglio dichiarare Animation su Appearance di Character, Object e Scenery, così da usare lo stesso modello visivo per tutti gli elementi.
42. Come Author, voglio distinguere Animation da Appearance, così da non salvare una performance transitoria come condizione permanente.
43. Come Author, voglio assegnare una Default Animation a ogni Appearance, così da definire sempre la presentazione normale.
44. Come Author, voglio usare un singolo fotogramma come Default Animation, così da mantenere semplici gli elementi statici.
45. Come Author, voglio dichiarare ruoli semantici default, speaking e walking, così da non affidarmi a convenzioni sui nomi.
46. Come Author, voglio che una Line scelga automaticamente la speaking Animation, così da non ripetere la stessa istruzione in ogni battuta.
47. Come Author, voglio poter sostituire esplicitamente la speaking Animation per una Line particolare, così da rappresentare una performance speciale.
48. Come Author, voglio che l'assenza della speaking Animation ricada sulla Default Animation, così da poter creare Character che parlano senza animazioni dedicate.
49. Come Author, voglio che la walking Animation sia richiesta quando un Character si muove in un Appearance, così da evitare movimenti visivamente incompleti.
50. Come Author, voglio ricevere una diagnostica per una Animation personalizzata inesistente, così da correggere il riferimento prima di giocare.
51. Come Author, voglio descrivere un Motion separatamente dalla Animation, così da combinare liberamente percorso e performance.
52. Come Author, voglio che il Motion di un Character usi la navigazione della Scene, così da rispettare la Walkable Region anche durante la regia.
53. Come Author, voglio indicare una destinazione e un orientamento finale per un Character diretto, così da comporre la posa successiva.
54. Come Author, voglio assegnare un percorso autoriale a Object e Scenery, così da muovere elementi che non seguono la navigazione dei Character.
55. Come Author, voglio che il Motion di una Scenery termini nella sua posizione di riposo dichiarata, così da non introdurre coordinate permanenti arbitrarie.
56. Come Author, voglio applicare un Appearance finale tramite Game Operation, così da rendere persistente soltanto il risultato semantico.
57. Come Author, voglio nominare un Animation Cue, così da coordinare il contatto della manovella con l'avvio dell'argano.
58. Come Author, voglio riferire un Cue senza scrivere callback di fotogramma, così da mantenere dichiarativa la Sequence.
59. Come Author, voglio che un Cue non modifichi direttamente il Game State, così da concentrare le mutazioni nelle Game Operation validate.
60. Come Author, voglio dirigere temporaneamente la Camera dalla Sequence, così da ottenere regia senza accedere al renderer.
61. Come Author, voglio esprimere spostamento immediato, spostamento temporizzato, mantenimento e inseguimento della Camera, così da coprire le inquadrature necessarie nella stessa Scene.
62. Come Author, voglio che ogni direzione della Camera rimanga limitata allo Scene Space corrente, così da non creare implicitamente una Sequence multi-Scene.
63. Come Author, voglio avviare una Sequence in seguito all'arrivo in una Scene, così da collegare la regia a un normale attraversamento.
64. Come Author, voglio filtrare l'avvio per Scene Entrance, così da distinguere portone, scale e altri accessi alla stessa Scene.
65. Come Author, voglio condizionare l'avvio al Game State, così da mostrare l'approdo una sola volta.
66. Come Author, voglio che un Save Snapshot ripristinato non conti come arrivo, così da non confondere caricamento e transizione.
67. Come Author, voglio dichiarare uno Skip Outcome esplicito, così da stabilire quali risultati permanenti sopravvivono allo skip.
68. Come Author, voglio che il progresso della Sequence usi tempo logico, così da ottenere risultati deterministici con clock reali diversi.
69. Come Author, voglio che i fotogrammi concreti restino derivati, così da non accoppiare i Save Snapshot al renderer.
70. Come Author, voglio ricevere diagnostiche aggregate per Animation, Cue, Motion, Camera e regole di arrivo invalidi, così da correggere tutti i problemi prima dell'avvio.
71. Come Author, voglio che gli asset delle Animation vengano caricati e validati prima della Game Session, così da non scoprire una risorsa mancante durante la regia.
72. Come Author, voglio riferire Character, Object, Scenery, Scene Entrance e Sequence attraverso identità dichiarative validate, così da conservare il modello di riferimenti del Game Project.
73. Come Author, voglio continuare a usare soltanto l'interface pubblica di Fondale, così da non dipendere da PixiJS, DOM o moduli interni.
74. Come maintainer dell'Engine, voglio che il Core possieda tempo logico, completamento, skip e Save della Sequence, così da mantenere deterministici gli esiti.
75. Come maintainer dell'Engine, voglio che il renderer derivi fotogrammi e trasformazioni dal progresso logico, così da poter sostituire la tecnologia grafica senza cambiare i Game Project.
76. Come maintainer dell'Engine, voglio riusare le seam pubblica, Core e browser già esistenti, così da verificare il comportamento senza introdurre interfacce di test speciali.

## Implementation Decisions

- Sequence rimane una definizione radice nominata, finita e dichiarativa. Non
  viene introdotta una definizione Choreography, un sistema di script async, un
  registro di thread o un callback di fotogramma.
- Sequence rimane la Game Activity dominante e costituisce il trasferimento
  temporaneo della regia dal Player alla progressione dichiarata. Quando è
  attiva, i normali input del mondo e dell'Inventory non producono Player Intent;
  avanzamento di Line, Choice e skip conservano i comportamenti già previsti.
  Quando termina, il normale controllo del Player riprende.
- Una Sequence appartiene interamente alla Scene in cui inizia. Non può dirigere
  un cambio di Scene e viene validata senza supporto per passi multi-Scene.
- I passi restano sequenziali. Un passo può possedere direttamente più direzioni
  concorrenti di Animation e Motion, senza un livello Choreography intermedio.
- Un passo termina quando tutte le sue direzioni finite richieste sono concluse.
  Una direzione in loop può accompagnare una direzione finita ma non mantiene il
  passo aperto da sola. Un passo composto soltanto da loop, privo di durata o di
  un'altra direzione finita, produce un Authoring Diagnostic.
- Appearance continua a essere la condizione visiva nominata selezionata nel
  Game State. L'interface di Appearance viene approfondita affinché possieda le
  Animation disponibili e i relativi Animation Role.
- Ogni Appearance richiede una Default Animation. Una Default Animation di un
  solo fotogramma sostituisce il caso statico senza obbligare l'Author a creare
  una risorsa animata artificiale.
- Gli Animation Role automatici sono default, speaking e walking. Una Line usa
  speaking con override facoltativo; se speaking manca usa la Default Animation.
  walking è richiesta per ogni Appearance nel quale un Character può essere
  mosso.
- Le Animation personalizzate vengono riferite per nome all'interno
  dell'Appearance corrente. Un nome assente è authoring invalido, non un fallback
  silenzioso.
- Animation è playback transitorio. Frame corrente e fase dei loop non vengono
  aggiunti come fatti indipendenti al Game State.
- Animation Cue nomina un istante nella Animation e può sbloccare altre
  Animation, Motion o una futura presentazione sonora. Non esegue direttamente
  Game Operation.
- Motion non è una nuova entità del mondo e non possiede un registro radice. È
  una direzione dichiarativa contenuta nella Sequence.
- Il Motion di un Character aggiorna il Ground Point lungo tempo logico, segue
  la navigazione della Scene e seleziona automaticamente walking. Il Motion di
  Object e Scenery usa un percorso autoriale.
- Una Scenery conserva una posizione di riposo autoriale. Il suo Motion termina
  in quella posizione e non aggiunge coordinate arbitrarie persistenti al Game
  State. Appearance e Game Variable esprimono il risultato durevole.
- Le direzioni concorrenti possono animare e muovere lo stesso soggetto nello
  stesso passo. Animation controlla la performance; Motion controlla la
  posizione; le due fonti non competono sullo stesso dato.
- Il Core conserva nel Game State il percorso del passo attivo e il progresso
  logico minimo necessario a ricostruire direzioni, Cue e completamento. Non
  conserva oggetti del renderer o texture.
- Save e restore durante un passo devono essere equivalenti all'esecuzione
  ininterrotta per Game State, ordine dei Cue, Game Operation e completamento.
  Il renderer ricostruisce la presentazione dal progresso logico ripristinato.
- Una Sequence skippable richiede uno Skip Outcome dichiarativo. Lo skip termina
  le direzioni transitorie, applica atomicamente le Game Operation finali
  dichiarate e restituisce la presentazione al Game State risultante.
- La Camera normalmente continua a essere derivata dal Player Character. Una
  Sequence attiva può sostituire temporaneamente la destinazione della Camera,
  con spostamento immediato o temporizzato, mantenimento o inseguimento di un
  soggetto. Al termine o allo skip il normale inseguimento riprende.
- La Camera non è un Motion e non entra indipendentemente nel Game State. La sua
  posizione durante una Sequence viene derivata dalla direzione e dal progresso
  logico della Sequence ed è sempre limitata alla Scene corrente.
- Questa decisione amplia intenzionalmente ADR-0009, che definisce la Camera
  esclusivamente come derivata dal Player Character. Restano invariati il suo
  carattere transitorio, l'assenza dai Save Snapshot come stato indipendente e
  il vincolo di ADR-0004 che mantiene il renderer interno.
- Una Scene può dichiarare regole di avvio della Sequence all'arrivo, ordinate
  e condizionali, con filtro facoltativo sulla Scene Entrance. Al massimo una
  regola può risultare applicabile a uno stesso arrivo; un'ambiguità produce un
  Authoring Diagnostic.
- L'avvio all'arrivo avviene dopo il commit transazionale del normale Scene
  Passage e prima del ripristino del controllo del Player. L'avvio iniziale di
  una Game Session e il restore già nella Scene non sono arrivi.
- I riferimenti dichiarativi restano identificatori validati e risolti all'uso,
  in coerenza con ADR-0008. Non viene creato un secondo grafo normalizzato per
  Animation, Motion o regole di arrivo.
- L'authoring rimane TypeScript dichiarativo secondo ADR-0003. I Game Project
  non ricevono accesso a clock, Camera interna, PixiJS, DOM o stato mutabile.
- Il caricamento asset esistente viene esteso alle risorse necessarie da tutte
  le Animation raggiungibili. Risorse mancanti, indecodificabili, frame
  incompatibili, frequenze non positive, Cue fuori durata e riferimenti assenti
  vengono aggregati come Authoring Diagnostic prima dell'avvio.
- Il formato concreto degli asset anima l'interface pubblica minima necessaria
  e riusa la pipeline URL già esistente; la spec non impone sprite sheet,
  atlante o file separati come unica rappresentazione, purché l'Author possa
  dichiarare frame, frequenza, loop, direzioni e Cue senza esporre il renderer.
- La fixture di accettazione usa due scenari: inserimento della manovella con
  Animation coordinata dell'argano e approdo della barca in una Sequence avviata
  all'arrivo dalla Scene Entrance della torre.

## Testing Decisions

- I test verificano comportamento osservabile attraverso le interface esistenti
  e non leggono AnimatedSprite, texture, container PixiJS, callback interne o
  dettagli dell'algoritmo della Camera.
- La seam più alta è l'interface pubblica del pacchetto: i test di definizione
  verificano inferenza, immutabilità, composizione e Authoring Diagnostic per
  Appearance, Animation, Animation Role, Cue, Motion, Camera, Skip Outcome e
  regole di arrivo.
- La seam deterministica del Core verifica progressione temporale, concorrenza,
  ordine dei Cue, completamento dei passi, Game Operation, input bloccato, skip
  e stato prodotto. I test esistenti di Sequence, Choice, skip, Player Intent e
  Scene Passage costituiscono il prior art.
- I test del Core dimostrano che più direzioni finite iniziano nello stesso
  passo e che il passo successivo non parte finché l'ultima direzione richiesta
  non è conclusa.
- I test del Core dimostrano che un loop non blocca un passo guidato da
  un'azione finita e che un passo senza confine finito viene rifiutato durante
  l'authoring.
- I test del Core verificano che Animation Cue uguali producano lo stesso ordine
  causale a prescindere dalla suddivisione del tempo reale in aggiornamenti.
- I test del Core verificano separatamente Character Motion attraverso la
  navigazione e percorsi autoriali di Object e Scenery, senza dedurre posizione
  dai fotogrammi.
- I test di Game Project verificano che Default Animation mancante, walking
  mancante per un Character mosso, Animation esplicita assente e Cue invalido
  producano diagnostiche stabili e contestuali.
- I test di Scene Passage verificano che una regola di arrivo pertinente avvii
  la Sequence dopo il commit della destinazione e prima di accettare un nuovo
  Player Intent.
- I test di arrivo verificano filtri per Scene Entrance, condizioni false,
  ritorni successivi, regole ambigue, nuova Game Session e restore. Un restore
  nella Scene non deve essere trattato come transizione.
- I test di Save Snapshot confrontano una Sequence ininterrotta con restore in
  diversi punti di Animation, Motion e Camera. Gli snapshot finali, i Cue
  osservabili e le Game Operation devono coincidere; non viene asserito un
  oggetto renderer o una posizione Camera serializzata.
- I test di skip coprono una Sequence prima dell'avvio delle direzioni, durante
  più direzioni concorrenti e dopo un Cue. Ogni caso applica una sola volta lo
  Skip Outcome e produce lo stesso stato finale dichiarato.
- La seam browser usa una fixture Playwright controllata dal Fixed Step Clock
  esistente. I test esercitano input reale, tempo reale suddiviso in modi
  diversi, Camera, asset e rendering percepibile senza aggiungere hook pubblici
  all'Engine.
- I test browser verificano idle, speaking e ritorno alla Default Animation;
  walking durante Character Motion; Animation e Motion concorrenti della barca;
  Camera immediata, graduale, ferma e in inseguimento; ritorno automatico della
  Camera al Player Character.
- I test browser verificano che Command, camminata libera e Inventory restino
  indisponibili durante la regia, mentre Line, Choice e skip funzionano soltanto
  quando dichiarati.
- I test browser della torre attraversano il portone con input reale, osservano
  il cambio di Scene, verificano che `boat-arrival` inizi senza finestra di
  controllo, attendono l'approdo e controllano il ritorno del controllo.
- I test browser dell'argano verificano che Michele, manovella e argano si
  coordinino al Cue, che l'Appearance finale rimanga visibile e che il percorso
  skippato produca lo stesso risultato permanente.
- I test di asset failure estendono il prior art esistente e verificano che una
  risorsa Animation invalida impedisca l'avvio senza lasciare una Game Session
  o un montaggio renderer parziale.
- Le recipe pubbliche compilate mostrano almeno una Default Animation, una Line
  con speaking automatico, un Character Motion con walking, più direzioni
  concorrenti, un Animation Cue, una Camera diretta e uno Skip Outcome.
- `npm run build` e `npm run verify` restano i comandi di accettazione. I test
  devono risultare deterministici e non dipendere dalla frequenza del monitor.

## Out of Scope

- Sequence che attraversano o presentano più Scene.
- Cambi di Scene diretti da una Sequence o transizioni che aggirano un Scene
  Passage.
- Cutaway verso un'altra Scene mentre il Player Character rimane nella propria.
- Avvio automatico basato sull'ingresso del Player Character in una regione
  invisibile della stessa Scene.
- Un concetto Sequence Trigger o una nuova entità spaziale dedicata alla regia.
- Un livello, registro o classe Choreography separato da Sequence.
- Nested Sequence, thread, promise, callback di fotogramma o funzioni async
  autoriali come meccanismo di regia.
- Persistenza di coordinate arbitrarie della Scenery al termine del Motion.
- Persistenza indipendente della Camera, dei fotogrammi correnti o della fase
  dei loop ambientali.
- Un'entità persistente Vehicle o Boat. Scene diverse possono rappresentare la
  stessa barca narrativa con Scenery locali coordinate dal Game State.
- Riproduzione video full-screen, timeline cinematografiche esterne o editor
  visuali.
- Un nuovo sistema generale di effetti sonori. Animation Cue non impedisce una
  futura integrazione, ma questa spec non introduce la relativa Engine
  Capability.
- Preferenze reduced-motion e sostituzioni accessibili delle Animation; possono
  essere progettate separatamente senza cambiare l'esito logico.
- Sequence multi-Player, Character Switching o controllo simultaneo di più
  Player Character.
- Scelta obbligatoria di un unico formato fisico per gli asset animati, come
  atlas, strip o file di fotogrammi separati.

## Further Notes

- `CONTEXT.md` contiene il vocabolario canonico approvato per Sequence,
  Appearance, Animation, Motion, Default Animation, Animation Role, Animation
  Cue, Camera e Skip Outcome; prevale su formulazioni storiche della handoff.
- Il modello prende ispirazione dal rapporto fra cutscene, script, actor,
  costume, animation e wait dei motori LucasArts e di quelli di Ron Gilbert, ma
  conserva i termini Fondale e un'interface dichiarativa propria.
- La separazione fra Appearance permanente e Animation transitoria è il vincolo
  principale: l'argano con manovella è un Appearance; l'atto di inserirla è una
  Animation; l'eventuale spostamento è un Motion; il risultato è una Game
  Operation.
- La separazione fra Animation e Motion vale anche per walking: il Ground Point
  cambia attraverso Motion mentre l'Animation Role walking ne fornisce la
  performance visiva.
- La regola di arrivo nella torre soddisfa il caso guida senza Sequence Trigger
  spaziale e senza Sequence multi-Scene: il normale Scene Passage conclude la
  transizione, poi la Scene avvia la regia.
- L'estensione della Camera è una decisione architetturale significativa perché
  modifica l'esclusione del cinematic pan in ADR-0009 pur conservandone le
  ragioni sulla persistenza. Prima della relativa implementazione, la decisione
  deve essere registrata in un ADR che espliciti questa modifica.
