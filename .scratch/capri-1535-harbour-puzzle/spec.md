# Capri 1535 — Enigma del porto e percorso costiero

Status: ready-for-human

## Problem Statement

Il Player dell'Example Capri 1535 non comprende con sufficiente chiarezza come
attraversare il cancello del vicolo: dopo averlo aperto deve colpire una stretta
area invisibile sopra il cancello, mentre un secondo click sulla parte più
evidente continua a ispezionarlo. Nemmeno il controllo `Reveal hotspots` rende
percepibile il Scene Passage. Il percorso riesce tecnicamente, ma la sua
affordance non comunica l'intenzione richiesta.

Una volta raggiunto il porto, inoltre, il Player trova una Scene quasi priva di
attività. L'Example dimostra quindi le Engine Capability principali in modo
troppo concentrato e poco narrativo: Inventory Use, Interaction Condition,
Appearance, Choice, Game Behavior, Scene Passage e Save Snapshot esistono, ma
non compongono ancora un piccolo enigma riconoscibile e piacevole da giocare.

Anche la libreria artistica dell'Example confonde master, elaborati intermedi e
asset runtime. Un Author non può capire immediatamente quale immagine sia la
fonte artistica da conservare, quale sia rigenerabile e quale venga caricata dal
Game Project. La struttura deve rendere esplicito che `art` conserva soltanto i
master, mentre ogni asset runtime appartiene al modulo di gioco che lo usa.

## Solution

L'Example viene esteso con un micro-enigma narrativo di tre-cinque minuti nel
porto e con cinque Scene esplorabili: vicolo, piazza, porto, grotta e posto di
vedetta costiero. Il
cancello del vicolo diventa attraversabile cliccando l'intero arco dopo lo
sblocco. Nel porto Michele incontra Raffaele, anziano responsabile
dell'approdo, che deve mettere in acqua un gozzo per portare un pacco al posto
di vedetta. In cambio dell'aiuto offre a Michele il passaggio e un piccolo
compenso.

Il Player sceglie fra una risposta professionale e una ironica, raccoglie
un'ampolla d'olio e la manovella dell'argano, scopre che la manovella non può
essere montata prima di lubrificare il meccanismo, ripara l'argano e rende
disponibile la barca. Il viaggio conduce a una terrazza di vedetta, dove Michele
raggiunge prima una grotta marina e poi la terrazza di vedetta, dove Michele può
raggiungere il parapetto, osservare l'orizzonte, ricevere una conclusione che
riflette la scelta fatta con Raffaele e tornare al porto.

Tutti i dialoghi, la narrazione, le Interaction Response e i controlli posseduti
dall'Example sono in italiano. Il controllo diagnostico `Reveal hotspots`
rimane in inglese perché appartiene all'Engine e la localizzazione dell'Engine
non rientra in questo lavoro. Le Game Definition restano dichiarative; un
singolo Game Behavior mirato gestisce l'osservazione dal parapetto. Non viene
modificata l'interface pubblica di Fondale.

La libreria artistica viene riorganizzata per dominio in master di Scene,
Character e Object, con i prompt conservati accanto ai relativi master. Nessun
derivato o asset runtime rimane nella libreria master. Gli script di produzione
scrivono gli asset elaborati direttamente nel modulo runtime proprietario.

## User Stories

1. Come Player, voglio capire visivamente dove attraversare il cancello aperto, così da non dover indovinare una coordinata invisibile.
2. Come Player, voglio poter cliccare l'intero arco dopo aver aperto il cancello, così da esprimere naturalmente l'intento di raggiungere il porto.
3. Come Player, voglio che il cancello chiuso continui a rispondere come un bersaglio interattivo, così da capire che richiede una chiave.
4. Come Player, voglio che il cancello aperto smetta di intercettare l'intento di attraversamento, così da non ricevere un'ispezione quando sto cercando di passare.
5. Come Player, voglio risolvere il passaggio senza usare `Reveal hotspots`, così da affidarmi alla composizione della Scene e alle risposte del mondo.
6. Come Player, voglio trovare attività significative nel porto, così da percepirlo come un luogo dell'avventura e non soltanto come uno stato finale.
7. Come Player, voglio incontrare Raffaele nel porto, così da ricevere un obiettivo attraverso un Character riconoscibile.
8. Come Player, voglio che Raffaele abbia un carattere brusco ma ironico, così da ritrovare il tono mediterraneo e leggermente umoristico dell'avventura.
9. Come Player, voglio leggere dialoghi e narrazione in italiano, così da vivere la scena nella lingua scelta per il contenuto del gioco.
10. Come Player, voglio scegliere fra una risposta professionale e una risposta ironica, così da caratterizzare Michele.
11. Come Player, voglio che entrambe le risposte facciano avanzare l'enigma, così da non scegliere accidentalmente un percorso morto.
12. Come Player, voglio che la risposta professionale influenzi una battuta successiva, così da percepire che la Choice è stata ricordata.
13. Come Player, voglio che la risposta ironica produca una conclusione diversa, così da ottenere una conseguenza narrativa senza moltiplicare il puzzle.
14. Come Player, voglio comprendere che Raffaele deve raggiungere il posto di vedetta, così da avere una motivazione concreta per riparare l'argano.
15. Come Player, voglio sapere che Michele riceverà passaggio e compenso, così da collegare l'incarico al suo desiderio di comprare una barca.
16. Come Player, voglio distinguere l'argano vicino alla barca, così da riconoscerlo come il meccanismo bloccato.
17. Come Player, voglio individuare l'ampolla d'olio vicino alla rimessa e alle botti, così da raccoglierla osservando la Scene.
18. Come Player, voglio individuare la manovella fra le reti in primo piano, così da raccoglierla senza un contorno artificiale.
19. Come Player, voglio poter raccogliere olio e manovella in qualsiasi ordine, così da esplorare liberamente il porto.
20. Come Player, voglio vedere olio e manovella nell'Inventory con icone riconoscibili, così da distinguerli alle dimensioni del HUD.
21. Come Player, voglio selezionare la manovella e tentare di usarla subito sull'argano, così da ricevere un indizio sul corretto ordine delle azioni.
22. Come Player, voglio che l'uso prematuro della manovella fallisca con una risposta percepibile, così da capire che il meccanismo è ancora bloccato.
23. Come Player, voglio che un Inventory Use fallito conservi la manovella e la selezione, così da poter tentare un altro bersaglio senza ripetere la raccolta.
24. Come Player, voglio poter tentare gli oggetti su bersagli sbagliati, così da ricevere risposte coerenti invece di silenzi.
25. Come Player, voglio usare l'olio sull'argano, così da preparare il meccanismo alla riparazione.
26. Come Player, voglio che l'olio venga consumato dopo l'uso riuscito, così da vedere nell'Inventory l'esito irreversibile dell'azione.
27. Come Player, voglio vedere l'argano cambiare aspetto dopo la lubrificazione, così da percepire il nuovo Game State senza affidarmi soltanto al testo.
28. Come Player, voglio montare la manovella soltanto dopo la lubrificazione, così da completare un enigma basato su una sequenza causale comprensibile.
29. Come Player, voglio vedere la manovella montata nel mondo, così da capire dove è finito l'Object rimosso dall'Inventory.
30. Come Player, voglio vedere l'argano nella sua Appearance riparata, così da riconoscere che la barca è pronta.
31. Come Player, voglio ricevere una conferma da Raffaele dopo la riparazione, così da sapere che il passaggio è disponibile.
32. Come Player, voglio cliccare l'intera barca pronta, così da raggiungere il posto di vedetta senza cercare una stretta area invisibile.
33. Come Player, voglio che la barca non funzioni come Scene Passage prima della riparazione, così da rispettare la condizione narrativa dell'enigma.
34. Come Player, voglio arrivare alla terrazza attraverso una Scene Entrance coerente, così da comprendere la provenienza di Michele.
35. Come Player, voglio attraversare il cortile della terrazza, così da provare navigazione e Perspective Scale in una composizione semplice e leggibile.
36. Come Player, voglio poter osservare il mare dal parapetto, così da ottenere una conclusione percepibile per il viaggio.
37. Come Player, voglio che la conclusione ricordi il comportamento tenuto con Raffaele, così da chiudere la piccola conseguenza della Choice.
38. Come Player, voglio poter osservare nuovamente l'orizzonte e ricevere una risposta coerente con lo stato già raggiunto, così da non ripetere la conclusione come se fosse nuova.
39. Come Player, voglio trovare un passaggio evidente per tornare al porto, così da non restare intrappolato nella Scene finale.
40. Come Player, voglio che il ritorno al porto mi collochi presso un'entrata comprensibile, così da continuare l'esplorazione senza un salto spaziale ambiguo.
41. Come Player, voglio salvare e ripristinare durante il dialogo con Raffaele, così da riprendere la stessa Line o Choice.
42. Come Player, voglio salvare e ripristinare durante il progresso dell'enigma, così da conservare Object, Inventory, Appearance e Game Variable già committed.
43. Come Player, voglio salvare e ripristinare presso il posto di vedetta, così da ritrovare Scene, posizione e conclusione narrativa coerenti.
44. Come Player, voglio che un Save Snapshot incompatibile venga rifiutato, così da non ripristinare silenziosamente uno stato della vecchia versione dell'Example.
45. Come Player, voglio usare mouse e tastiera secondo la Support Baseline esistente, così da completare il nuovo percorso con gli stessi controlli del resto dell'Example.
46. Come Player, voglio che il pulsante di salvataggio dell'Example sia in italiano, così da non interrompere la coerenza linguistica dei controlli posseduti dal Game Project.
47. Come Author, voglio vedere più Engine Capability comporsi in un enigma narrativo, così da capire come costruire un'avventura senza modificare Fondale.
48. Come Author, voglio che condizioni comuni e cambiamenti di stato restino Game Definition dichiarative, così da mantenere il progetto validabile.
49. Come Author, voglio vedere un Game Behavior soltanto dove aggiunge una regola specifica, così da capire il confine fra dati dichiarativi e comportamento TypeScript.
50. Come Author, voglio che il Game Behavior usi soltanto letture e Game Operation controllate, così da non dipendere dal renderer o dal DOM.
51. Come Author, voglio che Character, Object e Scenery cambino attraverso Appearance nominate, così da rappresentare semanticamente il progresso visivo.
52. Come Author, voglio che Object consumati e ricollocati usino le Game Operation dedicate, così da non duplicarne la posizione con Game Variable arbitrarie.
53. Come Author, voglio che Scene Passage ed Entrance restino direzionali ed espliciti, così da comprendere ogni collegamento fra Scene.
54. Come Author, voglio che l'Example continui a consumare soltanto l'interface pubblica del pacchetto, così da restare una prova reale di separazione dall'Engine.
55. Come Author, voglio distinguere immediatamente i master artistici dagli asset runtime, così da sapere quale file modificare o rigenerare.
56. Come Author, voglio che la libreria artistica contenga soltanto master, così da non confondere fonti e output derivati.
57. Come Author, voglio che ogni asset runtime viva accanto al modulo che lo possiede, così da mantenere locale la relazione fra contenuto e media.
58. Come Author, voglio che i master siano organizzati per Scene, Character e Object, così da usare lo stesso linguaggio del Game Project.
59. Come Author, voglio conservare il prompt finale accanto a ogni master generato, così da poter produrre varianti coerenti in futuro.
60. Come Author, voglio che gli script di produzione scrivano direttamente nel modulo runtime proprietario, così da non creare una seconda libreria di derivati.
61. Come Author, voglio poter rigenerare un asset runtime dal suo master, così da evitare copie manuali prive di provenienza.
62. Come Maintainer, voglio usare il master approvato della terrazza di vedetta, così da privilegiare una composizione poco profonda e semplice da allestire.
63. Come Maintainer, voglio art di Raffaele, olio, manovella e argano leggibili alla Logical Resolution, così da verificare l'enigma nel contesto reale.
64. Come Maintainer, voglio controllare trasparenza, ancoraggio e profondità degli asset separati, così da evitare aloni e salti visivi.
65. Come Maintainer, voglio che l'Example non importi mai dalla libreria master, così da garantire che la build contenga soltanto asset runtime posseduti.
66. Come Maintainer, voglio verificare il percorso attraverso input reali del Player, così da proteggere l'affordance e non soltanto la forma delle definizioni.
67. Come Maintainer, voglio esercitare entrambe le alternative della Choice, così da verificare la conseguenza narrativa persistente.
68. Come Maintainer, voglio esercitare l'ordine errato e quello corretto degli Inventory Use, così da proteggere fallimento, selezione, consumo e ricollocazione.
69. Come Maintainer, voglio verificare viaggio e ritorno fra porto e posto di vedetta, così da proteggere entrambi i Scene Passage.
70. Come Maintainer, voglio raccogliere gli errori del browser durante il percorso, così da non accettare un successo soltanto visivo con errori nascosti.
71. Come Maintainer, voglio evitare asserzioni pixel-perfect sulle immagini generate, così da verificare il comportamento senza rendere fragile la suite.
72. Come Maintainer, voglio una revisione visiva a scala 1x e ingrandita con nearest-neighbour, così da giudicare leggibilità e coerenza degli asset nel formato finale.
73. Come Player, voglio raggiungere una piazza subito dopo il cancello, così da comprendere la continuità spaziale fra il vicolo e il porto.
74. Come Player, voglio riconoscere il grande arco della piazza come uscita verso il porto, così da non dover cercare un passaggio invisibile.
75. Come Player, voglio poter tornare dalla piazza al vicolo e dal porto alla piazza, così da esplorare liberamente il percorso urbano.
76. Come Player, voglio attraversare una grotta marina durante il viaggio in barca, così da usare il nuovo fondale come breve ricompensa esplorabile.
77. Come Player, voglio riconoscere l'apertura luminosa della grotta come direzione verso il posto di vedetta, così da seguire la composizione senza istruzioni esterne.
78. Come Player, voglio poter tornare dalla grotta al porto, così da non essere obbligato a proseguire.
79. Come Player, voglio che piazza e grotta offrano osservazioni in italiano, così da non essere soltanto schermate di transito.
80. Come Author, voglio vedere un percorso di cinque Scene con Passage ed Entrance espliciti, così da provare un piccolo grafo navigabile del motore.
81. Come Maintainer, voglio che tutti e quattro i master approvati dal Player siano presenti nella libreria art e nei rispettivi moduli runtime.
82. Come Maintainer, voglio che il test attraversi piazza e grotta con input reali, così da proteggere i nuovi passaggi.
83. Come Maintainer, voglio che il nuovo porto conservi l'intero enigma e riallinei Character, Object, Scenery e Hotspot alla nuova composizione.

## Implementation Decisions

### Confine e compatibilità

- Il lavoro modifica soltanto l'Example Capri 1535 e i suoi strumenti di
  produzione. L'interface pubblica, il runtime e il renderer dell'Engine non
  vengono estesi.
- Il Project Version dell'Example passa a `3`, perché registri, Game
  Variable e stato iniziale cambiano. Non viene introdotta una migrazione dei
  Save Snapshot della versione precedente.
- Il Game Project continua a installare e consumare il pacchetto distribuibile
  senza import profondi o accesso agli interni di Fondale.
- Gli identificatori, i nomi dei moduli, il codice e i commenti restano in
  inglese. Dialoghi, Line, Choice, narrazione, Interaction Response e il
  controllo di salvataggio posseduto dall'Example sono in italiano.
- `Reveal hotspots` resta in inglese perché è posseduto dall'Engine e non
  esiste una Game Setting di localizzazione nella Versione 1.

### Cancello del vicolo

- Il Hotspot del cancello riceve Player Intent soltanto mentre il cancello è
  chiuso. Dopo l'Inventory Use riuscito della chiave non può più intercettare
  il click destinato al passaggio.
- Il Scene Passage condizionato dal cancello aperto copre l'intera superficie
  semanticamente percepita come arco attraversabile, non una striscia distinta
  sopra il bersaglio.
- Lo stesso spazio visivo offre quindi l'ispezione quando bloccato e
  l'attraversamento quando aperto. Non viene aggiunto un nuovo controllo HUD o
  un percorso basato su coordinate conosciute dal Player.
- Il Game Behavior precedentemente usato per ispezionare il cancello aperto
  viene sostituito dalla nuova osservazione dal parapetto, preservando la capacità
  dimostrata senza mantenere l'interazione ambigua.

### Porto, Raffaele e Choice

- Raffaele è un Character persistente con Appearance statica, collocato vicino
  alla rimessa in modo da non coprire argano, Object o percorso.
- La prima Primary Action su Raffaele avvia una Sequence in italiano che
  presenta il problema, la commissione e la ricompensa.
- La Choice offre due alternative sempre eleggibili: una professionale e una
  ironica. Entrambe convergono sullo stesso enigma.
- L'alternativa professionale imposta la Game Variable booleana
  `raffaeleImpressed`; l'alternativa ironica la lascia falsa. La variabile
  modifica soltanto la conclusione narrativa presso il parapetto.
- Le interazioni successive con Raffaele rispondono allo stato dell'enigma:
  istruzione iniziale, attesa della riparazione e autorizzazione alla partenza.
- Il tono combina un problema credibile con sarcasmo asciutto; non trasforma
  Raffaele in una caricatura o in un personaggio da pirateria caraibica.

### Object, Scenery e riparazione

- L'ampolla d'olio e la manovella sono Object persistenti con Appearance nel
  mondo e Inventory Appearance quadrate conformi al Game Setting esistente.
- L'olio inizia presso botti e rimessa; la manovella inizia fra le reti in
  primo piano. Entrambi possiedono Hotspot e Approach Point leggibili nella
  composizione.
- L'argano è Scenery del porto con Appearance nominate `stuck`, `lubricated` e
  `repaired`.
- Un Inventory Use della manovella quando l'argano non è lubrificato fallisce,
  produce una risposta in italiano e conserva Object e selezione.
- Un Inventory Use riuscito dell'olio imposta il fatto canonico della
  lubrificazione, seleziona l'Appearance `lubricated` e consuma terminalmente
  l'olio in un solo gruppo atomico.
- Un Inventory Use riuscito della manovella richiede la lubrificazione,
  seleziona l'Appearance `repaired`, imposta il fatto canonico che abilita la
  partenza e ricolloca la manovella presso l'argano con una Appearance montata.
- La manovella montata non introduce una seconda interazione necessaria. La
  Scenery riparata comunica visivamente il risultato complessivo.
- Gli usi su bersagli non compatibili restituiscono una risposta percepibile e
  non modificano Object, selezione o Game State.

### Barca e posto di vedetta

- Prima della riparazione la barca offre una Primary Action che comunica il
  blocco. Dopo la riparazione quel Hotspot non intercetta più il Player Intent
  e l'intera sagoma utile della barca diventa un Scene Passage condizionale.
- Il Scene Passage della barca conduce alla grotta marina. L'apertura luminosa
  della grotta conduce a una Scene Entrance nominata presso la terrazza di
  vedetta; un secondo passaggio permette di tornare al porto.
- La terrazza usa il master artistico fornito e approvato dopo la spec iniziale.
  La Walkable Region copre il cortile quasi rettangolare e la Perspective Scale
  resta contenuta, evitando una geometria profonda non necessaria.
- Il parapetto centrale possiede un Hotspot con Approach Point leggibile. La
  prima osservazione esegue un Game Behavior sincrono ristretto che registra
  l'osservazione e avvia la Sequence conclusiva.
- La Sequence conclusiva usa un Branch dichiarativo sulla variabile
  `raffaeleImpressed` e presenta una diversa battuta finale per ciascun esito.
- Le osservazioni successive non ripetono il primo avanzamento narrativo e
  restituiscono una risposta coerente con l'orizzonte già osservato.
- La scena non contiene un secondo enigma. Il cortile, il parapetto e il ritorno
  al porto costituiscono la ricompensa esplorabile.

### Piazza e grotta

- Il cancello del vicolo conduce alla piazza, non direttamente al porto. La
  piazza usa il grande arco sulla destra come Passage verso il porto e il bordo
  architettonico sulla sinistra come ritorno al vicolo.
- La piazza conserva una Walkable Region ampia ma poco profonda e offre soltanto
  due osservazioni contestuali, sulla chiesa e sul carretto; non introduce un
  nuovo enigma.
- Il porto usa il nuovo master approvato. Raffaele, olio, manovella, argano e
  barca vengono riallineati alla banchina, mantenendo invariata la logica del
  puzzle.
- La grotta usa il primo piano roccioso come Walkable Region. Il bordo sinistro
  torna al porto, mentre l'apertura luminosa centrale conduce al belvedere.
- I collegamenti formano il percorso principale `alley → townSquare → harbour
  → grotto → lookout`, con ritorni espliciti verso porto, piazza e vicolo.

### Art e pipeline

- La libreria `art` è esclusivamente una raccolta di master, non una directory
  importabile dal Game Project e non una cache di output elaborati.
- I master sono organizzati secondo i concetti posseduti dal Game Project:
  Scene, Character e Object. I master di una Scenery appartengono alla Scene
  che la definisce.
- Ogni master generato conserva accanto a sé il prompt finale. Varianti
  scartate e intermedi tecnici non devono essere versionati come master.
- Ogni PNG runtime vive accanto al modulo sorgente che possiede la relativa
  Scene, Character o Object. Il codice del Game Project non raggiunge la
  libreria master.
- Le precedenti directory che mescolano concept, room elaborate, sprite
  derivati ed esempi vengono assorbite nella struttura per master. I derivati
  duplicati o non usati vengono rimossi, perché sono riproducibili.
- Gli strumenti di produzione ricevono un master e scrivono direttamente nella
  destinazione runtime proprietaria. Documentazione, esempi d'uso e preview
  vengono aggiornati alla stessa convenzione.
- Il Background runtime della terrazza è RGB, misura esattamente la
  Logical Resolution e conserva il trattamento a palette limitata. Gli asset
  separati usano alpha pulito, Visual Anchor coerenti e dimensioni native che
  non richiedono ingrandimenti nel mondo.
- I quattro master forniti dal Player vengono conservati come Background di
  `grotto`, `lookout`, `town-square` e `harbour`; i corrispondenti runtime
  elaborati vivono sotto `src/scenes/`.
- Vengono prodotti master e runtime per Raffaele statico, ampolla d'olio,
  manovella e tre stati dell'argano. Non viene prodotta una camminata completa
  per Raffaele; il Background della terrazza usa il nuovo master fornito.
- Le art devono restare credibili per Capri nel 1535, coerenti con pietra,
  legno, terracotta, luce dorata e ombre viola già adottate, senza elementi
  moderni, fantasy o da pirati caraibici.

## Testing Decisions

- Il seam comportamentale principale e unico è il test di accettazione
  Playwright dell'Example installato contro il pacchetto distribuibile. È il
  seam più alto disponibile: osserva canvas, HUD, Line, Choice e transizioni
  attraverso input reali del Player senza leggere Game State, renderer o
  moduli interni.
- I test devono asserire risultati percepibili: testo mostrato, Inventory
  Appearance presenti o assenti, stato selezionato esposto dal HUD, cambio di
  Scene osservabile e possibilità di tornare. Non devono asserire nomi di
  funzioni interne, code di operazioni o oggetti del renderer.
- Il test di accettazione esistente che completa l'Example con mouse e tastiera
  costituisce il prior art. Va esteso o suddiviso soltanto quanto serve a
  rendere leggibili i due percorsi narrativi, mantenendo lo stesso harness di
  coordinate logiche e raccolta degli errori browser.
- Un percorso verifica il cancello chiuso, l'uso della chiave, il passaggio
  nella piazza e un click nel grande arco che raggiunge il porto.
- Un percorso verifica la Choice professionale, il Save Snapshot durante la
  Sequence, il ripristino esatto, il tentativo prematuro della manovella, la
  selezione conservata, il consumo dell'olio, la manovella montata, la partenza,
  l'attraversamento della grotta, la conclusione corrispondente e il ritorno.
- Un secondo percorso verifica l'alternativa ironica e la diversa conclusione,
  senza duplicare ogni passo già coperto dal percorso principale.
- Il salvataggio dopo cambiamenti committed deve ripristinare Object,
  Inventory, Appearance, Game Variable, Scene e progresso della Sequence senza
  osservare direttamente lo stato serializzato nel test comportamentale.
- Ogni percorso raccoglie errori console e page exception e richiede una lista
  vuota al termine.
- Le screenshot sono artefatti per revisione umana, non golden image
  pixel-perfect. La revisione controlla piazza, porto, grotta e terrazza a scala
  1x e ingrandita nearest-neighbour, la leggibilità degli Object, gli alpha,
  gli anchor, la profondità e l'assenza di anacronismi evidenti.
- Il gate di separazione dell'Example continua a verificare che il codice
  runtime non importi master artistici o sorgenti dell'Engine. Può essere
  adattato alla nuova organizzazione senza diventare un secondo seam di
  gameplay.
- La build e la suite completa della root verificano che l'artefatto
  distribuibile e le Engine Capability esistenti non regrediscano. Build e
  test dell'Example verificano type-check, pipeline locale e percorso browser.
- Non sono richiesti nuovi test unitari del core perché la spec non modifica
  l'Engine. Un fallimento che riveli un vero difetto dell'Engine deve essere
  separato dal lavoro sull'Example prima di ampliare lo scope.

## Out of Scope

- Modifiche all'interface pubblica, al core, al renderer o al modello di stato
  di Fondale.
- Localizzazione generale dell'HUD dell'Engine o traduzione del controllo
  `Reveal hotspots`.
- Migrazione o riparazione dei Save Snapshot appartenenti al Project Version
  precedente.
- Un secondo enigma nella piazza, nella grotta o presso il posto di vedetta e
  un capitolo narrativo completo.
- Animazioni idle o parlate complete per Raffaele, ritratti di dialogo, doppiaggio,
  musica, effetti sonori o loop ambientali.
- Generazione di Background ulteriori rispetto ai quattro master forniti dal Player.
- Valuta numerica, economia, quest log o modellazione del compenso oltre alla
  risposta narrativa.
- Nuove promesse per touch, gamepad, keyboard-only world navigation, browser
  diversi da quelli della Support Baseline o accessibilità generale.
- Un editor visuale, una pipeline artistica generica dell'Engine o asset
  artistici esposti dal pacchetto Fondale.
- Confronti screenshot pixel-perfect o approvazione automatica della qualità
  estetica delle immagini generate.

## Further Notes

- La spec applica ADR-0001: l'interazione resta contestuale sull'intera Scene e
  lo stesso elemento visivo cambia significato in base al Game State, senza
  introdurre una griglia di verbi.
- La spec applica ADR-0002: Capri 1535 esercita le Engine Capability come
  Example separato e non porta contenuto specifico di Capri negli interni.
- La spec applica ADR-0003: condizioni, Sequence e Game Operation rimangono
  dichiarative; soltanto l'osservazione specifica dal parapetto usa un Game
  Behavior.
- La spec applica ADR-0004: né il Game Project né i test accedono al renderer.
- La spec applica ADR-0005: il lavoro valida capacità già pubbliche senza
  estendere il contratto della Versione 1.
- Il seam di test è stato concordato durante la sessione di progettazione:
  Playwright rappresenta il comportamento del Player al confine più alto
  disponibile. La verifica statica e la revisione visuale sono gate
  complementari, non seam alternativi.
- La fase corrente richiede che il lavoro venga committato e pubblicato
  direttamente su `main`, senza feature branch o pull request.
