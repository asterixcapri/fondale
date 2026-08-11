# Fondale — Capability-owned Engine architecture

Status: ready-for-agent

## Problem Statement

L'Engine è cresciuto organizzando gran parte del codice per strati tecnici e per visibilità, con responsabilità distribuite tra aree pubbliche, runtime interno, persistenza e browser. Questa struttura rende difficile capire chi possiede davvero una regola di dominio: per modificare una singola capacità, come una Sequence o la Camera, occorre seguire definizioni, validazione, interpretazione, stato derivato e presentazione in punti differenti del sistema.

La frammentazione non è soltanto un problema di nomi o di dimensione dei file. Alcune decisioni semantiche vengono interpretate in più luoghi, in particolare tra il cuore deterministico dell'Engine e il renderer browser. Questo aumenta il rischio che la stessa Game Definition produca comportamenti differenti a seconda del percorso di esecuzione, rende più costosi i cambiamenti e obbliga test e agenti a conoscere dettagli interni che non dovrebbero servire.

Fondale è ancora in alpha. È quindi il momento adatto per correggere i confini dei moduli e, quando necessario, modificare i contratti pubblici senza accumulare adattatori di compatibilità destinati a restare. Il riallineamento deve però conservare il modello deterministico già valido: CoreSession possiede il Game State canonico, riceve input in coda, avanza tramite tick espliciti, restituisce snapshot ed effetti difensivi e ripristina esattamente un Save Snapshot valido.

La riscrittura deve inoltre risultare comprensibile a chi non conosce il gergo architetturale. Alla fine del lavoro serve una rappresentazione visuale, consultabile offline, che mostri con linguaggio semplice come una Game Definition diventa una sessione giocabile, come input e tick modificano lo stato, come le capacità collaborano e come browser e salvataggi rimangono adattatori del motore.

## Solution

Riorganizzare progressivamente l'Engine attorno a moduli verticali che possiedono capacità riconoscibili del dominio: Game Project, Game Session, World, Interaction, Sequence, Animation, Camera, HUD e Save. Ogni modulo riunisce le regole che gli appartengono lungo l'intero percorso utile — definizione, validazione locale, interpretazione runtime e fatti derivati — invece di separarle automaticamente in strati orizzontali.

Game Session rimane il coordinatore deterministico. Possiede il Game State canonico e il logical tick, determina la Game Activity dominante, distribuisce gli input e applica atomicamente le Game Operation, ma delega ai moduli proprietari le regole specifiche. I moduli non ricevono accesso mutabile allo stato globale: comunicano mediante interfacce strette, dati immutabili e risultati espliciti.

Il browser resta un confine tecnico separato. PixiJS, DOM, dispositivi di input, caricamento degli asset e localStorage consumano fatti e comandi dell'Engine, senza diventare proprietari delle regole di Sequence, Animation, Camera, HUD o Save.

La migrazione procede per sezioni verticali complete, mantenendo `main` compilabile e verificabile dopo ogni passaggio. Il primo tracer è Direction Step: il precedente nome pubblico DirectStep viene sostituito, e definizione, validazione, semantica temporale, coordinamento delle direzioni e test vengono ricondotti al modulo Sequence. CoreSession e browser consumano la stessa interpretazione semantica, eliminando i percorsi duplicati senza introdurre un nuovo modello opaco di frame o commit.

La riscrittura può cambiare i contratti pubblici quando il cambiamento migliora responsabilità, coerenza del dominio o facilità d'uso. Ogni rottura aggiorna nello stesso incremento Capri 1535, documentazione, esempi e test, con indicazioni di migrazione. Non vengono mantenuti adattatori temporanei per i vecchi contratti alpha. Durante la transizione non viene pubblicata una versione npm ibrida; l'insieme coerente diventa la versione 0.4.0 al termine della riscrittura.

Il risultato finale comprende una pagina HTML autonoma e tracciata nel repository. La pagina spiega in italiano, mantenendo i termini canonici inglesi, il flusso Authoring → avvio e validazione → input e tick → Game State → capacità dell'Engine → presentazione browser → Save e restore. Deve descrivere l'architettura finale, non le tappe provvisorie della migrazione.

## User Stories

1. Come maintainer dell'Engine, voglio trovare le regole di una capacità nello stesso modulo che la possiede, così da comprenderla e modificarla senza ricostruire il comportamento attraverso strati tecnici scollegati.
2. Come maintainer dell'Engine, voglio che ogni modulo abbia una responsabilità dichiarabile con il linguaggio del dominio, così da riconoscere rapidamente dove appartiene una nuova regola.
3. Come maintainer dell'Engine, voglio che la creazione di un modulo dipenda dalla presenza di policy, ciclo di vita o invarianti sostanziali, così da evitare un modulo superficiale per ciascun termine del glossario.
4. Come maintainer dell'Engine, voglio che Game Project possieda composizione della Game Definition, Project Identity, Project Version e raccolta degli Authoring Diagnostic, così da avere un punto chiaro per la coerenza complessiva del progetto.
5. Come maintainer dell'Engine, voglio che Game Session possieda Game State canonico, logical tick, Game Activity dominante, dispatch degli input e commit atomico delle Game Operation, così da conservare un coordinatore deterministico comprensibile.
6. Come maintainer dell'Engine, voglio che World possieda Scene, Character, Object, Scenery, Hotspot, Passage, Scene Space e regole di Motion, così da tenere insieme la struttura spaziale e il movimento nel mondo.
7. Come maintainer dell'Engine, voglio che Interaction possieda Noun, Command, Player Intent, Inventory, condizioni e risposte, così da concentrare le regole che traducono le intenzioni del Player in conseguenze di gioco.
8. Come maintainer dell'Engine, voglio che Sequence possieda ordinamento, concorrenza, Cue, completamento, Line, Narration, Choice, Skip Outcome e direzione temporale, così da avere una sola semantica per le sequenze.
9. Come maintainer dell'Engine, voglio che Animation possieda Appearance, Animation, ruoli, cue visuali e anchor, così da separare il significato dell'animazione dal modo in cui il browser la disegna.
10. Come maintainer dell'Engine, voglio che Camera possieda le regole della camera che segue il Player e della camera diretta da una Sequence, così da produrre fatti derivati coerenti per qualunque presentazione.
11. Come maintainer dell'Engine, voglio che HUD possieda tema, contextual action, command preview, Inventory e Choice presentation, così da rendere esplicita la logica di presentazione che non appartiene al renderer.
12. Come maintainer dell'Engine, voglio che Save possieda validazione, serializzazione logica e restore dei Save Snapshot, così da isolare le regole di persistenza dal mezzo usato per conservare i dati.
13. Come maintainer dell'Engine, voglio che il browser possieda soltanto integrazioni con PixiJS, DOM, input fisici, asset e localStorage, così da poter cambiare tecnologia di presentazione senza riscrivere le regole di gioco.
14. Come maintainer dell'Engine, voglio che le dipendenze tra capacità passino esclusivamente dall'interfaccia del modulo proprietario, così da impedire accoppiamenti con dettagli privati.
15. Come maintainer dell'Engine, voglio evitare un modulo shared generico usato per aggirare la proprietà, così da non ricreare gradualmente gli stessi confini orizzontali ambigui.
16. Come maintainer dell'Engine, voglio che le rappresentazioni interne complete del Game Project restino private e che ogni capacità riceva viste strette, così da non trasformare una struttura dati universale nell'interfaccia implicita di tutto il sistema.
17. Come maintainer dell'Engine, voglio che ogni capacità validi le proprie definizioni e relazioni, così da collocare gli invarianti vicino alla conoscenza necessaria a verificarli.
18. Come maintainer dell'Engine, voglio che Game Project componga gli Authoring Diagnostic prodotti dalle capacità, così da offrire all'Author un risultato unitario senza duplicare la validazione in un validatore centrale gigante.
19. Come maintainer dell'Engine, voglio che Game Session coordini le capacità senza incorporarne le policy, così da mantenere profondo e stabile il confine della sessione.
20. Come maintainer dell'Engine, voglio che nessun modulo riceva riferimenti mutabili al Game State globale, così da preservare commit atomici e impedire mutazioni invisibili.
21. Come maintainer dell'Engine, voglio che gli input vengano accodati e consumati su tick espliciti, così da preservare riproducibilità e ordine deterministico.
22. Come maintainer dell'Engine, voglio che snapshot ed effetti esposti da CoreSession siano difensivi, così da impedire che un consumer modifichi retroattivamente la sessione.
23. Come maintainer dell'Engine, voglio che un Save Snapshot valido ripristini esattamente il Game State previsto, così da conservare l'affidabilità del salvataggio durante la riorganizzazione.
24. Come maintainer dell'Engine, voglio che Interaction decida perché un Player Intent richiede un avvicinamento e che World decida come il movimento avviene, così da separare la decisione narrativa dalla navigazione spaziale.
25. Come maintainer dell'Engine, voglio che Sequence coordini contemporaneamente Animation, Motion, Camera e Cue senza appropriarsi del loro significato specifico, così da mantenere una regia temporale con proprietari specializzati.
26. Come maintainer dell'Engine, voglio che Sequence, Animation, Camera e World condividano un'unica interpretazione dei Direction Step, così da evitare divergenze tra simulazione e rendering.
27. Come maintainer dell'Engine, voglio che il completamento di un Direction Step dipenda dalla fine di tutte le direzioni finite o dalla durata dichiarata dall'Author, così da rendere la semantica temporale precisa e verificabile.
28. Come maintainer dell'Engine, voglio eliminare il nome DirectStep in favore del termine canonico Direction Step, così da rendere il contratto pubblico coerente con il modello di dominio.
29. Come Author, voglio importare tutte le API pubbliche da un unico entry point del package, così da non dipendere dalla struttura interna dei moduli.
30. Come Author, voglio continuare a comporre il gioco con builder focalizzati come defineCharacter, defineScene e defineSequence, così da non dover inserire ogni definizione direttamente in defineGame.
31. Come Author, voglio che un Direction Step consenta di dirigere insieme Animation, Motion e Camera, così da descrivere una scena coordinata con un solo passo sequenziale.
32. Come Author, voglio ricevere Authoring Diagnostic strutturati e riferiti alla capacità responsabile, così da capire quale definizione correggere e perché.
33. Come Author, voglio che gli errori di Project Identity e Project Version siano espliciti, così da distinguere un salvataggio incompatibile da un problema generico di caricamento.
34. Come Author, voglio una guida di migrazione per ogni modifica pubblica introdotta dalla riscrittura, così da aggiornare un Game Project alpha senza dedurre i nuovi contratti dal codice.
35. Come Author, voglio che esempi, ricette, documentazione e Capri 1535 usino il contratto corrente nello stesso incremento, così da non incontrare istruzioni incompatibili tra loro.
36. Come Author, voglio che le vecchie API rimosse non rimangano come adattatori silenziosi, così da scoprire subito durante lo sviluppo quali parti del progetto devono essere aggiornate.
37. Come Player, voglio che Capri 1535 conservi lo stesso comportamento visibile durante la riorganizzazione, così da non subire regressioni prive di valore di gameplay.
38. Come Player, voglio che input, movimento, interazioni e sequenze mantengano lo stesso ordine deterministico, così da ottenere conseguenze prevedibili dalle mie azioni.
39. Come Player, voglio che Animation, Camera e HUD rappresentino lo stesso Game State interpretato dal motore, così da non vedere una scena in disaccordo con ciò che il gioco considera avvenuto.
40. Come Player, voglio che salvataggio e ripristino ricostruiscano esattamente la sessione supportata, così da poter continuare senza perdita o alterazione dello stato.
41. Come Player, voglio ricevere un errore chiaro quando un vecchio Save Snapshot non è compatibile con la nuova Project Version, così da non ottenere un ripristino parziale o corrotto.
42. Come maintainer dell'Engine, voglio migrare una capacità per volta lungo l'intera sezione verticale, così da evitare spostamenti cosmetici che lasciano la responsabilità duplicata.
43. Come maintainer dell'Engine, voglio che ogni incremento rimuova il vecchio percorso interpretativo della capacità migrata, così da non chiudere un ticket con due implementazioni concorrenti.
44. Come maintainer dell'Engine, voglio che `main` compili e superi le verifiche dopo ogni incremento, così da poter continuare la migrazione da una base sempre utilizzabile.
45. Come maintainer dell'Engine, voglio iniziare dal tracer Direction Step, così da verificare presto che i nuovi confini funzionino su una capacità che attraversa authoring, runtime e browser.
46. Come maintainer dell'Engine, voglio preservare Game State, CoreEffect e Save Snapshot durante il primo tracer, così da isolare la prova architetturale dal ridisegno della sessione.
47. Come maintainer dell'Engine, voglio rimuovere le categorie orizzontali precedenti soltanto quando ogni loro elemento ha un proprietario verticale, così da non perdere responsabilità durante la transizione.
48. Come maintainer dell'Engine, voglio che i test di capacità vivano vicino al relativo modulo, così da trovare insieme comportamento, invarianti e prove locali.
49. Come maintainer dell'Engine, voglio mantenere test di accettazione ai confini del package, di CoreSession e del browser, così da verificare l'integrazione senza dipendere dalla disposizione interna dei file.
50. Come maintainer dell'Engine, voglio una verifica automatica delle dipendenze strutturali, così da impedire che un modulo importi i file privati di un'altra capacità.
51. Come maintainer dell'Engine, voglio evitare nuove API pubbliche create soltanto per facilitare i test, così da mantenere il contratto dell'Author piccolo e intenzionale.
52. Come maintainer dell'Engine, voglio rinviare la pubblicazione npm finché tutti i contratti e i moduli non formano un insieme coerente, così da non distribuire una versione a metà migrazione.
53. Come maintainer dell'Engine, voglio pubblicare il risultato coerente come versione 0.4.0, così da comunicare chiaramente la rottura dei contratti alpha.
54. Come agent che lavora sul repository, voglio una mappa esplicita di proprietà e dipendenze consentite, così da collocare una modifica senza dover inferire l'architettura da nomi storici.
55. Come agent che lavora sul repository, voglio test comportamentali che sopravvivano agli spostamenti interni, così da poter migliorare la struttura senza riscrivere test accoppiati ai file.
56. Come persona nuova al progetto, voglio una pagina HTML visuale che spieghi in italiano i termini inglesi canonici, così da capire il motore senza conoscere in anticipo il gergo architetturale.
57. Come persona nuova al progetto, voglio vedere il percorso completo dalla Game Definition alla presentazione browser, così da capire dove nascono stato, effetti e dati visuali.
58. Come persona nuova al progetto, voglio vedere quali moduli comunicano tra loro e che cosa si scambiano, così da distinguere coordinamento, regole di dominio e adattatori tecnici.
59. Come persona nuova al progetto, voglio vedere come Save e restore si collegano a Game Session senza controllarla, così da capire la differenza tra stato canonico e persistenza.
60. Come persona nuova al progetto, voglio consultare la spiegazione senza server né connessione di rete, così da poterla usare come riferimento durevole accanto al codice.

## Implementation Decisions

- La decisione architetturale normativa è ADR-0011, “Organize the Engine by capability”. Questa spec ne pianifica l'applicazione completa senza sostituirne le motivazioni.
- L'unità primaria di ownership è una Engine Capability verticale. Un termine del glossario non genera automaticamente un modulo: il candidato deve possedere abbastanza policy, ciclo di vita o invarianti da continuare ad avere senso se il resto dell'Engine venisse rimosso.
- La granularità iniziale è intenzionalmente moderata: Game Project, Game Session, World, Interaction, Sequence, Animation, Camera, HUD e Save. Nuovi moduli richiedono evidenza di una responsabilità autonoma; non si crea un modulo per ciascuno dei termini canonici.
- Game Project possiede la composizione della Game Definition, Project Identity, Project Version e la composizione degli Authoring Diagnostic. Non replica gli invarianti che appartengono alle altre capacità.
- Game Session possiede il Game State canonico, il logical tick, la Game Activity dominante, l'instradamento degli input e l'applicazione atomica delle Game Operation. È un coordinatore, non il contenitore di tutte le regole dell'Engine.
- CoreSession rimane il confine deterministico riconoscibile di Game Session e conserva il proprio nome. La migrazione ne riduce le responsabilità improprie delegando le policy ai capability owner, ma non sostituisce il modello sessione/stato.
- World possiede la struttura spaziale e le regole di navigazione e Motion. Interaction può richiedere un avvicinamento in base a un Player Intent, ma World calcola e governa il movimento necessario.
- Interaction possiede la traduzione di Noun e Command in Player Intent e conseguenze, incluse condizioni, risposte e Inventory. Non possiede il percorso fisico né il rendering della risposta.
- Sequence possiede la semantica temporale di Sequence, inclusi ordinamento, concorrenza, Cue, completamento, Line, Narration, Choice, Skip Outcome e Direction Step.
- Un Direction Step dirige concorrenti Animation, Motion e Camera. Il passo termina quando tutte le direzioni finite sono concluse oppure quando scade la durata dichiarata dall'Author.
- Sequence coordina quando una direzione è attiva e il suo tempo locale. Animation, World e Camera possiedono rispettivamente il significato delle direzioni di animazione, movimento e camera.
- La semantica calcolata di un Direction Step è unica e indipendente da PixiJS o DOM. CoreSession e browser consumano gli stessi fatti semantici invece di reinterpretare separatamente la definizione.
- Il primo tracer rinomina il contratto pubblico DirectStep in DirectionStep e trasferisce l'intera sezione verticale al proprietario Sequence: definizione, validazione, interpretazione e test. Al termine del tracer non resta un secondo percorso attivo con il vecchio nome o la vecchia semantica.
- Il primo tracer non ridisegna Game State, CoreEffect o Save Snapshot. Eventuali modifiche successive a questi contratti devono essere motivate dalla capacità migrata e consegnate come incremento coerente.
- CoreSession conserva gli invarianti attuali: input accodati, avanzamento tramite tick espliciti, Game State canonico, commit atomici, snapshot ed effetti difensivi e restore esatto dei Save Snapshot validi.
- Non viene introdotta un'astrazione opaca che sostituisca lo stato canonico con un generico frame di presentazione o un generico commit di sessione. Un cambiamento di questo tipo richiederebbe evidenza e una decisione architetturale separata.
- Ogni capability module espone un'interfaccia pubblica interna stretta. Un modulo può importare liberamente i propri dettagli privati, mentre gli altri moduli possono dipendere soltanto dalla sua interfaccia dichiarata.
- Non viene creato un contenitore shared generico. Concetti realmente trasversali restano minimi e privi di policy; quando una regola ha un proprietario di dominio, viene esposta dal proprietario.
- La rappresentazione aggregata completa del Game Project può esistere come dettaglio privato, ma non è l'interfaccia universale tra moduli. Ogni capacità riceve soltanto la vista necessaria a svolgere il proprio lavoro.
- Ogni capacità valida le definizioni e le relazioni che possiede e produce Authoring Diagnostic strutturati. Game Project coordina l'esecuzione dei validatori e combina i risultati mantenendo attribuzione e contesto.
- Il browser è un adapter area separato. Integra PixiJS, DOM, dispositivi di input, caricamento asset e localStorage; non contiene una seconda implementazione delle regole delle capacità.
- Il package conserva un solo entry point pubblico. La riorganizzazione interna non introduce import pubblici per singolo capability module.
- I builder di authoring focalizzati restano parte del modello d'uso. La composizione non viene compressa in un'unica chiamata monolitica a defineGame.
- Poiché il progetto è in alpha, un contratto pubblico può cambiare quando il beneficio è concreto in termini di ownership, coerenza del dominio o semplicità. Non si introducono rotture prive di tale beneficio.
- Quando cambia un contratto pubblico, nello stesso incremento vengono aggiornati Capri 1535, documentazione, ricette, esempi e test, insieme a indicazioni di migrazione. Non vengono conservati adattatori di compatibilità per i vecchi Game Project.
- I Save Snapshot incompatibili con la nuova struttura possono essere invalidati. Il rifiuto usa Project Identity e Project Version e produce diagnostica strutturata; non viene costruito un migratore monouso per i salvataggi alpha precedenti.
- La migrazione è incrementale e verticale. Ogni ticket trasferisce ownership reale, aggiorna tutti i consumer e rimuove il percorso precedente; un semplice spostamento o frazionamento di file non costituisce completamento.
- Le categorie orizzontali storiche scompaiono solo quando tutti i loro contenuti hanno un capability owner esplicito. Durante la transizione non diventano la destinazione di nuovo codice di dominio.
- Il lavoro avviene direttamente su `main`, mantenendolo funzionante a ogni incremento, in accordo con la fase alpha del progetto.
- Non viene pubblicata una release npm durante lo stato misto della migrazione. La prima release della nuova architettura è un insieme coerente identificato come 0.4.0.
- Il deliverable conclusivo include un documento HTML autonomo e versionato. Usa diagrammi, flussi e brevi spiegazioni italiane accanto ai termini canonici inglesi; rappresenta soltanto l'architettura finale e non dipende da risorse di rete.

## Testing Decisions

- I test privilegiano comportamento osservabile e contratti stabili. Non devono fallire soltanto perché un dettaglio privato viene spostato all'interno del proprio capability module.
- Il primo confine di test è il package pubblico. Le verifiche importano esclusivamente dall'entry point principale e coprono defineGame, defineSequence, gli altri builder pubblici, i contratti TypeScript, la nuova forma DirectionStep e i relativi Authoring Diagnostic.
- Il secondo confine di test è CoreSession. Le verifiche esercitano input, tick, Game State, Game Activity, CoreEffect, snapshot difensivi e restore tramite l'API di sessione esistente e i supporti di test già pubblicamente adottati dal repository.
- Il terzo confine di test è startGame nel browser. Le verifiche Playwright osservano input reale, presentazione, Animation, Camera, HUD, salvataggio e ripristino attraverso fixture browser e Capri 1535.
- Il tracer Direction Step deve dimostrare con test di integrazione che più direzioni concorrenti condividono lo stesso tempo locale, che Cue e completamento avvengono una sola volta e che la durata dichiarata prevale quando termina prima delle direzioni finite.
- Il tracer Direction Step deve coprire anche direzioni con durate differenti, assenza di una o più categorie di direzione, riferimenti non validi, combinazioni non valide e comportamento di skip applicabile.
- I test del tracer devono provare che CoreSession e presentazione browser consumano lo stesso risultato semantico per Animation, Motion e Camera. Non è sufficiente duplicare le stesse aspettative su due interpreti separati.
- La migrazione di ciascuna capacità aggiunge o sposta vicino al modulo i test delle sue policy e invarianti. I test trasversali restano ai confini del package, della sessione e del browser.
- Una verifica strutturale automatica rifiuta import diretti nei file privati di un altro capability module. La regola consente dipendenze soltanto attraverso l'interfaccia dichiarata del proprietario.
- La verifica strutturale rifiuta anche la reintroduzione delle categorie orizzontali come destinazione di nuove regole di dominio e la creazione di un contenitore shared usato per eludere l'ownership.
- I test di regressione conservano il comportamento osservabile di Capri 1535 durante gli incrementi, salvo cambiamenti pubblici esplicitamente documentati e approvati dalla spec.
- I test di Save coprono round trip, restore esatto, Project Identity errata, Project Version incompatibile, snapshot malformato e assenza di mutazioni parziali dopo un fallimento.
- I test degli Authoring Diagnostic verificano struttura, ownership della capacità, localizzazione utile dell'errore e aggregazione deterministica da parte di Game Project.
- Non vengono aggiunti contratti pubblici destinati esclusivamente ai test. Se un comportamento non è osservabile attraverso i tre confini confermati, si preferisce un test locale del modulo o una dipendenza interna sostituibile.
- Ogni incremento deve superare build e suite browser complete prima di essere considerato concluso. Le verifiche standard del repository restano `npm run build` e `npm run verify`.
- Il documento HTML finale viene aperto come file locale in un browser e verificato senza rete. La verifica controlla leggibilità, navigazione interna, assenza di asset remoti e rappresentazione completa dei flussi dichiarati nella Solution.
- Prima della release 0.4.0 viene eseguito un passaggio di accettazione completo sui tre confini, sulla regola strutturale, su Capri 1535 e sul documento HTML offline.

## Out of Scope

- Ridisegnare CoreSession attorno a un generico SessionCommit, PlayFrame o altro modello opaco non richiesto dalle capacità.
- Introdurre un registry generico di capability, un sistema di plugin o un framework di estensioni dinamiche.
- Creare un modulo separato per ogni termine del glossario.
- Considerare sufficiente il solo frazionamento dei file o la riduzione del numero di righe.
- Cambiare tecnologia di rendering, sostituire PixiJS o esporre PixiJS e DOM nel contratto dell'Engine.
- Aggiungere nuove capacità di gameplay o modificare intenzionalmente il comportamento del Player in Capri 1535.
- Pubblicare subpath pubblici per i singoli capability module.
- Aggiungere API pubbliche o hook usati soltanto dai test.
- Mantenere shim o adattatori di compatibilità per i precedenti contratti alpha dei Game Project.
- Costruire migrazioni monouso per i Save Snapshot della versione 0.3.
- Pubblicare versioni npm intermedie mentre vecchia e nuova architettura convivono.
- Usare feature branch o pull request durante l'attuale fase alpha, salvo futura modifica esplicita del workflow del progetto.
- Documentare nel diagramma finale le tappe temporanee, i duplicati transitori o la vecchia organizzazione come se fossero parte dell'architettura destinazione.

## Further Notes

- Questa specifica deriva dalle decisioni confermate durante il grilling architetturale e va letta insieme ad ADR-0011 e al linguaggio canonico di CONTEXT.md.
- Il nome richiesto per il documento visuale conclusivo è `docs/engine-architecture.html`.
- Le spiegazioni umane e la pagina visuale possono essere in italiano; ubiquitous language, interfacce pubbliche, codice e commenti restano in inglese.
- “Direction Step” è il termine canonico. “Direct Step”, “Directed Step” e “Choreography” non devono essere reintrodotti come sinonimi nel contratto o nella documentazione.
- L'ordine dei ticket successivi al tracer Direction Step deve privilegiare le dipendenze realmente scoperte durante l'implementazione, mantenendo sempre una sezione verticale completa e verificabile.
- Prima di dichiarare conclusa la riscrittura, ogni elemento rimasto nelle categorie storiche deve essere assegnato esplicitamente a un proprietario oppure eliminato come duplicato; non sono ammessi contenitori residuali senza responsabilità.
