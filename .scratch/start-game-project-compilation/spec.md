# Fondale — Compile declarative Game Projects at start

Status: ready-for-agent

## Problem Statement

L'Author deve oggi trasformare ogni Game Definition mediante un builder
pubblico dedicato e infine chiamare `defineGame` prima di poter avviare una
Game Session. Queste funzioni rendono il percorso di authoring cerimonioso e
ambiguo: i type restituiti rimangono strutturali, quindi le funzioni possono
essere aggirate, mentre parte delle garanzie esiste soltanto se l'Author le ha
chiamate tutte nel modo atteso.

La validazione è inoltre frammentata nel tempo. Un builder può fallire durante
l'import di un file e impedire a Fondale di raccogliere gli altri problemi del
Game Project; `defineGame` produce poi un valore opaco che l'Author usa
principalmente come passaggio obbligatorio verso `startGame`. Copie e
congelamento non sono uniformi: alcune definizioni vengono clonate
profondamente, altre condividono ancora oggetti dell'Author che il congelamento
può modificare indirettamente.

L'Author vuole descrivere l'avventura con normali dati TypeScript modulari e
passarli direttamente a Fondale. Deve esistere un solo momento pubblico in cui
quei dati diventano una Game Session garantita dall'Engine, senza stati
pubblici intermedi parzialmente validati e senza effetti collaterali sui dati
dell'applicazione.

## Solution

Il Game Project pubblico diventa la struttura dichiarativa TypeScript scritta
dall'Author. Character, Object, Scene, Sequence, Noun, Command Lexicon e HUD
Theme restano descritti da type pubblici focalizzati, utilizzabili con
`satisfies` e organizzabili in file separati, ma tutti i builder pubblici
`defineX`, incluso `defineGame`, vengono rimossi.

`startGame` diventa l'unica operazione pubblica che avvia la validazione e la
compilazione del Game Project. La compilazione è interna e browser-independent:
Game Project coordina i validatori posseduti dalle Engine Capability, aggrega
gli Authoring Diagnostic con il loro owner e il loro path completo e interrompe
l'avvio quando il progetto è invalido.

Una compilazione riuscita applica i default e crea una copia privata
profondamente immutabile. La Game Session usa soltanto questa fotografia; i
dati dell'Author non vengono modificati o congelati e mutazioni successive non
cambiano una sessione già avviata. Ogni nuova chiamata a `startGame` legge e
compila nuovamente il Game Project ricevuto, producendo una fotografia
indipendente.

Dopo la compilazione, `startGame` valida l'eventuale Save Snapshot ricevuto
come dato non fidato, quindi procede con controlli browser, Runtime Asset e
creazione della Game Session. La rappresentazione compilata, i validatori e la
validazione separata dei Save Snapshot restano interni.

## User Stories

1. Come Author, voglio descrivere un Game Project con normali dati TypeScript, così da concentrarmi sull'avventura invece che su una sequenza di builder.
2. Come Author, voglio passare il Game Project direttamente a `startGame`, così da avere un solo percorso pubblico dall'authoring alla Game Session.
3. Come Author, voglio usare `satisfies GameProject`, così da ricevere il controllo statico senza trasformare i miei dati.
4. Come Author, voglio usare type focalizzati per Character, Object, Scene, Sequence, Noun, Command Lexicon e HUD Theme, così da mantenere ogni Game Definition in un file dedicato.
5. Come Author, voglio poter esportare e comporre Game Definition come normali costanti, così da usare i consueti strumenti del linguaggio TypeScript.
6. Come Author, voglio che la modularità dipenda dai file e dai type anziché dai builder, così da evitare funzioni che replicano la struttura dei dati.
7. Come Author, voglio che `startGame` verifichi tutte le invarianti locali delle Game Definition, così da non poter saltare accidentalmente una fase di validazione.
8. Come Author, voglio che `startGame` verifichi tutti i riferimenti tra registri, così da scoprire Character, Object, Scene, Sequence, Variable, Appearance e Animation mancanti prima del gioco.
9. Come Author, voglio ricevere Authoring Diagnostic aggregati, così da correggere più problemi del Game Project nello stesso ciclo di lavoro.
10. Come Author, voglio che ogni Authoring Diagnostic conservi l'Engine Capability owner, così da capire quale parte del contratto è stata violata.
11. Come Author, voglio path completi che iniziano dal registro del Game Project, così da localizzare direttamente la Game Definition invalida.
12. Come Author, voglio che una regola locale di Sequence mantenga un owner Sequence anche quando viene rilevata durante `startGame`, così da non attribuire tutto genericamente al browser o a Game Project.
13. Come Author, voglio che un Game Project semanticamente invalido venga rifiutato prima di qualunque mount, così da non lasciare DOM o risorse browser parziali.
14. Come Author, voglio che la validazione del Game Project preceda i controlli del browser e dei Runtime Asset, così da ricevere prima gli errori che posso correggere nell'authoring.
15. Come Author, voglio che gli errori indipendenti vengano aggregati e quelli dipendenti da dati già invalidi non producano rumore fuorviante, così da ottenere diagnostic utili.
16. Come Author, voglio che l'ordine degli Authoring Diagnostic sia deterministico, così da avere test e output di sviluppo stabili.
17. Come Author, voglio che i default del Game Project vengano applicati soltanto dopo una validazione riuscita, così da non mascherare definizioni invalide.
18. Come Author, voglio che Fondale crei una copia privata del Game Project, così da non trattenere riferimenti mutabili appartenenti alla mia applicazione.
19. Come Author, voglio che Fondale non congeli il Game Project originale, così da evitare effetti collaterali sorprendenti sui miei oggetti.
20. Come Author, voglio che modificare i dati originali dopo `startGame` non alteri la Game Session in corso, così da preservare Game State e determinismo.
21. Come Author, voglio poter usare lo stesso Game Project per avviare più Game Session, così che ogni sessione riceva una fotografia indipendente.
22. Come Author, voglio che una nuova chiamata a `startGame` ricompili i dati correnti, così che una modifica intenzionale precedente al nuovo avvio venga validata e osservata soltanto dalla nuova sessione.
23. Come Author, voglio passare a `startGame` un Save Snapshot deserializzato come `unknown`, così da non dover costruire prima un valore validato opaco.
24. Come Author, voglio che il Save Snapshot venga validato contro Project Identity e Project Version del progetto compilato, così da impedire restore incompatibili.
25. Come Author, voglio ricevere diagnostic strutturati per un Save Snapshot invalido, così da distinguere incompatibilità, forma non valida e stato impossibile.
26. Come Author, voglio che un Save Snapshot invalido venga rifiutato prima del mount, così da non creare una Game Session parziale.
27. Come Author, voglio continuare a creare Save Snapshot JSON-safe dalla Game Session, così da conservare il flusso di persistenza supportato.
28. Come Author, voglio importare ogni contratto pubblico dal package root, così da non dipendere dall'organizzazione interna delle capability.
29. Come Author, voglio che `AuthoringError` e `AuthoringDiagnostic` restino pubblici, così da poter presentare o registrare correttamente un fallimento di avvio.
30. Come Author, voglio una migrazione esplicita dai builder ai dati TypeScript, così da aggiornare un Game Project alpha senza dedurre il nuovo contratto dai tipi generati.
31. Come Author di Capri 1535, voglio che l'Example usi lo stesso percorso pubblico di un progetto esterno, così da verificare il contratto reale di Fondale.
32. Come Player, voglio che il nuovo authoring produca lo stesso comportamento visibile, così da non subire regressioni prive di valore di gameplay.
33. Come Player, voglio che una Game Session rimanga isolata dalle modifiche esterne ai dati del progetto, così da ottenere conseguenze deterministiche.
34. Come Player, voglio che Save e restore ricostruiscano esattamente il Game State supportato, così da continuare una partita senza alterazioni.
35. Come maintainer dell'Engine, voglio che ogni Engine Capability continui a possedere le proprie regole di validazione, così da preservare locality e responsabilità verticali.
36. Come maintainer dell'Engine, voglio che Game Project coordini la compilazione senza duplicare le regole delle capability, così da evitare un validatore centrale gigante.
37. Come maintainer dell'Engine, voglio che `startGame` inneschi la compilazione senza incorporarne l'implementazione nel browser adapter, così da mantenere separati dominio e integrazione tecnica.
38. Come maintainer dell'Engine, voglio una rappresentazione compilata privata, così da fornire a Game Session, Save e browser soltanto dati validi e immutabili.
39. Come maintainer dell'Engine, voglio continuare a distribuire viste strette della rappresentazione compilata, così da non trasformare il Game Project aggregato nell'interfaccia universale interna.
40. Come maintainer dell'Engine, voglio eliminare `defineCharacter`, `defineObject`, `defineScene`, `defineSequence`, `defineNoun`, `defineCommandLexicon`, `defineHUDTheme` e `defineGame`, così da rimuovere completamente il percorso pubblico precedente.
41. Come maintainer dell'Engine, voglio evitare shim e alias dei builder rimossi, così da mantenere un solo contratto durante la fase alpha.
42. Come maintainer dell'Engine, voglio che la compilazione raccolga i diagnostic prima di clonare e congelare, così da non creare rappresentazioni parzialmente valide.
43. Come maintainer dell'Engine, voglio che clonazione, default e congelamento avvengano in un unico percorso coerente, così da sostituire le strategie parziali e differenti dei builder attuali.
44. Come maintainer dell'Engine, voglio che URL e Runtime Asset mantengano il loro significato durante la copia difensiva, così da non corrompere i riferimenti necessari al browser.
45. Come maintainer dell'Engine, voglio che CoreSession consumi soltanto il progetto compilato, così da non dover rivalidare dati dell'Author durante il logical tick.
46. Come maintainer dell'Engine, voglio che Save validi dati non fidati usando viste strette del progetto compilato, così da mantenere la persistenza separata dal mezzo di storage.
47. Come maintainer dell'Engine, voglio che i controlli di target, WebGL e Runtime Asset restino successive fasi di startup, così da non attribuire regole tecniche alle capability di dominio.
48. Come maintainer dell'Engine, voglio che un fallimento in qualunque fase lasci il target pulito e le risorse rilasciate, così da conservare l'atomicità osservabile di `startGame`.
49. Come maintainer dell'Engine, voglio testare ogni invariante presso il modulo che la possiede, così da ottenere test precisi senza setup browser irrilevante.
50. Come maintainer dell'Engine, voglio testare la composizione interna separatamente, così da verificare aggregazione, path, default e copia difensiva in modo deterministico.
51. Come maintainer dell'Engine, voglio pochi test pubblici attraverso `startGame`, così da verificare il contratto completo senza replicare ogni regola locale nel browser.
52. Come maintainer dell'Engine, voglio evitare una nuova interface pubblica di compilazione o validazione headless senza un consumer concreto, così da mantenere piccola l'interface dell'Author.
53. Come maintainer dell'Engine, voglio aggiornare package root, Capri 1535, ricette, documentazione e test nello stesso incremento, così da non distribuire istruzioni incompatibili.
54. Come maintainer dell'Engine, voglio conservare il comportamento deterministico di CoreSession, Game State, Game Operation e Save Snapshot, così da limitare il cambiamento al percorso di authoring e startup.
55. Come agent che lavora sul repository, voglio trovare le invarianti vicino alla relativa Engine Capability, così da non dover ricostruire la validazione attraverso builder pubblici e browser.
56. Come agent che lavora sul repository, voglio che la spec distingua Game Project dichiarativo e rappresentazione compilata privata, così da collocare correttamente nuovi cambiamenti.

## Implementation Decisions

- ADR-0012 è la decisione architetturale normativa per il nuovo percorso di authoring e startup; ADR-0003 continua a definire l'authoring dichiarativo e ADR-0011 continua a definire l'ownership verticale per Engine Capability.
- `GameProject` indica il normale dato dichiarativo pubblico composto dall'Author. Il precedente valore pubblico opaco scompare; la rappresentazione validata e normalizzata rimane esclusivamente interna.
- Il precedente input strutturale del progetto confluisce nel type pubblico `GameProject`; non restano due nomi pubblici per distinguere input e risultato compilato.
- Restano pubblici i type focalizzati necessari a dichiarare separatamente Character, Object, Scene, Sequence, Noun, Command Lexicon, HUD Theme e gli altri valori di authoring.
- L'uso di `satisfies` è il percorso documentato per conservare contextual typing e controllo statico senza introdurre chiamate runtime durante gli import.
- Vengono rimossi dal package root e dalle capability tutti i builder pubblici `defineX`, incluso `defineGame`. Non vengono mantenuti shim, alias o percorsi deprecati.
- `startGame` riceve direttamente il Game Project dichiarativo e rimane l'unica operazione pubblica che avvia la sua validazione e compilazione.
- La compilazione del Game Project è un modulo interno browser-independent. Restituisce o tutti gli Authoring Diagnostic raccolti oppure una rappresentazione compilata valida; non usa eccezioni come risultato interno ordinario di validazione.
- Game Project coordina la validazione e aggrega i risultati; ogni Engine Capability possiede e mantiene le regole che richiedono la propria conoscenza.
- I validatori interni ricevono path contestualizzati dal progetto e restituiscono Authoring Diagnostic attribuiti alla capability responsabile.
- La validazione preserva le invarianti oggi garantite dai builder e dalla composizione globale. Il cambiamento non riduce la copertura semantica del Game Project.
- I diagnostic indipendenti vengono aggregati deterministicamente; i controlli che dipendono da una definizione o un riferimento già invalido vengono evitati quando non possono produrre informazione affidabile.
- Una compilazione valida applica gli stessi default supportati dal contratto corrente.
- Dopo la validazione, la compilazione crea una copia privata profonda e la congela profondamente. La copia conserva correttamente i valori speciali supportati dall'authoring, inclusi i riferimenti URL.
- La compilazione non modifica e non congela alcun oggetto appartenente all'Author.
- Ogni chiamata a `startGame` compila nuovamente il Game Project ricevuto. Non viene introdotta una cache basata sull'identità dell'oggetto pubblico.
- Game Session, Save e browser consumano viste strette derivate dalla rappresentazione compilata, non il Game Project mutabile dell'Author.
- L'ordine dello startup è: compilazione semantica del Game Project, validazione dell'eventuale Save Snapshot, controlli dell'ambiente e del target, caricamento e validazione dei Runtime Asset, creazione e mount della Game Session.
- Una fase fallita impedisce l'avvio delle fasi successive e conserva il comportamento di cleanup atomico del target e delle risorse già acquisite.
- L'opzione di startup per il restore accetta il Save Snapshot come `unknown`; Save lo valida internamente contro le viste del progetto compilato.
- La funzione pubblica di validazione preventiva del Save Snapshot e il relativo valore validato opaco vengono rimossi. La gestione Engine-owned dei Save Slot usa internamente la stessa validazione Save.
- `AuthoringError`, `AuthoringDiagnostic` e i relativi contratti pubblici restano disponibili per osservare i fallimenti di startup.
- Non viene introdotta una funzione pubblica headless per compilare o validare un Game Project. Una futura interface di tooling richiederà un consumer concreto e una decisione separata.
- La nuova compilazione non cambia il significato di Game State, Game Operation, Game Activity, CoreSession o Save Snapshot.
- Capri 1535, fixture, ricette, quick start, riferimento pubblico, guida di authoring, guida di migrazione e diagramma architetturale vengono aggiornati insieme al contratto.
- Le rimozioni pubbliche fanno parte della rottura alpha prevista per l'insieme coerente della release, senza compatibilità silenziosa con il precedente authoring.

## Testing Decisions

- Un buon test verifica una regola osservabile presso la seam più alta che rimane veloce e deterministica; non attraversa il browser quando la regola appartiene interamente a una capability pura.
- I validatori interni di World, Interaction, Sequence, Animation, Camera e HUD coprono direttamente tutte le invarianti locali precedentemente esercitate tramite i rispettivi builder.
- I test locali verificano il contenuto degli Authoring Diagnostic, inclusi code, owner e path relativo. Il test della dipendenza Cue da una direzione non-Animation appartiene al validatore interno Sequence.
- I test della compilazione interna esercitano più Game Definition insieme e verificano riferimenti trasversali, aggregazione, path completi, ordinamento deterministico, soppressione degli errori derivati e attribuzione alla capability corretta.
- I test della compilazione verificano tutti i default e provano che la rappresentazione valida risultante è profondamente immutabile.
- I test della copia difensiva provano che la compilazione non congela né modifica gli oggetti dell'Author e che mutazioni successive non alterano la rappresentazione compilata.
- I test provano che due compilazioni dello stesso oggetto producono fotografie indipendenti e che la seconda osserva soltanto le modifiche effettuate prima della propria compilazione.
- I test della copia includono registri, array, geometria, Appearance, Animation, Sequence nidificate, Noun, HUD Theme e riferimenti URL, così da eliminare le precedenti differenze tra clone profondi e parziali.
- I test pubblici importano soltanto dal package root e verificano che normali dati TypeScript soddisfino i type focalizzati e vengano accettati direttamente da `startGame`.
- Pochi test pubblici di startup verificano che un Game Project invalido produca `AuthoringError`, esponga diagnostic aggregati con path completi e lasci il target intatto.
- I test di startup verificano l'ordine delle fasi dimostrando che un errore semantico impedisce controlli e side effect successivi osservabili.
- I test Save coprono snapshot valido, forma malformata, Project Identity errata, Project Version incompatibile, Game State invalido e restore esatto attraverso l'opzione `snapshot` di `startGame`.
- I test browser continuano a coprire target occupato, WebGL, Runtime Asset, primo frame, stop e cleanup, senza duplicare ogni invariante locale delle capability.
- I test CoreSession continuano a coprire tick, Game Activity, Game State, effetti difensivi e restore usando la rappresentazione compilata interna prevista dal nuovo flusso.
- I test di struttura verificano che il compilatore coordini soltanto le interface interne delle capability e che il browser adapter non diventi proprietario della validazione.
- I test e i controlli documentali verificano che gli export pubblici, gli Example e la documentazione non contengano più chiamate o istruzioni relative ai builder rimossi o alla validazione preventiva pubblica dei Save Snapshot.
- La suite completa di build e browser rimane il criterio di accettazione finale.

## Out of Scope

- Aggiungere una interface pubblica headless per validare o compilare un Game Project.
- Aggiungere un editor visuale, authoring no-code, code generation o un formato di configurazione esterno a TypeScript.
- Rendere il Game Project un input runtime `unknown` con una nuova validazione generica di schema; il contratto pubblico rimane TypeScript-first e la compilazione preserva le garanzie semantiche concordate.
- Introdurre branding pubblico per singole Game Definition o per la rappresentazione compilata.
- Conservare builder `defineX`, shim, alias o deprecazioni compatibili con il vecchio percorso.
- Esporre la rappresentazione compilata o le viste interne alle applicazioni consumer.
- Introdurre una cache globale o per identità del Game Project compilato.
- Cambiare le regole di gameplay, la semantica delle Engine Capability o il comportamento visibile di Capri 1535.
- Ridisegnare CoreSession, Game State, Game Operation, Game Activity o il formato logico del Save Snapshot oltre a quanto necessario per il nuovo ingresso di startup.
- Cambiare PixiJS, DOM, localStorage, Support Baseline o tecnologia di caricamento dei Runtime Asset.
- Aggiungere nuove Engine Capability.
- Pubblicare una versione npm intermedia in cui builder e nuovo contratto convivono.

## Further Notes

- Il glossario corrente definisce già Game Project come la raccolta autonoma di contenuti, impostazioni e comportamenti dell'avventura; non serve un nuovo termine di dominio per la rappresentazione compilata privata.
- “Compiled Game Project” è una descrizione d'implementazione e non entra nell'ubiquitous language pubblico.
- La decisione sostituisce esplicitamente il precedente requisito della spec architetturale che manteneva i builder focalizzati, senza contraddire la scelta dell'authoring dichiarativo.
- Il repository contiene modifiche in corso nella migrazione capability-owned. L'implementazione deve preservarle e integrare il nuovo flusso lungo le interface interne già emerse, senza ripristinare organizzazioni precedenti.
- Questa spec è pronta per essere scomposta in tracer-bullet ticket con blocking edges espliciti.
