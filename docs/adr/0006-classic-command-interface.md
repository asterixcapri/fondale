---
status: accepted
---

# Interfaccia classica a comandi modernizzata

Fondale adotta un'interfaccia a comandi ispirata al modello di Monkey Island 2
e modernizzata secondo Thimbleweed Park: verbi sempre visibili, frase composta,
inventario permanente, nomi dei bersagli al passaggio del mouse e un verbo
preferito per l'esecuzione rapida. Questa decisione sostituisce l'interazione
contestuale di ADR-0001, perché una sola azione primaria nasconde le possibilità
del mondo e rende poco leggibili sia i passaggi fra Scene sia il ciclo di vita
degli Object.

La somiglianza riguarda il modello d'interazione, non la copia di contenuti,
grafica o interfacce proprietarie. Fondale conserva il proprio dominio e lascia
ai Game Project identità artistica, scrittura e regole degli enigmi originali.
Quando ergonomia moderna e comportamento osservabile di Thimbleweed Park sono
in tensione, la fedeltà a Thimbleweed Park è il criterio prioritario; ogni
deviazione richiede una decisione esplicita, non un miglioramento implicito.

I nove Verb visibili sono Give, Talk To, Pick Up, Look At, Open, Close, Push,
Pull e Use; Walk To resta implicito per terreno e Scene Passage. Il passaggio
del puntatore presenta il Noun e il Verb preferito, il click sinistro costruisce
il Command o cammina sul terreno e il click destro esegue il Verb preferito.
Il Background continua a occupare l'intera Logical Resolution 426×240. Il HUD
trasparente si sovrappone alla fascia inferiore della Scene, come in Thimbleweed
Park; il Game Project riserva quella fascia da Interaction e informazioni
visive essenziali. Il Command Preview segue il puntatore e resta entro i bordi;
una Sentence Line fissa in stile classico è un Game Setting opzionale. Altezza,
leggibilità e hit area vengono validate con un prototipo senza ritagliare o
rielaborare i master delle Scene.

Il modello contestuale non rimane come Game Setting alternativo: la modifica è
incompatibile, introduce Fondale 1.1 e richiede la migrazione dei Game Project.
Character Switching e Inventory separati per Character non appartengono a
questa decisione e richiederanno una futura Engine Capability motivata da un
Game Project concreto.

Give costruisce sempre un Command binario, Use può essere unario o binario e
gli altri Verb sono unari. Ogni combinazione riceve una risposta, usando
fallback localizzati del Game Project quando il Noun non definisce un caso più
specifico. Il Preferred Verb è dichiarativo, condizionale e può partire da un
valore ovvio per tipo di bersaglio senza essere l'unica azione disponibile.

Il Verb selezionato e l'eventuale primo Noun costituiscono Command State e
appartengono al Save Snapshot; il Noun sotto il puntatore è soltanto
presentazione transitoria. Un Object raccolto, consumato o ricollocato non
scompare silenziosamente: il cambiamento produce una risposta percepibile e un
aggiornamento visivo coerente fra Scene e Inventory.

Ogni Scene Passage possiede un Noun e preferisce Walk To. Durante una Choice,
le alternative occupano temporaneamente il HUD al posto di Verb e Inventory.
I termini semantici restano inglesi, mentre un Command Lexicon del Game Project
fornisce etichette e modelli grammaticali localizzati senza inferenze
linguistiche dell'Engine.

La Support Baseline 1.1 include mouse, esecuzione rapida con click destro,
rotellina per l'Inventory, Tab per rivelare i Noun, F5 per aprire Options,
Ctrl+S per Save, Ctrl+L per Load e scorciatoie posizionali QWE/ASD/ZXC per i
nove Verb. Durante una Choice, i tasti da 1 a 6 selezionano le alternative
visibili. Touch, gamepad e navigazione completa del mondo da tastiera restano
esclusi da questa modifica.

La griglia dei Verb replica la disposizione di Thimbleweed Park: Open, Pick Up,
Push sulla prima riga; Close, Look At, Pull sulla seconda; Give, Talk To, Use
sulla terza. QWE, ASD e ZXC corrispondono alle tre righe indipendentemente dalla
lingua; il Command Lexicon italiano mostra Apri, Raccogli, Spingi, Chiudi,
Guarda, Tira, Dai, Parla con e Usa.

Dopo ogni Command risolto, riuscito o fallito, il Command State torna a Walk
To; Escape annulla una costruzione incompleta e il click destro non sostituisce
quella corrente. Un Command rivolto alla Scene raggiunge l'Approach Point e
viene rivalutato sul Game State più recente, mentre i Command fra soli Object
nell'Inventory si risolvono immediatamente.

In Walk To, il click sinistro cammina verso terreno o Noun e può attivare il
comportamento di un Passage; dopo la selezione di un Verb, completa invece il
Command. Il click destro esegue il Preferred Verb senza modificare un Command
incompleto. Il doppio click sinistro su terreno o Passage produce una Fast Walk:
cambia soltanto la velocità di movimento, mai condizioni o risultato.

L'Inventory presenta sempre otto caselle in una griglia 4×2, scorre con frecce
e rotellina e porta in vista ogni Object appena acquisito. Raccolta, rimozione e
ricollocazione ricevono feedback standard brevi rispettivamente nell'Inventory
e sul bersaglio, senza animazioni personalizzabili fra HUD e Scene.

Una Command Response può essere pronunciata da un Character, usando il Player
Character come speaker predefinito, oppure presentata come narrazione. Ogni
Scene Passage mostra il proprio Noun, preferisce Walk To e usa un cursore a
freccia; Tab rivela temporaneamente Noun e Passage, mentre il controllo
diagnostico permanente viene rimosso dal normale HUD.

Save e Load sono accessibili dalla schermata Engine-owned Options e tramite
Ctrl+S e Ctrl+L; F5 apre Options. I Save Slot sono nominati e identificati per
Game Project e versione. Le Line pronunciate sono ancorate sopra il Character
che parla e la narrazione è centrata nella Scene. Le Choice
sostituiscono temporaneamente Verb e Inventory con l'elenco delle frasi nel HUD;
per impostazione predefinita la frase selezionata viene pronunciata dal Player
Character nella Scene prima di proseguire, ma una Choice Alternative può
dichiararsi non pronunciata. Poi il Command State sospeso viene ripristinato.

Il testo di una Choice Alternative è anche la Line pronunciata dal Player
Character, senza duplicazione nell'authoring, salvo quando l'Author la dichiara
non pronunciata. Line e Command Response condividono la stessa presentazione
sopra il Character, limitata ai bordi della Scene e centrata quando lo speaker
non è visibile. La durata dipende dal testo, dalla velocità configurata o
dall'eventuale audio; punto e click centrale anticipano la battuta. Click
sinistro e destro non la saltano né attraversano il blocco di input. Escape
salta soltanto Sequence dichiarate skippable.

Hotspot, Object nell'Inventory e Scene Passage adottano la stessa Noun
Definition con nome, Preferred Verb e Command Case. La risoluzione considera
prima un caso specifico, poi il fallback locale del Verb e infine il fallback
globale e response-only del Game Project; l'assenza di ogni risposta è un
Authoring Diagnostic. Casi e fallback locali possono produrre Game Operation o
avviare Sequence.

Tab rivela contorno e nome dei soli Noun e Scene Passage disponibili finché il
tasto resta premuto. L'Engine possiede la struttura del HUD, mentre il Game
Project fornisce un HUD Theme dichiarativo per palette, font, bordi, selezione,
sfondo e colori del parlato, senza DOM o CSS personalizzato.

La schermata Save/Load offre Save Slot liberi e nominati. Un Save Snapshot
incompatibile rimane visibile con la relativa spiegazione ma non può essere
caricato. Numero esatto dei Save Slot, miniature, autosave e cloud non vengono
dedotti da Thimbleweed Park e restano fuori da questa decisione.

La fedeltà a Thimbleweed Park riguarda struttura, proporzioni, controlli e
feedback dell'interazione. Font, palette, icone, decorazioni, testi e altri
asset restano originali del Game Project e sono forniti tramite HUD Theme; non
si copiano risorse proprietarie del gioco di riferimento.

Le Options pertinenti a questa modifica comprendono velocità del testo,
visibilità del testo parlato, opacità o sfondo del HUD, scelta fra Command
Preview moderno e Sentence Line classica e riepilogo delle scorciatoie. I
controlli audio si presentano quando il Game Project usa la relativa Engine
Capability. Altre preferenze non collegate a interazione e dialoghi restano
fuori dallo scope.

La migrazione di Capri 1535 conserva storia ed enigmi. Ogni Noun e Scene
Passage riceve nome e Preferred Verb espliciti; i Command rilevanti hanno
risposte italiane specifiche e le altre combinazioni usano fallback italiani
coerenti con il personaggio. Non è necessario scrivere un caso distinto per
ogni prodotto cartesiano fra Verb e Noun.

La fascia della Scene coperta dal HUD resta visibile ma non contiene Hotspot,
Scene Passage, Approach Point, Walkable Region o informazioni visive essenziali.
Una sovrapposizione di authoring produce un Authoring Diagnostic.

Questa modifica comprende Command, Inventory, Scene Passage, dialoghi, HUD e le
Options direttamente collegate. Character Switching, suggerimenti e modalità
di difficoltà richiedono decisioni e modifiche future separate.

Prima della specifica definitiva, un prototipo giocabile su una Scene di Capri
1535 deve validare il HUD trasparente, la griglia Verb 3×3, l'Inventory 4×2, un
Scene Passage riconoscibile, il Command Preview vicino al puntatore, le Line
sopra i Character, le Choice nella fascia inferiore, un Command binario fra
Object e il comportamento a diverse dimensioni del viewport.

Il prototipo usa la Scene del porto, che riunisce Raffaele, Object, argano,
dialogo e Scene Passage. Il riconoscimento di un Passage deriva dalla
composizione della Scene, dal cursore a freccia e dal Noun nel Command Preview;
Tab aggiunge la rivelazione temporanea, ma non esiste un contorno permanente.

Una Choice presenta al massimo sei alternative eleggibili, selezionabili anche
con i tasti da 1 a 6; superare il limite è un Authoring Diagnostic. Una Line
ancorata a un Character resta nella zona sicura sopra il HUD, va a capo entro la
larghezza massima del tema e si sposta solo quanto serve a rimanere leggibile.

La Logical Resolution viene scalata uniformemente nel viewport con eventuale
letterboxing. Il HUD conserva sempre disposizione e proporzioni; il prototipo
verifica la leggibilità alla dimensione desktop minima della Support Baseline.
Il primo prototipo usa un HUD Theme originale ma provvisorio; la direzione
artistica definitiva viene prodotta dopo la validazione del layout.

Capri 1535 aggiunge una taverna collegata al porto come deviazione facoltativa,
utile per dialoghi e interazioni ma non necessaria all'enigma principale. Il
nuovo master panoramico approvato sostituisce il precedente belvedere: la Scene
e i suoi termini di Game Project prendono il nome Monte Solaro, conservando la
funzione narrativa del precedente `lookout`. La scalinata sinistra comunica il
Scene Passage di ritorno.

I master ricevuti appartengono rispettivamente ad `art/scenes/tavern/` e
`art/scenes/monte-solaro/`. I Game Definition e le copie elaborate caricate a
runtime appartengono esclusivamente alle corrispondenti directory sotto `src/`.

La mappa di Capri 1535 segue collegamenti bidirezionali leggibili:
`alley ↔ townSquare ↔ harbour ↔ grotto ↔ monteSolaro`, con la deviazione
facoltativa `harbour ↔ tavern`. Monte Solaro torna alla grotta tramite la
scalinata sinistra e non salta direttamente al porto. Nel porto il grande arco
continua a condurre alla piazza e una porta immediatamente alla sua sinistra
diventa l'ingresso della taverna; nella taverna, il portone centrale torna al
porto e la porta sinistra è un Noun chiuso ma esaminabile.

La taverna contiene un Oste con un breve dialogo italiano opzionale e Noun
ambientali, ma non introduce Object o passaggi necessari all'enigma principale.
I Scene Passage mostrano destinazioni esplicite quando note, come «Verso la
piazza» e «Scalinata per Monte Solaro», e nomi fisici come «Portone» finché la
destinazione non è nota.

Ogni Scene Passage dichiara una Passage Direction fra left, right, up, down ed
enter, che il HUD Theme rende con un cursore originale. Le Noun Label possono
avere varianti condizionali dichiarative e richiedono sempre un fallback; è il
Game Project a rappresentare la conoscenza tramite Game Variable, senza
inferenze dell'Engine. I percorsi principali di Capri usano da subito nomi di
destinazione espliciti.

La migrazione incrementa il Project Version di Capri 1535; i Save Snapshot
precedenti restano visibili ma incompatibili. I master 1586×992 restano intatti.
Ogni copia runtime usa un ritaglio 16:9 scelto per la singola Scene e viene poi
ridotta a 426×240 senza deformazioni, proteggendo Passage e informazioni
essenziali dalla fascia coperta dal HUD.

Options contiene anche una schermata Help. Capri mostra una sola volta brevi
suggerimenti per click sinistro, click destro, Tab e scorrimento dell'Inventory.
La memoria dei suggerimenti già mostrati è una Player Preference e non entra
nel Game State o nei Save Snapshot.
