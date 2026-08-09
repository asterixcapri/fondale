# Fondale 1.1 — Interfaccia classica a comandi modernizzata

Status: ready-for-agent

## Problem Statement

Il Player di Capri 1535 non riesce a leggere con sicurezza le possibilità del
mondo. I Scene Passage non sono distinguibili finché non vengono trovati per
tentativi, l'Inventory non rende chiaro dove siano finiti gli Object usati e
ogni Noun offre una sola Primary Action nascosta. Il Player non può quindi
ragionare attraverso verbi, oggetti e risposte come in una classica avventura
LucasArts, né capire se un click camminerà, userà un Object o cambierà Scene.

Anche dialoghi e Choice separano eccessivamente testo e Character: le Line non
costruiscono una conversazione visivamente ancorata al mondo, mentre le Choice
non occupano lo stesso spazio espressivo del HUD. L'Example dimostra capacità
tecniche, ma non comunica un linguaggio di gioco coerente.

Per l'Author, il modello Primary Action più Inventory Use non può descrivere in
modo uniforme Give, Talk To, Pick Up, Look At, Open, Close, Push, Pull, Use e
Walk To. Hotspot, Object e Scene Passage hanno contratti diversi, i fallback
non garantiscono una risposta percepibile e lo stile del HUD non è una parte
dichiarativa del Game Project. Aggiungere questi comportamenti caso per caso
produrrebbe logica specifica di Capri dentro l'Engine.

## Solution

Fondale 1.1 sostituisce il modello contestuale con un'interfaccia classica a
Command, ispirata al ritmo di Monkey Island 2 e modernizzata secondo il
comportamento di Thimbleweed Park. Nove Verb restano visibili in una griglia
3×3, Walk To è implicito, l'Inventory presenta otto slot permanenti e il Player
compone una frase con uno o due Noun. Il click destro esegue il Preferred Verb,
Tab rivela temporaneamente i Noun disponibili e ogni Command produce una
Command Response o un cambiamento percepibile.

Il Background continua a occupare l'intera Logical Resolution 426×240. Il HUD
Engine-owned usa la struttura bilanciata approvata nel prototipo: griglia dei
Verb a sinistra, Inventory 4×2 a destra e Scene dominante sotto un piano
inferiore trasparente. Il HUD Theme scelto per Capri è “Moderno trasparente”:
testo sabbia, Preferred Verb oro-corallo, selezione turchese, Inventory wells
scuri e leggeri, Command Preview vicino al puntatore e un font pixel originale
compatto e amichevole.

Line e Command Response pronunciate appaiono sopra il Character; la narrazione
è centrata. Durante una Choice, fino a sei alternative sostituiscono Verb e
Inventory nella fascia inferiore e la frase scelta viene normalmente
pronunciata dal Player Character. Input, Options, Help e Save/Load seguono le
decisioni di ADR-0006.

Capri 1535 migra integralmente al nuovo contratto, conserva l'enigma del porto,
aggiunge una taverna facoltativa con Oste, rinomina il precedente lookout in
Monte Solaro e adotta una mappa bidirezionale leggibile. Dialoghi e risposte
sono in italiano; identità artistica e asset restano originali del progetto.

## User Stories

1. Come Player, voglio vedere sempre i nove Verb, così da conoscere le azioni che il gioco mi permette di tentare.
2. Come Player, voglio che Walk To resti implicito, così da camminare senza occupare uno dei nove controlli visibili.
3. Come Player, voglio trovare Open, Pick Up e Push nella prima riga, così da memorizzare la disposizione stabile del HUD.
4. Come Player, voglio trovare Close, Look At e Pull nella seconda riga, così da costruire rapidamente un Command.
5. Come Player, voglio trovare Give, Talk To e Use nella terza riga, così da ritrovare il ritmo dell'interfaccia di riferimento.
6. Come Player italiano, voglio leggere Apri, Raccogli, Spingi, Chiudi, Guarda, Tira, Dai, Parla con e Usa, così da giocare nella lingua del contenuto.
7. Come Player, voglio che la posizione dei Verb non cambi con la lingua, così da conservare la memoria spaziale.
8. Come Player, voglio usare QWE, ASD e ZXC per le tre righe di Verb, così da selezionare un'azione senza spostare il puntatore.
9. Come Player, voglio vedere il Verb selezionato, così da sapere quale frase sto costruendo.
10. Come Player, voglio vedere il Noun sotto il puntatore, così da sapere quale bersaglio verrà usato.
11. Come Player, voglio vedere il Command Preview vicino al puntatore, così da controllare la frase senza distogliere lo sguardo dalla Scene.
12. Come Player, voglio che il Command Preview resti entro i bordi, così da poterlo leggere anche vicino agli estremi della Scene.
13. Come Player nostalgico, voglio poter attivare una Sentence Line fissa, così da usare una presentazione più classica.
14. Come Player, voglio che il click sinistro sul terreno esegua Walk To, così da muovermi con il gesto principale.
15. Come Player, voglio che il click sinistro su un Noun completi il Verb selezionato, così da eseguire intenzionalmente un Command.
16. Come Player, voglio che il click destro esegua il Preferred Verb, così da usare rapidamente l'azione più plausibile.
17. Come Player, voglio che il Preferred Verb sia evidenziato al passaggio del puntatore, così da scoprirlo prima di usare il click destro.
18. Come Player, voglio che il click destro non cancelli un Command binario incompleto, così da non perdere una frase che sto componendo.
19. Come Player, voglio annullare un Command incompleto con Escape, così da tornare consapevolmente a Walk To.
20. Come Player, voglio che un Command concluso torni a Walk To, così da non applicare accidentalmente lo stesso Verb al click successivo.
21. Come Player, voglio che anche un Command fallito torni a Walk To, così da avere uno stato prevedibile dopo la risposta.
22. Come Player, voglio fare doppio click su terreno o Passage per una Fast Walk, così da attraversare più rapidamente una Scene nota.
23. Come Player, voglio che Fast Walk cambi soltanto la velocità, così da non saltare condizioni o Interaction.
24. Come Player, voglio che un nuovo comando di movimento sostituisca quello precedente, così da poter cambiare idea immediatamente.
25. Come Player, voglio che un Command sul mondo porti il Character all'Approach Point, così da mantenere movimento e Interaction coerenti.
26. Come Player, voglio che il Command venga rivalutato all'arrivo, così da non applicare un'intenzione diventata invalida durante il movimento.
27. Come Player, voglio che i Command fra soli Object nell'Inventory siano immediati, così da non aspettare un movimento privo di senso.
28. Come Player, voglio che Give richieda sempre due Noun, così da sapere che devo scegliere cosa dare e a chi.
29. Come Player, voglio usare Use con uno o due Noun, così da azionare un oggetto o combinarlo con un altro.
30. Come Player, voglio che gli altri Verb richiedano un solo Noun, così da comporre frasi chiare.
31. Come Player, voglio usare un Object dell'Inventory come primo Noun, così da iniziare “Usa ampolla d'olio con…”.
32. Come Player, voglio usare un Object dell'Inventory come secondo Noun, così da combinare elementi in entrambi i versi consentiti dall'authoring.
33. Come Player, voglio ricevere una risposta per ogni Command completo, così da non interpretare il silenzio come un errore del gioco.
34. Come Player, voglio risposte specifiche per le combinazioni importanti, così da percepire che il mondo comprende la mia intenzione.
35. Come Player, voglio fallback locali coerenti con il Noun, così da ricevere una risposta pertinente anche senza un caso specifico.
36. Come Player, voglio fallback globali coerenti con il Verb, così da ricevere comunque una risposta quando il Noun non ne definisce una.
37. Come Player, voglio che raccolta, consumo e ricollocazione siano accompagnati da feedback, così da capire dove sia finito un Object.
38. Come Player, voglio vedere un Object raccolto entrare nell'Inventory, così da collegare l'azione alla nuova disponibilità.
39. Come Player, voglio vedere un Object consumato uscire dall'Inventory, così da capire che non è più utilizzabile.
40. Come Player, voglio vedere un Object collocato apparire sul bersaglio, così da percepire la trasformazione del mondo.
41. Come Player, voglio che un Object non scompaia mai senza risposta o animazione breve, così da non perdere traccia del Game State.
42. Come Player, voglio vedere sempre otto slot 4×2, così da sapere dove cercare gli Object trasportati.
43. Come Player, voglio vedere slot vuoti quando l'Inventory è vuoto o parziale, così da riconoscere la capacità disponibile.
44. Come Player, voglio scorrere l'Inventory con frecce e rotellina, così da raggiungere più di otto Object.
45. Come Player, voglio che un Object appena acquisito venga portato in vista, così da notare immediatamente la raccolta.
46. Come Player, voglio riconoscere l'Object selezionato senza affidarmi soltanto al colore, così da non confonderlo con un semplice hover.
47. Come Player, voglio usare Tab per rivelare temporaneamente i Noun disponibili, così da superare un momento di blocco senza un overlay permanente.
48. Come Player, voglio che Tab mostri soltanto Noun e Passage attivi, così da non ricevere indizi falsi.
49. Come Player, voglio che il reveal scompaia quando rilascio Tab, così da tornare subito alla Scene pulita.
50. Come Player, voglio che un Scene Passage mostri un cursore direzionale, così da distinguerlo da un normale Noun.
51. Come Player, voglio che la direzione del cursore corrisponda a sinistra, destra, su, giù o entra, così da anticipare il movimento.
52. Come Player, voglio leggere la destinazione di un percorso noto, così da costruire una mappa mentale del mondo.
53. Come Player, voglio leggere un nome fisico per un percorso ancora sconosciuto, così da esplorare senza anticipazioni artificiali.
54. Come Player, voglio che i percorsi principali di Capri dichiarino subito la destinazione, così da non ripetere la confusione del cancello.
55. Come Player, voglio che i Passage siano suggeriti dalla composizione della Scene, così da trovarli anche senza Tab.
56. Come Player, voglio che non esista un contorno permanente sui Passage, così da preservare l'immersione e la direzione artistica.
57. Come Player, voglio che il Background resti visibile a pieno frame, così da non perdere parte degli scenari forniti.
58. Come Player, voglio che il HUD sia trasparente sopra la fascia inferiore, così da mantenere la Scene dominante.
59. Come Player, voglio che la zona sotto il HUD non contenga interazioni essenziali, così da non cliccare elementi nascosti dai controlli.
60. Come Player, voglio che il frame 426×240 venga scalato uniformemente, così da preservare proporzioni e pixel art.
61. Come Player, voglio eventuale letterboxing invece di deformazioni, così da vedere Character e Scene con la forma corretta.
62. Come Player su un desktop 900×700, voglio che testo, slot e hit area restino leggibili, così da rientrare nella Support Baseline.
63. Come Player, voglio una struttura bilanciata con Verb a sinistra e Inventory a destra, così da distinguere azioni e oggetti senza coprire il centro.
64. Come Player, voglio un HUD Theme moderno e trasparente, così da avere chiarezza contemporanea senza perdere il carattere dell'avventura.
65. Come Player, voglio testo normale color sabbia, così da leggerlo sui fondali chiari e scuri.
66. Come Player, voglio il Preferred Verb oro-corallo, così da riconoscere l'azione rapida suggerita.
67. Come Player, voglio lo stato selezionato turchese, così da distinguerlo dal suggerimento e dal testo normale.
68. Come Player, voglio Inventory wells leggeri e traslucidi, così da riconoscere gli slot senza creare un pannello pesante.
69. Come Player, voglio un font pixel originale e amichevole, così da percepire una personalità coerente con Capri 1535.
70. Come Player italiano, voglio che il font supporti lettere accentate, apostrofi e punteggiatura italiana, così da leggere ogni dialogo correttamente.
71. Come Player, voglio che il font resti leggibile alle dimensioni logiche reali, così da non dipendere da un mockup ad alta risoluzione.
72. Come Player, voglio che una Line pronunciata appaia sopra il Character che parla, così da associare immediatamente voce e speaker.
73. Come Player, voglio che il testo segua il Character ma resti dentro la zona sicura, così da non finire sotto il HUD o fuori frame.
74. Come Player, voglio che una Line vada a capo entro una larghezza massima, così da poter leggere battute lunghe senza attraversare tutta la Scene.
75. Come Player, voglio che il colore del testo identifichi il Character, così da distinguere gli speaker nelle conversazioni.
76. Come Player, voglio che la narrazione sia centrata nella Scene, così da distinguerla da una battuta pronunciata.
77. Come Player, voglio che una Command Response pronunciata usi la stessa presentazione delle Line, così da avere un linguaggio visivo unico.
78. Come Player, voglio che il Player Character sia lo speaker predefinito di una Command Response, così da evitare attribuzioni ambigue.
79. Come Player, voglio che una battuta senza speaker visibile sia centrata, così da non cercare un Character fuori scena.
80. Come Player, voglio che una Line avanzi automaticamente secondo testo, velocità o audio, così da non dover cliccare ogni volta.
81. Come Player, voglio premere punto o il pulsante centrale per saltare la Line corrente, così da avanzare il testo con i controlli di riferimento.
82. Come Player, voglio che click sinistro e destro non attraversino una Line, così da non eseguire accidentalmente un Command mentre leggo.
83. Come Player, voglio che Escape salti soltanto una Sequence dichiarata skippable, così da non chiudere accidentalmente una conversazione.
84. Come Player, voglio che le Choice sostituiscano temporaneamente Verb e Inventory, così da concentrare l'attenzione sulla conversazione.
85. Come Player, voglio vedere al massimo sei Choice Alternative, così da leggerle tutte senza scorrimento nascosto.
86. Come Player, voglio usare i tasti 1–6 per scegliere una frase, così da rispondere rapidamente.
87. Come Player, voglio che una Choice selezionata venga normalmente pronunciata dal Player Character, così da vedere una conversazione completa.
88. Come Player, voglio che una Choice possa essere non pronunciata quando dichiarato, così da supportare alternative tecniche o ellittiche.
89. Come Player, voglio che il Command State precedente venga ripristinato dopo la Choice, così da non perdere una frase sospesa.
90. Come Player, voglio che durante una Choice gli altri input di mondo siano bloccati, così da non interrompere la Sequence dominante.
91. Come Player, voglio aprire Options con F5, così da seguire la scorciatoia scelta per il modello di riferimento.
92. Come Player, voglio aprire Save con Ctrl+S e Load con Ctrl+L, così da gestire rapidamente i salvataggi.
93. Come Player, voglio raggiungere Save e Load anche da Options, così da non dover ricordare le scorciatoie.
94. Come Player, voglio creare Save Slot liberi e nominati, così da riconoscere i miei progressi.
95. Come Player, voglio vedere un Save Snapshot incompatibile con una spiegazione, così da capire perché non può essere caricato.
96. Come Player, voglio regolare la velocità del testo, così da adattare il ritmo di lettura.
97. Come Player, voglio regolare opacità o sfondo del HUD, così da bilanciare leggibilità e visibilità della Scene.
98. Come Player, voglio scegliere Command Preview moderno o Sentence Line classica, così da adattare la presentazione alle mie preferenze.
99. Come Player, voglio scegliere se visualizzare il testo parlato, così da coordinare testo ed eventuale audio.
100. Come Player, voglio vedere i controlli audio soltanto quando il Game Project usa audio, così da non trovare opzioni prive di effetto.
101. Come Player, voglio una schermata Help con controlli e scorciatoie, così da imparare il sistema senza uscire dal gioco.
102. Come nuovo Player, voglio un suggerimento una tantum sul click sinistro, così da capire come camminare e completare un Command.
103. Come nuovo Player, voglio un suggerimento una tantum sul click destro, così da scoprire il Preferred Verb.
104. Come nuovo Player, voglio un suggerimento una tantum su Tab, così da scoprire il reveal dei Noun.
105. Come nuovo Player, voglio un suggerimento una tantum sullo scorrimento dell'Inventory, così da trovare gli Object oltre la prima pagina.
106. Come Player, voglio che i suggerimenti già mostrati siano ricordati fra sessioni, così da non rivederli continuamente.
107. Come Player, voglio che le Player Preference non cambino la logica del gioco, così da ottenere gli stessi risultati indipendentemente dalle opzioni visive.
108. Come Author, voglio definire un Noun con etichette, Preferred Verb, Command Case e fallback, così da usare lo stesso modello per tutto il mondo.
109. Come Author, voglio usare una Noun Definition per Hotspot, Object, Character, Scenery e Passage, così da non imparare contratti diversi.
110. Come Author, voglio dichiarare Noun Label condizionali con fallback obbligatorio, così da rappresentare conoscenza e cambi di stato senza inferenza linguistica.
111. Come Author, voglio dichiarare Preferred Verb condizionali, così da suggerire un'azione diversa quando cambia il Game State.
112. Come Author, voglio ordinare i Command Case dichiarativi, così da risolvere prima il caso più specifico eleggibile.
113. Come Author, voglio che un Command Case possa produrre risposta, Game Operation o Sequence, così da comporre interazioni narrative e logiche.
114. Come Author, voglio definire fallback locali per Verb su un Noun, così da scrivere risposte coerenti senza enumerare ogni combinazione.
115. Come Author, voglio definire fallback globali response-only nel Game Project, così da garantire una risposta finale senza mutazioni generiche inattese.
116. Come Author, voglio che l'assenza di ogni fallback produca un Authoring Diagnostic, così da eliminare i silenzi prima della pubblicazione.
117. Come Author, voglio un Command Lexicon con etichette e modelli grammaticali, così da localizzare le frasi senza affidarmi a inferenze dell'Engine.
118. Come Author, voglio che il Command Lexicon gestisca Command unari e binari, così da presentare correttamente “Usa X con Y” e “Dai X a Y”.
119. Come Author, voglio dichiarare la Passage Direction, così da ottenere il cursore corretto dal HUD Theme.
120. Come Author, voglio un Authoring Diagnostic se più di sei Choice sono eleggibili, così da correggere un dialogo non presentabile.
121. Come Author, voglio un Authoring Diagnostic se contenuto interattivo cade nella fascia riservata al HUD, così da non nascondere gameplay essenziale.
122. Come Author, voglio fornire un HUD Theme dichiarativo, così da personalizzare il gioco senza accedere a DOM o CSS dell'Engine.
123. Come Author, voglio configurare palette, font, bordi, sfondo, opacità, selezione e colori degli speaker, così da dare identità al Game Project.
124. Come Author, voglio fornire un asset font runtime locale, così da distribuire il gioco senza dipendenze da CDN.
125. Come Author, voglio che il Game Project non possa cambiare la struttura semantica del HUD, così da conservare un contratto Engine-owned verificabile.
126. Come Author, voglio che il Command State appartenga al Save Snapshot, così da ripristinare esattamente un Command incompleto.
127. Come Author, voglio che hover e posizione del puntatore restino transitori, così da non serializzare dettagli di presentazione.
128. Come Author, voglio che le Player Preference restino fuori dai Save Snapshot, così da separare progresso e configurazione locale.
129. Come Author di Capri, voglio migrare tutti i Noun al nuovo contratto, così da non mantenere un secondo modello contestuale.
130. Come Author di Capri, voglio risposte italiane specifiche per i Command importanti, così da conservare tono e indizi dell'enigma.
131. Come Author di Capri, voglio fallback italiani caratteristici per le altre combinazioni, così da coprire i nove Verb senza testi ripetitivi.
132. Come Player di Capri, voglio esplorare `alley ↔ townSquare ↔ harbour ↔ grotto ↔ monteSolaro`, così da percepire una geografia bidirezionale coerente.
133. Come Player di Capri, voglio che Monte Solaro torni alla grotta, così da non essere teletrasportato direttamente al porto.
134. Come Player di Capri, voglio entrare nella taverna dal porto e tornare dal portone centrale, così da comprendere il collegamento fra le due Scene.
135. Come Player di Capri, voglio esaminare la porta sinistra chiusa della taverna, così da ricevere una risposta invece di trovare una falsa uscita.
136. Come Player di Capri, voglio incontrare un Oste con un breve dialogo italiano, così da rendere la taverna una deviazione narrativa significativa.
137. Come Player di Capri, voglio che la taverna resti facoltativa, così da non allungare l'enigma principale.
138. Come Player di Capri, voglio che la taverna non introduca un Object necessario, così da preservare la soluzione del porto.
139. Come Player di Capri, voglio riconoscere la nuova Scene come Monte Solaro, così da usare il nome reale al posto del generico lookout.
140. Come Player di Capri, voglio usare la scalinata sinistra di Monte Solaro come Passage di ritorno, così da seguire l'affordance visiva del master approvato.
141. Come Player di Capri, voglio conservare le conseguenze della Choice con Raffaele a Monte Solaro, così da non perdere la conclusione narrativa esistente.
142. Come Author di Capri, voglio conservare integri i master 1586×992, così da poterli rielaborare in futuro senza perdita.
143. Come Author di Capri, voglio ritagliare ogni runtime Background in 16:9 senza deformarlo, così da adattarlo a 426×240.
144. Come Author di Capri, voglio scegliere il ritaglio per singola Scene, così da proteggere Passage e informazioni importanti.
145. Come Author di Capri, voglio conservare soltanto Art Master e note di generazione sotto `art`, così da non confonderli con i file caricati.
146. Come Author di Capri, voglio collocare ogni Runtime Asset accanto alla definizione sotto `src`, così da rendere evidente il proprietario.
147. Come Player di Capri, voglio che il nuovo Project Version rifiuti chiaramente i vecchi Save Snapshot, così da non caricare identità di Scene ormai rinominate.
148. Come Maintainer, voglio rimuovere il modello Primary Action contestuale, così da non mantenere due sistemi incompatibili in Fondale 1.1.
149. Come Maintainer, voglio una guida di migrazione da Fondale 1.x, così da aggiornare un Game Project senza leggere gli interni.
150. Come Maintainer, voglio verificare il nuovo contratto dalla radice del pacchetto, così da impedire dipendenze da import privati.
151. Come Maintainer, voglio verificare Capri tramite il pacchetto distribuibile, così da dimostrare che l'interfaccia pubblica è sufficiente.
152. Come Maintainer, voglio esercitare mouse e tastiera reali in Chrome, così da verificare l'esperienza osservabile della Support Baseline.
153. Come Maintainer, voglio controllare geometria e leggibilità del HUD senza snapshot pixel-perfect, così da consentire art iteration senza perdere le invarianti.
154. Come Maintainer, voglio che un errore di font o asset produca un Authoring Diagnostic, così da evitare un avvio parziale illeggibile.
155. Come Maintainer, voglio che build, documentazione e test restino deterministici, così da poter dividere l'implementazione in tracer bullet indipendenti.

## Implementation Decisions

### Versione e migrazione

- La modifica è una sostituzione incompatibile del modello di interazione e
  costituisce Fondale 1.1. Primary Action e Inventory Use non restano disponibili
  come modalità alternativa.
- I Game Project 1.x richiedono una migrazione esplicita a Noun Definition,
  Command Case, Command Fallback, Command Lexicon e HUD Theme.
- Capri 1535 incrementa il proprio Project Version da `3` a `4`. I Save Snapshot
  precedenti restano records visibili ma incompatibili e non vengono migrati.
- La documentazione pubblica descrive il nuovo modello e include una guida di
  migrazione concettuale e ricette compilate per Command unari, binari,
  fallback, dialoghi e Passage.

### Modello di authoring

- Hotspot, Character, Scenery, Object disponibile nella Scene o nell'Inventory
  e Scene Passage partecipano all'interazione attraverso la stessa Noun
  Definition.
- Una Noun Definition contiene Noun Label localizzate, Preferred Verb
  condizionale, Command Case ordinati e Command Fallback locali per Verb.
- Le Noun Label ammettono varianti condizionali dichiarative e richiedono un
  fallback incondizionato. L'Engine non deduce automaticamente cosa conosce il
  Player.
- Preferred Verb ammette casi condizionali e fallback. Default di convenienza
  per il tipo di bersaglio possono ridurre l'authoring, ma il valore risultante
  resta dichiarativo e osservabile.
- Give ha arità binaria, Use accetta arità unaria o binaria e gli altri Verb
  visibili hanno arità unaria. Walk To è implicito e riservato a terreno e
  Passage.
- Un Command Case può produrre Command Response, Game Operation e avvio di una
  Sequence. I casi eleggibili vengono valutati nell'ordine dichiarato.
- La risoluzione segue: caso specifico, fallback locale sul Noun, fallback
  globale response-only del Game Project. Il fallback globale non può mutare il
  Game State o avviare Sequence.
- Un progetto che non garantisce una risposta per ogni Command completo produce
  Authoring Diagnostic. Non esiste un silent no-op.
- Il Command Lexicon possiede etichette dei Verb e modelli grammaticali per
  frasi unarie e binarie. L'Engine non concatena parole o deduce preposizioni.
- Una Command Response dichiara testo, eventuale speaker e presentazione come
  speech o narration; in assenza di speaker usa il Player Character per lo
  speech.
- Ogni Scene Passage dichiara Noun Definition, Approach Point, destination e
  Passage Direction `left`, `right`, `up`, `down` o `enter`.
- Una Choice Alternative usa il proprio testo anche come Line pronunciata e
  accetta un flag `spoken` con default `true`. Più di sei alternative eleggibili
  sono invalide.

### Command State e risoluzione runtime

- Command State contiene Verb selezionato ed eventuale primo Noun. Appartiene al
  Game State e al Save Snapshot; hover, puntatore e Preferred Verb presentato
  sono transitori.
- Lo stato neutro è Walk To. Un Command completo o fallito torna allo stato
  neutro; Escape annulla soltanto una frase incompleta.
- Il click destro risolve il Preferred Verb in modo rapido senza cambiare il
  Command State incompleto già presente.
- Un Command rivolto al mondo crea un Player Intent verso l'Approach Point. Un
  nuovo Player Intent sostituisce quello in corso; il Command viene risolto sul
  Game State più recente dopo l'arrivo.
- I Command composti esclusivamente da Object nell'Inventory si risolvono senza
  movimento.
- Fast Walk usa lo stesso Player Intent, destinazione, validazione e risultato
  di Walk To, cambiando soltanto la velocità di presentazione.
- Feedback standard brevi rappresentano acquisizione, rimozione e collocazione
  degli Object. Questi feedback non sono traiettorie personalizzabili fra Scene
  e HUD.

### HUD, Inventory e input

- Il Background occupa l'intera Logical Resolution 426×240. Il HUD è un overlay
  Engine-owned permanente sulla fascia inferiore e non accorcia la Scene.
- La struttura stabile approvata è Variant A: Verb 3×3 a sinistra e Inventory
  4×2 a destra su un unico piano trasparente. Il centro della Scene resta
  percettivamente dominante.
- L'ordine della griglia è Open/Pick Up/Push, Close/Look At/Pull,
  Give/Talk To/Use. Le scorciatoie posizionali sono QWE/ASD/ZXC.
- Inventory mostra otto slot anche quando vuoto, usa frecce e rotellina per la
  paginazione e porta nella pagina visibile un Object appena acquisito.
- Il Command Preview segue il puntatore e viene clamped entro la Logical
  Resolution. Un Game Setting abilita in alternativa la Sentence Line fissa.
- Hover presenta Noun Label e Preferred Verb. Un Passage aggiunge il cursore
  direzionale fornito dal HUD Theme.
- Tab rivela contorno e Noun Label dei soli bersagli attivi finché resta
  premuto. Tab non naviga il HUD; la navigazione completa del mondo da tastiera
  non appartiene alla Support Baseline 1.1.
- Click sinistro cammina o completa il Command selezionato; click destro esegue
  il Preferred Verb; doppio click sinistro su terreno o Passage richiede Fast
  Walk.
- Durante una Line, punto e click centrale anticipano la battuta. Click sinistro
  e destro non saltano e non attraversano il blocco input. Escape salta soltanto
  Sequence dichiarate skippable.
- Durante una Choice, i tasti 1–6 scelgono le alternative visibili. Gli altri
  input di mondo restano sospesi.
- F5 apre Options, Ctrl+S apre Save e Ctrl+L apre Load. Le stesse azioni sono
  raggiungibili da Options.
- Il frame viene scalato uniformemente con letterboxing. La baseline verificata
  resta Chrome corrente su desktop, incluso viewport 900×700; touch, gamepad e
  navigazione completa da tastiera restano esclusi.

### HUD Theme e direzione artistica

- L'Engine possiede semantica, struttura, stati e hit area del HUD. Il Game
  Project fornisce soltanto un HUD Theme dichiarativo; non riceve DOM, CSS,
  callback di rendering o accesso PixiJS.
- HUD Theme espone palette, asset font locale, sfondo/opacità, bordi leggeri,
  colori normal/preferred/selected, Inventory wells, cursori direzionali e
  colori speech per Character.
- Capri adotta il verdetto del prototipo “A — Moderno trasparente”: gradiente
  blu notte quasi senza cornice, testo sabbia, Preferred Verb oro-corallo,
  selezione turchese, Inventory wells scuri traslucidi e Command Preview compatto.
- Pixelify Sans è soltanto il proxy OFL usato dal prototipo. Il deliverable
  finale richiede un font pixel originale, bundled, compatto, amichevole,
  leggermente irregolare, leggibile alla risoluzione logica e completo per il
  testo italiano.
- Il font, i cursori e gli eventuali elementi raster definitivi hanno Art Master
  nel progetto; le copie elaborate e importate dal gioco sono Runtime Asset
  accanto ai moduli proprietari.
- La somiglianza con i giochi di riferimento riguarda gerarchia, ritmo e
  affordance. Non si copiano asset, font, palette, icone o decorazioni
  proprietarie.

### Speech, Choice e Options

- Line e Command Response condividono un solo sistema di presentazione. Speech
  è ancorato sopra lo speaker, clamped nella safe region sopra il HUD e wrappato
  alla larghezza massima del tema; narration è centrata.
- Il colore speech deriva dal Character attraverso HUD Theme. Se lo speaker non
  è visibile, la presentazione è centrata.
- La durata automatica deriva da testo, Player Preference di velocità ed
  eventuale audio. La presenza di audio abilita i relativi controlli Options.
- Choice sostituisce temporaneamente Verb e Inventory nella fascia inferiore;
  al termine ripristina il Command State sospeso.
- Options include text speed, speech text visibility, HUD backing/opacity,
  Command Preview versus Sentence Line, eventuali volumi, Help, Save e Load.
- Help riepiloga mouse, Tab, rotellina, QWE/ASD/ZXC, 1–6, F5, Ctrl+S, Ctrl+L,
  punto, click centrale ed Escape.
- I suggerimenti una tantum per click sinistro, click destro, Tab e Inventory
  sono Player Preference locali e non Game State.
- Save/Load è Engine-owned e presenta Save Slot liberi e nominati, identificati
  per Project Identity e Project Version. Un record incompatibile resta visibile
  con spiegazione e non può essere caricato.
- Numero esatto di slot, miniature, autosave e cloud non fanno parte del
  contratto di questa versione.

### Diagnostiche e riserva del HUD

- La fascia inferiore coperta dal HUD resta visibile ma non può contenere
  Hotspot, Scene Passage, Approach Point, Walkable Region raggiungibile o
  informazione visiva essenziale.
- Le definizioni che intersecano la fascia riservata producono Authoring
  Diagnostic strutturati e stabili. La validazione raccoglie problemi
  indipendenti senza cascata ridondante.
- HUD Theme incompleto, font non caricabile o asset con dimensioni incompatibili
  impediscono un mount parziale e producono diagnostiche contestuali.
- Noun senza label fallback, Preferred Verb irrisolvibile, arità incompatibile,
  assenza di fallback finale, Passage Direction invalida e più di sei Choice
  eleggibili sono condizioni diagnostiche.

### Migrazione di Capri 1535

- Storia ed enigma dell'argano restano invariati. Ogni bersaglio riceve Noun
  Label italiana, Preferred Verb e Command Case rilevanti; le altre combinazioni
  usano fallback italiani coerenti con Michele.
- La mappa diventa `alley ↔ townSquare ↔ harbour ↔ grotto ↔ monteSolaro`, con
  deviazione facoltativa `harbour ↔ tavern`. Tutti i collegamenti sono
  bidirezionali salvo futura motivazione narrativa esplicita.
- Nel porto il grande arco continua a condurre alla piazza e una porta alla sua
  sinistra conduce alla taverna. Il portone centrale della taverna torna al
  porto; la porta sinistra resta un Noun chiuso e rispondente.
- La taverna include un Oste con breve Sequence italiana e Noun ambientali. Non
  introduce Object, flag o passaggi necessari a completare l'enigma principale.
- La Scene `lookout`, la relativa variabile e la Sequence conclusiva vengono
  rinominate con il termine `monteSolaro`. La conclusione condizionale legata a
  Raffaele resta osservabile.
- Monte Solaro usa la scalinata sinistra come Passage per tornare alla grotta;
  viene rimosso il ritorno diretto al porto.
- I percorsi principali usano destinazioni esplicite nelle Noun Label italiane.
- I nuovi master taverna e Monte Solaro restano intatti. Ogni Background runtime
  deriva da un crop 16:9 art-directed e da resize a 426×240 senza stretching.
- Art Master e note di generazione restano nella libreria `art`; Runtime Asset,
  Game Definition e dialoghi appartengono ai moduli `src`.
- La migrazione rimuove il prototipo usa-e-getta dalla build finale dopo aver
  trasferito struttura e token del tema nell'implementazione di produzione.

## Testing Decisions

- I test verificano comportamento osservabile e contratti pubblici, non
  reducer, strutture dati private, chiamate PixiJS, classi CSS o dettagli del
  prototipo.
- Il primo seam è la public authoring interface: Game Project minimi costruiti
  attraverso gli export di package root verificano Noun Definition, Command
  Lexicon, arità, fallback, Preferred Verb, Passage Direction, HUD Theme,
  Choice, Save Snapshot e aggregazione degli Authoring Diagnostic.
- Il prior art del seam di authoring sono i test esistenti della public API,
  delle recipe compilate e della validazione di Save Snapshot. I nuovi casi
  devono continuare a importare soltanto dalla radice del pacchetto.
- Il secondo seam è il browser pubblico: un Game Project pacchettizzato viene
  avviato con `startGame` e controllato attraverso mouse e tastiera reali. Capri
  1535 è il consumer esterno principale; fixture minime sono ammesse soltanto
  quando isolano un errore di startup non rappresentabile nell'Example.
- Il browser seam verifica almeno: griglia e scorciatoie dei nove Verb, Walk To,
  click destro, Fast Walk, Command Preview, Command unario e binario, reset e
  cancel, revalidation dopo movimento, Inventory 4×2 e paginazione, feedback
  degli Object, Tab reveal, cursori Passage, Speech, narration, sei Choice,
  input bloccato, spoken false, Options, Help, Save/Load e ripristino Command
  State.
- La suite Capri completa il percorso dall'alley a Monte Solaro, visita la
  taverna, torna lungo collegamenti bidirezionali, risolve l'argano in entrambi i
  rami di dialogo e verifica le relative conclusioni italiane.
- La suite verifica a 1280×720 e 900×700 che il frame mantenga 426×240, il HUD
  non riordini Verb o Inventory, Speech resti sopra il HUD e Command Preview,
  Choice e hit area rimangano entro i bordi.
- I controlli visivi confrontano bounding box, presenza, ordine, stato e
  leggibilità; non usano screenshot pixel-perfect come gate automatico. Una
  breve revisione degli screenshot accompagna i ticket che cambiano HUD Theme,
  font, cursori o crop dei Background.
- Il project verification gate assicura che Art Master non siano importati a
  runtime, che Runtime Asset risiedano con i moduli proprietari e che i master
  approvati non siano sovrascritti dalla pipeline.
- La build di produzione non include route, switcher, font proxy o stato del
  prototipo. Il comando prototipo può restare soltanto finché serve come fonte
  primaria e viene rimosso nel ticket che promuove il tema definitivo.
- Ogni ticket esegue il minimo set rosso-verde pertinente; la chiusura della
  feature richiede build root, document gate, browser suite root, build Example,
  project verification e suite Playwright Capri senza retry tollerati.

## Out of Scope

- Character Switching e Inventory separati per Character.
- Modalità Casual/Hard, hint system e cambiamenti alla topologia dell'enigma
  oltre a taverna e mappa bidirezionale approvate.
- Touch, gamepad, mobile layout e navigazione completa del mondo da tastiera.
- Conformità generale a uno standard di accessibilità oltre la Support Baseline
  esplicitamente verificata.
- Inferenza grammaticale, traduzione automatica o localizzazione Engine completa.
- DOM, CSS, renderer callback o plugin HUD forniti dal Game Project.
- Silent Command, fallback globali mutanti e arità Verb personalizzabili.
- Animazioni personalizzate di volo fra Scene e Inventory.
- Copia di asset, font, icone, palette o interfacce proprietarie di Monkey
  Island 2 o Thimbleweed Park.
- Numero fisso di Save Slot, miniature, autosave, cloud save e migrazione dei
  Save Snapshot di Capri versione 3.
- Nuovi Object o requisiti di puzzle nella taverna.
- Audio obbligatorio, doppiaggio e produzione di effetti sonori.
- Refactoring generali del renderer o del core non richiesti dai nuovi contratti
  pubblici e dai due seam di test.
- Le Scene master non ancora poste esplicitamente in scope, incluse eventuali
  directory di lavoro locali non tracciate.

## Further Notes

- ADR-0006 è la fonte normativa delle decisioni di interazione. Questa spec le
  rende costruibili e aggiunge il verdetto visuale del prototipo senza
  sostituire l'ADR.
- Il confronto delle tre strutture è conservato nel commit `b00a7e4`; il tema
  selezionato è conservato nel commit `10814f3`. Il codice del prototipo è
  intenzionalmente throwaway e non stabilisce interface pubbliche.
- Il mockup “Moderno trasparente” e lo screenshot del prototipo selezionato sono
  fonti visuali temporanee richiamate dal relativo handoff in `/tmp`; la spec
  descrive tutte le proprietà che devono sopravvivere anche quando quei file non
  saranno più disponibili.
- Pixelify Sans è distribuito sotto SIL Open Font License 1.1 ed è usato soltanto
  come proxy verificabile. La produzione del font originale Capri è un
  deliverable artistico separabile, ma blocca la chiusura del tema finale.
- La feature è deliberatamente multi-sessione e deve essere suddivisa con
  `to-tickets` in tracer bullet blocker-aware prima di qualsiasi implementazione
  di produzione.
