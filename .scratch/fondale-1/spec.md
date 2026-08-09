# Fondale 1.0

Status: ready-for-human

## Problem Statement

Un Author può oggi osservare una vertical slice di Capri 1535, ma non dispone
ancora di un Engine stabile, documentato e distribuibile con cui costruire una
piccola avventura completa in un Game Project indipendente. La codebase attuale
mescola contenuto del prototipo, accesso diretto a PixiJS, costanti specifiche
di Capri e hook interni di verifica; non costituisce quindi un'interface
pubblica riutilizzabile né una promessa di compatibilità.

Fondale 1.0 deve trasformare l'evidenza della vertical slice in un Engine
web-native TypeScript-first. Un Author deve poter dichiarare il mondo e i suoi
comportamenti mirati senza modificare gli interni dell'Engine, installare il
pacchetto in un progetto esterno, produrre una build statica e distribuire una
breve avventura completa. Il contratto stabile deve restare deliberatamente
piccolo: entra nella Versione 1 soltanto ciò che l'Example di accettazione
esercita e verifica.

## Solution

Fondale 1.0 viene distribuito con licenza MIT come
`@asterixcapri/fondale`. Espone dalla sola radice un'interface pubblica
dichiarativa per comporre un Game Project validato e immutabile, avviare una
Game Session da uno stato iniziale o da un Save Snapshot validato, osservare e
arrestare la sessione e gestire Save Snapshot e ripristino senza accedere allo
stato mutabile o al renderer.

L'Engine possiede runtime deterministico, rendering WebGL, navigazione,
interazioni, Sequence, Inventory, validazione e diagnostica. PixiJS e gli
algoritmi interni rimangono nascosti dietro moduli profondi. Un Game Project
possiede invece contenuto, asset PNG, Game Setting, Game Behavior mirati,
applicazione, storage dei salvataggi e processo di build.

La Versione 1 viene accettata attraverso un Example esterno di due Scene che
installa il pacchetto distribuibile e completa un'avventura dall'inizio allo
stato finale usando esclusivamente l'interface pubblica. L'Example esercita
navigazione, profondità, interazione contestuale, Sequence con Choice,
Inventory, Game Behavior, Save Snapshot durante una Choice, ripristino esatto e
passaggio finale. Chrome desktop corrente, mouse per il mondo e tastiera per
HUD, Line e Choice costituiscono la Support Baseline verificata.

## User Stories

1. Come Author, voglio installare `@asterixcapri/fondale` in un progetto TypeScript indipendente, così da costruire un'avventura senza copiare il codice dell'Engine.
2. Come Author, voglio importare tutti i simboli pubblici dalla sola radice del pacchetto, così da non dipendere dall'organizzazione interna di Fondale.
3. Come Author, voglio usare Fondale senza importare o configurare PixiJS, così da restare indipendente dal renderer scelto dall'Engine.
4. Come Author, voglio descrivere il mio Game Project con Game Definition dichiarative, così da ottenere contenuto leggibile e validabile.
5. Come Author, voglio usare helper tipizzati per le definizioni radice, così da ricevere inferenza, default e controlli locali durante l'authoring.
6. Come Author, voglio comporre registri nominati di Scene, Character, Object, Sequence e Game Variable, così da riferire gli elementi con identità stabili.
7. Come Author, voglio che la chiave di un registro costituisca l'identità della definizione, così da non duplicare campi identificativi.
8. Come Author, voglio ottenere da `defineGame` un Game Project opaco, immutabile e validato, così da non poter creare accidentalmente stati parziali.
9. Come Author, voglio adattare le Engine Capability tramite pochi Game Setting, così da personalizzare il progetto senza sostituire i sistemi dell'Engine.
10. Come Author, voglio aggiungere un Game Behavior TypeScript soltanto quando i dati dichiarativi non bastano, così da mantenere locale la logica specifica dell'avventura.
11. Come Author, voglio che un Game Behavior riceva soltanto letture e Game Operation controllate, così da non dipendere da DOM, renderer o stato mutabile.
12. Come Author, voglio avviare una nuova Game Session in un elemento HTML scelto dal mio progetto, così da integrare Fondale nella mia applicazione web.
13. Come Author, voglio avviare una Game Session da un Save Snapshot validato, così da offrire il caricamento senza ricostruire manualmente lo stato.
14. Come Author, voglio poter arrestare esplicitamente una Game Session, così da rilasciare input, clock, renderer e risorse.
15. Come Author, voglio possedere applicazione, asset, storage e build del mio Game Project, così da integrare Fondale senza adottare strumenti imposti dall'Engine.
16. Come Author, voglio scegliere una Logical Resolution unica per il progetto, così da comporre tutte le Scene e il HUD sulla stessa tela logica.
17. Come Player, voglio che il quadro mantenga le proprie proporzioni su una finestra desktop, così da non vedere immagini deformate o tagliate.
18. Come Player, voglio che il quadro venga centrato con letterbox quando il target ha proporzioni diverse, così da vedere sempre l'intera Scene.
19. Come Author, voglio usare il profilo visivo `pixel`, così da preservare la resa nearest-neighbour della pixel art.
20. Come Author, voglio che ogni Scene coincida con l'intero quadro logico, così da progettare luoghi senza dipendere da camera, panning o zoom.
21. Come Author, voglio dichiarare un Background delle dimensioni esatte della Logical Resolution, così da conoscere senza ambiguità la base visiva della Scene.
22. Come Author, voglio collocare Scenery, Character e Object nello Scene Space, così da comporre il mondo con coordinate logiche indipendenti dallo schermo.
23. Come Player, voglio che Character, Object e Scenery si ordinino coerentemente in profondità, così da percepire chi passa davanti o dietro agli elementi del mondo.
24. Come Author, voglio usare Ground Point, Visual Anchor e Baseline, così da controllare posizione e profondità senza manipolare nodi grafici.
25. Come Author, voglio dichiarare una Perspective Scale della Scene, così da far variare automaticamente la dimensione di Character e Object con la profondità.
26. Come Author, voglio assegnare Appearance nominati a Character, Object e Scenery, così da cambiare la loro presentazione attraverso il Game State.
27. Come Player, voglio che un cambio di Appearance sopravviva a Save Snapshot e ripristino, così da ritrovare il mondo nello stesso stato visivo semantico.
28. Come Author, voglio fornire una camminata direzionale basilare per un Character, così da rappresentare movimento laterale, frontale e posteriore.
29. Come Author, voglio riferire direttamente asset PNG tramite URL risolvibili dal browser, così da lasciare al mio bundler la gestione concreta dei file.
30. Come Author, voglio che Fondale carichi e validi tutti gli asset richiesti prima dell'avvio, così da non ottenere una sessione giocabile a metà.
31. Come Author, voglio ricevere diagnostiche contestuali per asset mancanti, indecodificabili o dimensionalmente errati, così da correggere il progetto.
32. Come Author, voglio che un avvio fallito rimuova ogni montaggio parziale, così da poter gestire l'errore senza residui dell'Engine nell'applicazione.
33. Come Author, voglio descrivere l'area esplorabile di ogni Scene con una Walkable Region statica, così da separare la geometria di gioco dalla pittura del Background.
34. Come Player, voglio che un click fuori dall'area percorribile venga ricondotto al punto raggiungibile più vicino, così da ottenere un movimento utile senza teletrasporto.
35. Come Player, voglio che il Character non attraversi mai i limiti della Walkable Region, così da mantenere credibile la navigazione.
36. Come Author, voglio dichiarare un Approach Point e un orientamento per ogni bersaglio, così da stabilire dove una Interaction può avvenire.
37. Come Player, voglio che un bersaglio irraggiungibile termini l'intento senza causare un errore, così da poter continuare a giocare normalmente.
38. Come Player, voglio che un nuovo Player Intent sostituisca quello ancora in corso, così da poter cambiare idea immediatamente.
39. Come Author, voglio collegare due Scene con un Scene Passage diretto a una Scene Entrance nominata, così da descrivere attraversamenti espliciti.
40. Come Player, voglio che il cambio di Scene aggiorni destinazione, posizione e orientamento in un solo passaggio, così da non osservare stati intermedi incoerenti.
41. Come Author, voglio rendere interattivo un elemento della Scene tramite un Hotspot locale, così da separare la superficie cliccabile dall'identità del contenuto.
42. Come Author, voglio attivare o disattivare un Hotspot attraverso condizioni dichiarative, così da controllare quando riceve e pubblicizza Player Intent.
43. Come Player, voglio vedere una Primary Action significativa quando nessun Object è selezionato, così da capire cosa accadrà interagendo col bersaglio.
44. Come Author, voglio dichiarare Interaction Case condizionali in ordine, così da controllare quale risposta si applica allo stato corrente.
45. Come Player, voglio ricevere sempre una Interaction Response percepibile, così da non interpretare un silenzio come un malfunzionamento.
46. Come Author, voglio esprimere le condizioni comuni come dati validabili, così da evitare Game Behavior inutili per i casi semplici.
47. Come Author, voglio usare una Game Variable booleana per il progresso specifico dell'avventura non già rappresentato dall'Engine, così da modellare un fatto narrativo minimo.
48. Come Author, voglio raggruppare più Game Operation in una transizione atomica, così da evitare modifiche parziali del mondo.
49. Come Author, voglio che ogni Game Operation veda il risultato delle precedenti nello stesso gruppo, così da ottenere un ordine causale prevedibile.
50. Come Author, voglio che un'operazione invalida annulli l'intero gruppo, così da non lasciare il Game State in una condizione incoerente.
51. Come Author, voglio che un Game Behavior sia sincrono e deterministico, così da poterlo verificare senza rete, timer o stato esterno mutabile.
52. Come Player, voglio che una Interaction venga rivalutata dopo l'arrivo sull'ultimo stato committed, così da non eseguire una risposta diventata obsoleta durante il movimento.
53. Come Author, voglio modellare un Object persistente come presente in una Scene, posseduto nell'Inventory o terminalmente consumato, così da avere una sola collocazione canonica.
54. Come Player, voglio raccogliere un Object attraverso una normale Primary Action, così da ricevere la stessa navigazione e risposta delle altre interazioni.
55. Come Player, voglio vedere nell'Inventory gli Object nell'ordine di acquisizione, così da ritrovarli in una sequenza stabile.
56. Come Player, voglio selezionare un Object nell'Inventory con mouse o tastiera, così da usarlo sul mondo con il dispositivo previsto dalla Support Baseline.
57. Come Player, voglio che selezionare un altro Object sostituisca la selezione precedente, così da avere sempre un solo Inventory Use attivo.
58. Come Player, voglio deselezionare un Object riattivandolo o premendo `Escape`, così da tornare alla Primary Action.
59. Come Player, voglio che la selezione attraversi i cambi di Scene, così da poter portare un intento d'uso in un altro luogo.
60. Come Player, voglio che un uso fallito conservi Object e selezione, così da poter tentare un altro bersaglio.
61. Come Player, voglio che un uso riuscito termini la selezione, così da ricevere un esito coerente e inequivocabile.
62. Come Author, voglio ricollocare nella Scene l'Object selezionato attraverso un'operazione controllata, così da rappresentarne l'uso nel mondo.
63. Come Author, voglio consumare terminalmente l'Object selezionato attraverso un'operazione controllata, così da rappresentare un uso irreversibile senza variabili duplicate.
64. Come Author, voglio fornire un Inventory Appearance distinto dall'Appearance nel mondo, così da rendere l'Object leggibile nel HUD e nel cursore.
65. Come Author, voglio scegliere una Inventory Appearance Size quadrata condivisa dal progetto, così da produrre PNG già corretti senza ridimensionamento implicito.
66. Come Player, voglio che Inventory, cursore e mondo vengano adattati insieme allo schermo, così da conservare proporzioni coerenti.
67. Come Author, voglio dichiarare una Sequence nominata e finita, così da rappresentare una conversazione controllata e ripristinabile.
68. Come Player, voglio avanzare manualmente ogni Line, così da controllare il ritmo della lettura.
69. Come Author, voglio distinguere una Line pronunciata da un Character dalla narrazione, così da attribuire chiaramente il testo.
70. Come Player, voglio scegliere fra alternative finite durante una Choice, così da influenzare il percorso della Sequence.
71. Come Player, voglio vedere soltanto le alternative eleggibili nello stato corrente, così da non ricevere opzioni disabilitate o ingannevoli.
72. Come Author, voglio fornire un fallback per ogni Choice, così da evitare una Sequence bloccata senza alternative.
73. Come Author, voglio diramare una Sequence attraverso condizioni dichiarative con fallback, così da adattare la conversazione al Game State.
74. Come Author, voglio applicare gruppi atomici di Game Operation come passi della Sequence, così da modificare il mondo in punti determinati del copione.
75. Come Player, voglio che una Sequence sia modale e ignori gli altri Player Intent, così da non sovrapporre movimento e Line o Choice.
76. Come Player, voglio che al termine della Sequence il controllo torni al gioco, così da continuare l'esplorazione.
77. Come Author, voglio che il progresso esatto di Line e Choice appartenga al Game State, così da poter salvare durante una conversazione.
78. Come Author, voglio creare un Save Snapshot dall'ultimo Game State committed, così da non serializzare transizioni parziali.
79. Come Author, voglio ricevere un Save Snapshot JSON-safe, così da conservarlo con lo storage scelto dal mio Game Project.
80. Come Author, voglio identificare il Game Project nei salvataggi con Project Identity e Project Version, così da rifiutare dati appartenenti a giochi o compatibilità diverse.
81. Come Author, voglio che Fondale possieda una versione del formato di Save Snapshot, così da riconoscere snapshot non interpretabili dalla release corrente.
82. Come Author, voglio validare come `unknown` ogni dato recuperato dallo storage, così da non fidarmi di contenuti esterni corrotti o manipolati.
83. Come Author, voglio ricevere un esito esplicito quando un Save Snapshot è invalido, così da gestire un errore prevedibile senza eccezioni di programmazione.
84. Come Author, voglio che un Save Snapshot incompatibile venga rifiutato senza riparazioni o nuova partita silenziosa, così da non perdere progresso senza spiegazione.
85. Come Player, voglio riprendere la stessa Game Activity dopo il caricamento, così da non perdere o ripetere operazioni già avvenute.
86. Come Player, voglio che una Choice ripristinata presenti le stesse alternative e lo stesso progresso, così da continuare esattamente dal punto salvato.
87. Come Author, voglio che slot, UI e storage restino responsabilità del Game Project, così da scegliere liberamente l'esperienza dei Save Snapshot.
88. Come Maintainer, voglio che gli stessi input e passi logici producano gli stessi stati committed, così da verificare il comportamento indipendentemente dal frame rate.
89. Come Player, voglio che una scheda sospesa riprenda senza recuperare in blocco il tempo trascorso, così da evitare salti improvvisi della simulazione.
90. Come Author, voglio che ogni invalidità indichi codice, famiglia, percorso e spiegazione, così da localizzare e correggere il problema.
91. Come Author, voglio ricevere tutte le diagnostiche indipendenti in ordine stabile, così da correggere più errori in un solo ciclo.
92. Come Author, voglio che Fondale sopprima gli errori puramente conseguenti, così da non essere sommerso da una cascata artificiale.
93. Come Author, voglio che Fondale rifiuti soltanto ciò che può dimostrare invalido, così da non vietare contenuti insoliti ma legittimi.
94. Come Author, voglio che Fondale non emetta warning ambigui nella Versione 1, così da sapere che ogni segnalazione richiede un'azione.
95. Come Author, voglio una guida iniziale che porti da un progetto TypeScript esterno alla prima Scene, così da iniziare senza conoscere gli interni.
96. Come Author, voglio una guida concettuale basata sul linguaggio di Fondale, così da comprendere Game Project, Game State, Game Activity e Scene Space.
97. Come Author, voglio ricette focalizzate e compilate per ogni Engine Capability principale, così da imparare un caso alla volta usando codice verificato.
98. Come Author, voglio un riferimento completo di ogni export e struttura pubblica, così da conoscere scopo, invarianti, default, errori ed esempi.
99. Come Author, voglio costruire l'Example usando soltanto la documentazione distribuita, così da sapere che il pacchetto è realmente utilizzabile dall'esterno.
100. Come Player, voglio completare l'Example dall'inizio allo stato finale, così da vedere tutte le Engine Capability della Versione 1 comporsi in una breve avventura.
101. Come Player, voglio usare il mouse per il mondo e la tastiera per HUD, Line e Choice, così da usufruire della Support Baseline dichiarata.
102. Come Player, voglio percorrere il HUD con `Tab` e `Shift+Tab` e attivare un controllo con `Enter` o `Space`, così da usare l'Inventory senza mouse.
103. Come Player, voglio avanzare una Line con `Enter` o `Space` e navigare una Choice con le frecce, così da controllare interamente la Sequence da tastiera.
104. Come Player, voglio che il focus entri automaticamente nella Choice e torni al controllo precedente al termine, così da non dover riattivare manualmente la tastiera.
105. Come Player, voglio che focus e Object selezionato siano indicati anche senza affidarsi soltanto al colore, così da distinguere chiaramente lo stato corrente.
106. Come Author, voglio conoscere con precisione le esclusioni della Support Baseline, così da non interpretare Chrome corrente come promessa multi-browser o conformità generale.
107. Come Maintainer, voglio che ogni cambiamento superi type-check, build e prove deterministiche rapide, così da individuare presto le regressioni.
108. Come Maintainer, voglio verificare l'Example contro il pacchetto realmente distribuibile, così da impedire che import interni nascondano un contratto incompleto.
109. Come Maintainer, voglio che Playwright usi mouse e tastiera reali attraverso l'interface pubblica, così da dimostrare il comportamento osservabile del prodotto.
110. Come Maintainer, voglio trattare un test intermittente come fallimento, così da non pubblicare una release sulla base di un nuovo tentativo fortunato.
111. Come Maintainer, voglio controlli automatici sul layout e una breve revisione visiva prima del rilascio, così da rilevare problemi grafici senza imporre uguaglianza pixel-perfect.
112. Come Maintainer, voglio trattare una regressione sull'ultima Chrome stabile come bug di Fondale, così da mantenere nel tempo la Support Baseline dichiarata.

## Implementation Decisions

### Prodotto, pacchetto e responsabilità

- Fondale 1.0 è un Engine web-native open source con licenza MIT, distribuito
  come `@asterixcapri/fondale` per Game Project TypeScript anche in repository
  indipendenti.
- Il pacchetto espone una sola interface pubblica dalla radice e include codice
  eseguibile, tipi e documentazione. Import profondi, tipi PixiJS e altri
  interni non appartengono al contratto.
- PixiJS può restare una dipendenza posseduta dall'implementazione del renderer,
  ma il Game Project non lo importa, configura o osserva.
- Il Game Project possiede applicazione, asset, storage dei Save Snapshot e
  build. Fondale non introduce scaffolding, CLI, plugin o un proprio sistema di
  distribuzione dei giochi.
- L'Example Capri 1535 resta nello stesso repository come consumer separato,
  ma deve installare l'artefatto distribuibile e comportarsi come un progetto
  esterno: nessun import interno o accesso ai sorgenti dell'Engine.
- La vertical slice esistente è evidenza e prior art, non un'interface da
  stabilizzare. Le costanti artistiche, gli script di produzione e i tipi
  attuali specifici di Capri non diventano automaticamente pubblici.

### Example di accettazione

- L'Example è il più piccolo Game Project completo che stabilizza Fondale 1.0;
  una capacità non esercitata non entra nel contratto per completezza futura.
- Un progetto TypeScript esterno installa il pacchetto distribuibile, avvia una
  nuova partita e permette al Player di esplorare due Scene collegate da un
  Scene Passage.
- Il percorso muove un Character in una Walkable Region e rende percepibili
  profondità e Perspective Scale rispetto a una Scenery.
- Il Player raggiunge un Hotspot attraverso il suo Approach Point ed esegue una
  Primary Action.
- Una conversazione avvia una Sequence finita con Line, Choice, condizioni e
  Game Operation e cambia una volta l'Appearance statico di un Character.
- Il Player raccoglie un Object, lo seleziona nell'Inventory e tenta un
  Inventory Use invalido che conserva la selezione.
- Un Inventory Use valido cambia una Game Variable booleana, cambia gli
  Appearance dell'Object e di una Scenery, ricolloca l'Object e rende
  disponibile il passaggio finale.
- Il percorso esercita un piccolo Game Behavior sincrono attraverso lo stesso
  contesto ristretto delle operazioni dichiarative.
- Durante la Choice, il Game Project crea un Save Snapshot, arresta la sessione,
  valida lo snapshot e avvia una nuova sessione che riprende la stessa attività
  dominante.
- Il Player attraversa il passaggio finale e raggiunge uno stato osservabile
  che conclude l'Example.

### Interface pubblica di authoring

- `defineGame` e `startGame`, insieme ai soli helper richiesti dall'Example,
  formano l'interface pubblica principale.
- Helper come `defineScene`, `defineCharacter`, `defineObject` e l'equivalente
  per `Sequence` offrono inferenza, default e validazione locale. `Scenery` e
  `Hotspot` restano definizioni inline nella Scene che li possiede.
- `defineGame` compone registri nominati. Le chiavi sono identità, l'ordine dei
  registri non ha semantica e non si ripete un campo identificativo.
- Il risultato è un Game Project opaco, immutabile e validato che contiene
  definizioni, Game Setting e stato iniziale canonico.
- I Game Behavior sono callback sincrone collocate sull'elemento pertinente.
  Ricevono un contesto temporaneo di letture di dominio e Game Operation
  controllate; non ricevono Game State grezzo, DOM, renderer, input, lifecycle
  o accesso mutabile.
- I dati dichiarativi e serializzabili rimangono distinti dalle callback. Non
  esistono ereditarietà da classi interne, registri pubblici di sistemi o
  operazioni estensibili dal Game Project.
- `startGame` riceve un Game Project, un target HTML libero e, in alternativa
  allo stato iniziale, un Save Snapshot già validato. L'avvio è asincrono e
  restituisce la Game Session soltanto quando la prima Scene è pronta.
- La Game Session espone soltanto le operazioni pubbliche richieste
  dall'Example, compresa la creazione di un Save Snapshot e `stop()` idempotente
  e terminale. Lo stato mutabile e i dettagli del lifecycle restano interni.

### Runtime, stato e lifecycle

- Ogni Game Session è l'unica autorità sul proprio Game State. Renderer, input,
  navigazione e asset non possiedono copie canoniche concorrenti.
- Il Game State conserva tutti e soli i fatti necessari a riprodurre
  deterministicamente il progresso: Scene corrente; stato, collocazione,
  orientamento e Appearance di entità e Scenery; Inventory e selezione; Game
  Variable; progresso dell'eventuale Game Activity dominante.
- Definizioni, asset decodificati, geometrie e percorsi derivati, oggetti del
  renderer, interpolazione visiva ed effetti già realizzati non appartengono al
  Game State.
- Input, clock e Game Behavior producono Game Operation validate. Un gruppo
  evolve uno stato transazionale provvisorio, ogni operazione vede le
  precedenti e un singolo commit pubblica il nuovo snapshot e i relativi
  effetti.
- Un'operazione invalida o un Game Behavior che lancia non produce commit
  parziali. Dopo l'avvio, un errore non recuperabile porta la sessione nello
  stato terminale `failed` con Authoring Diagnostic contestuali.
- Il tempo logico avanza a passo fisso. A parità di Game Project, Game State,
  input ordinati e passi, il core produce gli stessi stati committed ed
  effetti indipendentemente dal frame rate.
- Una scheda sospesa riprende dal passo logico successivo senza recuperare in
  blocco il tempo reale trascorso.
- Esiste al massimo una Game Activity dominante. Un nuovo Player Intent
  sostituisce quello in corso; una Sequence governa temporaneamente input e
  avanzamento.
- Un cambio di Scene è transazionale: la vecchia Scene resta canonica durante
  la preparazione e un solo commit aggiorna Scene, posa e orientamento. Un
  errore prima del commit conserva lo stato precedente e fallisce la sessione.
- `stop()` interrompe clock e attività, scollega input e renderer e rilascia le
  risorse. Una sessione arrestata non riparte.

### Rendering e Scene Space

- Il renderer WebGL è un modulo interno profondo. Riceve Game Definition
  validate, snapshot committed ed effetti; non modifica il Game State.
- Ogni Game Project dichiara una sola Logical Resolution, condivisa da tutte le
  Scene e dagli overlay posseduti dall'Engine.
- Fondale 1.0 espone soltanto il profilo `pixel`: nearest-neighbour e massimo
  fattore intero quando possibile. Se il target è più piccolo della Logical
  Resolution, l'intero quadro viene comunque ridotto uniformemente senza crop.
- Il quadro viene centrato nel target con letterbox e senza deformazioni. Il
  colore del letterbox è un Game Setting con nero come default.
- Ogni Scene coincide con l'intero quadro e usa uno Scene Space in pixel logici
  con origine in alto a sinistra. Camera, panning e zoom non esistono nella
  Versione 1.
- Il Background copre esattamente la Logical Resolution. Dimensioni diverse
  sono un errore, non vengono corrette implicitamente.
- Le primitive visive sono Background, Scenery, Character e Object. Hotspot e
  geometria non sono primitive visive.
- Una Scenery può usare un PNG autonomo oppure una regione poligonale ritagliata
  dal Background. La regione riusa i pixel già caricati e la Baseline continua
  a governarne l'ordine nel mondo.
- La composizione comprende Background, mondo ordinato in profondità e overlay
  dell'Engine per cursore, Line, Choice e HUD.
- Character e Object usano Ground Point e Visual Anchor; Scenery usa Baseline.
  La profondità verticale determina l'ordine. I pareggi sono deterministici ma
  non hanno semantica autoriale.
- Una Scene può dichiarare una Perspective Scale a fermate interpolate. In sua
  assenza la scala vale `1`. Viene applicata automaticamente a Character e
  Object, non alle Scenery dimensionate dall'Author.
- Appearance è una scelta semantica nominata. La selezione appartiene al Game
  State, mentre file, frame e oggetti grafici restano transitori.
- La sola animazione pubblica è la camminata direzionale basilare del Character.
  Animazioni ambientali generiche, narrative o in streaming sono escluse.

### Scene, navigazione e attraversamento

- Ogni Scene della Versione 1 dichiara una sola Walkable Region poligonale
  statica nello Scene Space. Ostacoli dinamici e regioni multiple sono esclusi.
- Geometria di navigazione e composizione visiva sono indipendenti. Il
  pathfinding è interno e non espone griglie, navmesh o algoritmo.
- Un click sul suolo richiede una destinazione. Se è esterna o disconnessa,
  Fondale sceglie deterministicamente il punto raggiungibile geometricamente
  più vicino senza attraversare bordi e senza teletrasporto.
- Ogni bersaglio della Versione 1 ha un solo Approach Point formato da Ground
  Point e orientamento finale. L'Interaction inizia soltanto dopo arrivo e
  orientamento.
- Se un bersaglio è irraggiungibile o non più valido, il Player Intent termina
  come esito normale senza Interaction. Un nuovo intento sostituisce quello in
  corso.
- Un Scene Passage nomina una Scene di destinazione e una Scene Entrance con
  posa e orientamento. I passaggi sono direzionali; il ritorno richiede una
  definizione distinta.
- La transizione sospende l'input e conclude in un unico commit. Nessun percorso
  viene trasportato nella nuova Scene.

### Interazioni, condizioni e operazioni

- Primary Action e Inventory Use condividono il modello Interaction ma restano
  forme distinte e leggibili nell'authoring.
- Un Hotspot è una superficie senza identità propria, locale alla Scene, che
  rende interattivo Background, Scenery, Character o Object presente.
- Un Hotspot inattivo non riceve input e non viene pubblicizzato dal HUD.
- Ogni forma di Interaction dichiara Interaction Case in ordine; il primo caso
  eleggibile vince. Un fallback garantisce sempre una Interaction Response
  testuale o visiva percepibile.
- Le condizioni pubbliche sono soltanto quelle esercitate dall'Example,
  comprese Game Variable booleane e possesso di Object. Composizioni più
  generali non vengono anticipate.
- Il registro delle Game Variable della Versione 1 contiene soltanto booleani
  per fatti specifici dell'avventura non già rappresentati da una Engine
  Capability.
- Il Player Intent conserva bersaglio e Object selezionato. L'Interaction viene
  rivalutata sull'ultimo stato committed dopo l'arrivo.
- Un gruppo di Game Operation può aggiornare la Game Variable esercitata,
  cambiare Appearance, muovere un Object attraverso le operazioni contestuali
  dell'Inventory e avviare una Sequence. Non esiste scrittura generica sullo
  stato.
- Ogni Interaction Case sceglie una lista dichiarativa di operazioni oppure un
  Game Behavior, non entrambe.
- I Game Behavior non possono usare Promise, timer, casualità globale, rete o
  stato esterno mutabile. Fondale non li sandboxa, ma ne restringe il contesto e
  ne rende osservabili errori e operazioni.

### Sequence, Line e Choice

- Una Sequence è una definizione radice nominata, finita, modale e strettamente
  sequenziale. Si avvia mediante una Game Operation ed è la Game Activity
  dominante.
- I passi pubblici sono Line, Choice, diramazione condizionale e gruppo ordinato
  di Game Operation.
- Una Line contiene testo e un Character facoltativo; senza Character è
  narrazione. Resta visibile finché il Player la avanza manualmente.
- Una Choice presenta nell'ordine dichiarato soltanto le alternative eleggibili
  nello snapshot committed. Un fallback obbligatorio appare quando nessun'altra
  alternativa è disponibile.
- Una diramazione sceglie il primo caso eleggibile e richiede un fallback.
- Ogni alternativa prosegue con una lista finita. Cicli, ritorni, Sequence
  annidate o richiamate e copioni asincroni non sono validi.
- Durante una Sequence, Fondale accetta soltanto avanzamento della Line o
  selezione della Choice; gli altri Player Intent vengono scartati e non
  accodati.
- Ogni gruppo di operazioni produce il proprio commit. La Sequence intera non è
  una transazione e non annulla commit precedenti se un passo futuro fallisce.
- Il Game State conserva identità della Sequence, percorso strutturale e Line o
  Choice attiva, consentendo il ripristino esatto senza rieseguire operazioni.
- Al termine la Game Activity si chiude e il controllo torna al Player.

### Inventory e Object

- Ogni Object è persistente e si trova sempre in una sola collocazione
  canonica: presente in una Scene a un Ground Point, posseduto nell'Inventory o
  terminalmente consumato.
- Ogni Object parte in una Scene. Non può partire nell'Inventory o consumato.
- La raccolta è una Primary Action con risposta percepibile e un'operazione
  contestuale che sposta l'Object bersaglio nell'Inventory.
- Fondale offre operazioni contestuali per raccogliere il bersaglio, collocare
  nella Scene corrente l'Object selezionato o consumarlo terminalmente. Non
  esiste una scrittura arbitraria della collocazione.
- L'Inventory mantiene l'ordine di acquisizione. Una nuova raccolta aggiunge in
  fondo; selezione e usi falliti non cambiano l'ordine.
- L'HUD elenca gli Object, evidenzia l'unico selezionato e usa il suo Inventory
  Appearance come cursore dell'Inventory Use. Layout e stile non sono Game
  Setting nella Versione 1.
- Attivare un Object non selezionato lo seleziona; riattivarlo o premere
  `Escape` lo deseleziona. Selezionare un altro Object sostituisce il primo.
- La selezione appartiene al Game State, attraversa le Scene e sopravvive a uso
  fallito, bersaglio irraggiungibile o intento annullato. Un click generico nel
  mondo non la cancella.
- Cambiare selezione durante un Player Intent termina normalmente quell'intento.
  Perdere l'Object dall'Inventory elimina sempre la selezione.
- Senza selezione si risolve la Primary Action; con selezione si risolve
  l'Inventory Use per quell'identità.
- Successo e fallimento dell'Inventory Use sono espliciti e separati dalle
  operazioni. Il successo termina la selezione; il fallimento la conserva e non
  può collocare o consumare l'Object.

### Asset visivi

- Il Game Project fornisce soltanto PNG riferiti direttamente tramite URL
  risolvibili dal browser. Fondale non espone manifest, cartella base o registro
  globale degli asset.
- Un pixel del PNG corrisponde a un pixel logico prima delle trasformazioni
  della composizione. Fondale non ridimensiona, ritaglia o ricampiona asset
  singoli per correggerli.
- Background deve coincidere con la Logical Resolution. Appearance statici
  possono dichiarare un Visual Anchor, con default al centro del bordo
  inferiore e sempre interno all'immagine.
- Character, Object e Scenery dichiarano Appearance nominati con una selezione
  iniziale. Una Game Operation controllata cambia uniformemente la selezione.
- Ogni Object dichiara un Inventory Appearance statico usato nel HUD e come
  cursore.
- Il Game Project dichiara una sola Inventory Appearance Size quadrata. Ogni
  relativo PNG deve coincidere esattamente; l'Example `426×240` usa `32×32`.
- La camminata direzionale usa tre strisce PNG orizzontali per lato, fronte e
  retro; il lato opposto viene specchiato. Numero di frame, altezza e cadenza
  coincidono, il primo frame è la posa ferma e le celle sono validate.
- `startGame` carica e valida atomicamente tutti gli asset prima di restituire
  la sessione. Non espone progresso, streaming, cache o scaricamento manuale.
- Un fallimento raccoglie i problemi indipendenti disponibili, rimuove il
  montaggio parziale e rigetta l'avvio senza placeholder o schermata d'errore
  imposta dall'Engine.

### Save Snapshot

- Un Save Snapshot è una rappresentazione JSON-safe e ispezionabile di un solo
  Game State committed. Fondale ne possiede creazione e interpretazione; il
  Game Project ne possiede persistenza e presentazione.
- Ogni Game Project dichiara Project Identity e Project Version. Lo snapshot
  include entrambe e una versione del formato posseduta da Fondale.
- La compatibilità richiede corrispondenza esatta di formato, Project Identity
  e Project Version. La Versione 1 non esegue migrazioni.
- Lo snapshot include fatti canonici di Scene, Scenery, Character, Object,
  Inventory, Game Variable e Game Activity dominante, compresi movimento,
  Line o Choice attivi quando necessari alla ripresa.
- Non include Game Definition, callback, asset, geometrie o percorsi derivati,
  oggetti del renderer, interpolazione, effetti già realizzati o input non
  elaborati.
- La Game Session crea su richiesta lo snapshot dell'ultimo stato committed,
  anche durante movimento o transizione, senza catturare preparazione parziale.
  Non può farlo dopo `stop()` o `failed`.
- Un dato recuperato viene trattato come `unknown`. La validazione restituisce
  un esito esplicito e controlla forma JSON, campi inattesi, versioni,
  riferimenti e invarianti del Game State.
- Dati incompleti, corrotti, incompatibili o contraddittori vengono rifiutati
  con diagnostiche; non sono riparati e non avviano silenziosamente una nuova
  partita.
- Il ripristino crea una nuova Game Session indipendente e ricostruisce gli
  interni derivati dal Game Project. Riprende la stessa attività senza ripetere
  Game Operation già committed.
- Il Save Snapshot non offre firma, cifratura, anti-cheat o autenticità e non
  contiene slot, etichetta, data, anteprima o tempo giocato.

### Validazione e Authoring Diagnostic

- Ogni invalidità viene rilevata dal primo livello che possiede contesto
  sufficiente: helper per invarianti locali, `defineGame` per coerenza globale,
  validazione del Save Snapshot per dati esterni e `startGame` per browser e
  asset.
- Helper e `defineGame` lanciano un singolo errore contenente tutte le
  diagnostiche indipendenti. La validazione di un dato esterno restituisce
  invece un esito esplicito.
- `startGame` controlla target libero, WebGL, raggiungibilità e decodifica PNG,
  dimensioni effettive e vincoli della camminata. In caso di fallimento pulisce
  e non crea una Game Session.
- Un errore di Game Behavior o una Game Operation invalida non commette il
  gruppo e porta una sessione avviata in `failed`.
- Ogni Authoring Diagnostic include codice stabile, famiglia stabile, percorso
  basato sui nomi autoriali, spiegazione, correzione suggerita quando sicura e
  causa originale disponibile.
- Le famiglie coprono definizione, riferimento, stato o salvataggio, asset,
  ambiente e Game Behavior. Testo e suggerimento possono migliorare, mentre
  codici, famiglie e semantica dei percorsi sono contratto pubblico.
- Le diagnostiche sono ordinate stabilmente, raccolgono errori indipendenti e
  sopprimono quelli puramente conseguenti.
- Fondale rifiuta soltanto invalidità dimostrabili. Contenuti insoliti,
  apparentemente inutilizzati o di risolvibilità incerta non producono errori o
  warning. La Versione 1 non emette warning.

### Documentazione pubblica

- La documentazione viene distribuita e versionata con il pacchetto.
- Comprende avvio rapido, guida concettuale, ricette focalizzate e riferimento
  completo dell'interface pubblica.
- Ogni export e struttura pubblica annidata documenta scopo, uso, valori,
  invarianti, default, errori, codici diagnostici, ordine rilevante ed esempio.
- Il riferimento nasce accanto all'interface che descrive. Guide e ricette lo
  collegano senza duplicarne il contratto.
- Ogni ricetta deriva da sorgenti realmente compilati contro il pacchetto
  distribuibile e mostra una sola Engine Capability con il minimo contesto
  completo. Quando mostra comportamento, viene anche verificata
  automaticamente.
- L'Example resta la composizione completa e deve essere costruibile usando la
  sola documentazione pubblicata.
- La documentazione parla esclusivamente attraverso concetti e garanzie
  pubbliche e non richiede conoscenza di PixiJS, algoritmi o organizzazione
  interna.

### Support Baseline

- La piattaforma garantita è l'ultima versione stabile corrente di Google
  Chrome desktop con WebGL. Una regressione dovuta a un aggiornamento di Chrome
  è un bug di Fondale.
- Il mouse controlla mondo, HUD, Line e Choice. La tastiera copre completamente
  HUD, Line e Choice, ma non sostituisce il mouse per navigazione e interazioni
  nel mondo.
- Nessuna azione richiesta dipende esclusivamente dal tasto destro.
- `Tab` e `Shift+Tab` percorrono in ordine prevedibile i controlli del HUD;
  `Enter` o `Space` attivano il controllo. `Enter` o `Space` avanzano una Line;
  le frecce cambiano alternativa in una Choice e `Enter` o `Space` confermano.
- Una Choice acquisisce automaticamente il controllo da tastiera e, al termine
  della Sequence, lo restituisce al controllo precedente. Alternare mouse e
  tastiera non attiva azioni e non perde selezioni logiche.
- Focus da tastiera e Object selezionato sono percepibili anche senza affidarsi
  soltanto al colore.
- La Support Baseline non dichiara WCAG, supporto per lettori di schermo,
  contrasto certificato, movimento ridotto, completamento del mondo senza
  mouse, altri browser, vecchie Chrome, Chromium generico, touch o gamepad.

## Testing Decisions

### Seam di verifica

- La seam primaria è l'interface pubblica del pacchetto distribuibile. Un Game
  Project esterno importa dalla sola radice, costruisce definizioni, valida
  salvataggi, avvia una Game Session e completa l'Example in Chrome. Questa è
  la superficie più alta e verifica ciò che Author e Player possono davvero
  osservare.
- L'unica seam interna aggiuntiva è il core deterministico della Game Session.
  Un test adapter fornisce Game Project validato, Game State, input ordinati e
  passi logici e osserva snapshot committed ed effetti. Serve per dimostrare
  determinismo, atomicità e ripristino senza dipendere da clock o pixel del
  browser.
- Renderer, navigazione, Sequence, Inventory e altri moduli non ottengono
  interfacce pubbliche di test. Il loro comportamento viene provato attraverso
  la seam del core o quella del pacchetto, scegliendo la più alta capace di
  produrre una verifica deterministica e diagnostica.

### Qualità dei test

- Un buon test osserva Game State committed, effetti, diagnostiche e risultati
  percepibili; non ispeziona display tree, texture, oggetti PixiJS, algoritmo di
  pathfinding o altre strutture dell'implementazione.
- I test del core verificano che gli stessi input e passi producano gli stessi
  snapshot ed effetti; ritmo del renderer e sospensione non cambiano il
  risultato logico.
- Una prosecuzione ininterrotta e una equivalente con Save Snapshot,
  validazione, arresto e ripristino devono raggiungere lo stesso stato senza
  perdere o ripetere Game Operation.
- Le transizioni atomiche vengono provate sia in successo sia con
  un'operazione invalida: nessuno stato parziale diventa committed.
- La navigazione viene provata attraverso Player Intent e stato committed:
  destinazione esterna ricondotta a un punto raggiungibile, nessun attraversamento
  del bordo, sostituzione dell'intento, bersaglio irraggiungibile e transizione
  atomica fra le due Scene.
- Le interazioni verificano ordine dei casi, fallback percepibile, rivalutazione
  dopo l'arrivo, condizioni esercitate, gruppo atomico e fallimento del Game
  Behavior.
- Le Sequence verificano Line manuali, Choice e fallback, diramazione,
  modalità, rifiuto degli altri input, commit intermedi e ripristino sulla
  stessa Choice.
- L'Inventory verifica ordine di acquisizione, selezione e deselezione,
  persistenza fra Scene, sostituzione dell'intento, uso fallito che conserva la
  selezione, uso riuscito che la termina, ricollocazione e consumo.
- I Save Snapshot vengono provati con dati validi, corrotti, incompleti, con
  campi inattesi, Project Identity o Project Version errata, formato
  incompatibile, riferimenti mancanti e stato contraddittorio.
- La validazione verifica aggregazione, ordine stabile, soppressione delle
  conseguenze, codici, famiglie e percorsi delle Authoring Diagnostic.
- L'avvio in browser verifica WebGL assente, target già occupato, PNG mancante o
  indecodificabile, dimensioni errate, strisce incoerenti e pulizia atomica del
  montaggio fallito.

### Example e gate di pubblicazione

- L'Example esterno installa l'artefatto esatto candidato alla pubblicazione,
  compila contro i suoi tipi e produce una build statica senza import interni.
- Playwright usa Google Chrome stabile e veri eventi di mouse e tastiera. Gli
  hook interni globali usati dalla vertical slice attuale non costituiscono
  prova di accettazione.
- Il percorso automatico parte da una nuova partita e attraversa due Scene,
  camminata, profondità, Scenery, Primary Action, Sequence, Line, Choice,
  condizioni, Game Operation, cambio di Appearance, raccolta, selezione,
  Inventory Use fallito e riuscito, Game Behavior, Save Snapshot durante la
  Choice, arresto, ripristino e stato finale osservabile.
- Il percorso attraversa esclusivamente l'interface pubblica e osserva
  risultati pubblici o percepibili. Non modifica direttamente il Game State e
  non chiama funzioni interne di movimento.
- L'Example viene provato almeno con una finestra desktop ampia e una più
  piccola o con proporzioni differenti, verificando adattamento, letterbox, HUD
  e Sequence.
- Le verifiche automatiche controllano presenza, disposizione e stato, non
  l'identità pixel-perfect. Screenshot diagnostici stabili e una breve
  revisione visiva umana completano il gate di rilascio.
- Ogni errore di console o eccezione della pagina fallisce il percorso, secondo
  il prior art dell'harness Playwright esistente.
- Un test intermittente resta fallito. Un nuovo tentativo può raccogliere
  diagnostica, ma non rende pubblicabile la release.
- Ogni cambiamento supera type-check, build e prove rapide del core. Prima della
  pubblicazione passano inoltre pacchetto, tipi, documentazione, ricette,
  Example esterno e intero percorso Playwright.
- La pubblicazione è bloccata se esiste un export o una struttura pubblica non
  documentata, se una ricetta non compila contro il pacchetto distribuibile, se
  un riferimento è mancante o se l'Example non passa.

### Prior art

- I test Playwright attuali dimostrano l'uso del canale `chrome`, la raccolta di
  errori di console ed eccezioni, viewport stabile e screenshot diagnostici.
  Queste pratiche restano valide.
- I test attuali di Scene e Character mostrano casi utili per profondità,
  occlusione, clamp a una posizione percorribile e camminata direzionale, ma
  pilotano hook interni e tempi reali: vanno riscritti sulle seam definite qui,
  non promossi come contratto.
- I prototipi di navigazione e Inventory Appearance conservano evidenza delle
  decisioni su comportamento e scala, ma non sono implementazioni produttive né
  nuove seam pubbliche.

## Out of Scope

- Audio di qualunque tipo, inclusi dichiarazione, caricamento e riproduzione.
- Localizzazione, Line temporizzate, pensieri distinti, movimento o attese
  narrative, skip completo, cicli, Sequence annidate o composizione fra
  Sequence.
- Profilo `smooth`, camera, panning, zoom, animazioni generiche o ambientali
  pubbliche, caricamento progressivo, streaming, varianti di risoluzione e
  trasformazioni runtime degli asset, oltre al ripristino trasparente della
  sessione dopo la perdita del contesto WebGL.
- Canvas 2D e WebGPU come renderer garantiti; callback di rendering, nodi
  generici, shader, filtri, blend mode e accesso a PixiJS.
- Formati asset diversi da PNG, font personalizzati, pipeline artistiche,
  manifest pubblico, cartella base degli asset e strumenti Python della
  vertical slice.
- Walkable Region multiple, Navigation Obstacle dinamici, Approach Point
  multipli, bersagli mobili avanzati e configurazione o sostituzione del
  pathfinding.
- Etichette dinamiche delle Interaction, condizioni e Game Variable ulteriori,
  operazioni generiche, fallback aggiuntivi e plugin definiti dal Game Project.
- Quantità, stack, combinazione fra Object, contenitori, equipaggiamento,
  crafting, possesso da parte di Character, ordinamento autoriale e
  configurazione di layout o stile del HUD.
- Slot, UI dei Save Snapshot, storage locale o remoto, cloud, autosave, firma,
  cifratura, anti-cheat, autenticità e migrazioni fra versioni del formato.
- Verificatore generale di risolvibilità degli enigmi.
- Documentazione o compatibilità esplicita con bundler e framework diversi dal
  percorso Vite esercitato dall'Example.
- CLI, scaffolding, inspector, dashboard, editor visuale, authoring no-code e
  interface generale per plugin.
- Supporto garantito per altri browser, vecchie versioni di Chrome, Chromium
  generico, touch, gamepad, wrapper desktop, store, Steam, lettori di schermo,
  conformità WCAG, contrasto certificato e movimento ridotto.
- Sessioni concorrenti come capacità pubblica, callback sul lifecycle e accesso
  pubblico ai dettagli dello stato interno.
- Multiplayer, 3D, fisica generale, combattimento e sistemi RPG.
- Trama completa, Scene aggiuntive e produzione artistica del gioco Capri 1535.
- Qualunque capacità candidata alla Versione 2 che non sia esercitata
  dall'Example di Fondale 1.0; richiederà un nuovo effort e un nuovo Example.

## Further Notes

- Ubiquitous language, codice, commenti e interface pubbliche devono restare in
  inglese. La specifica e i ticket di pianificazione possono restare in
  italiano.
- Gli ADR esistenti sono coerenti con questa specifica: interazione contestuale
  a scena intera, Engine ed Example nello stesso repository, authoring
  dichiarativo con Game Behavior TypeScript, renderer interno e pacchetto npm
  web-native pubblico restano vincoli attivi.
- L'implementazione corrente è una vertical slice Vite/PixiJS chiamata
  `capri-1535`; non contiene ancora il pacchetto pubblico, il core deterministico,
  HUD, Sequence, Inventory o Save Snapshot. Va trattata come evidenza da cui
  estrarre comportamento, non come architettura da rivestire superficialmente.
- La specifica preferisce moduli profondi: una piccola interface pubblica offre
  authoring, runtime e diagnostica, mentre renderer, navigazione, validazione e
  lifecycle concentrano complessità nell'implementazione.
- Fondale 1.0 è completo quando l'Example esterno dimostra tutte e sole le
  Engine Capability stabilizzate qui. Una capacità non esercitata non entra nel
  contratto per completezza futura.
