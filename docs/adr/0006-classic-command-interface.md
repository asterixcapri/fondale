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

I nove Verb visibili sono Give, Talk To, Pick Up, Look At, Open, Close, Push,
Pull e Use; Walk To resta implicito per terreno e Scene Passage. Il passaggio
del puntatore presenta il Noun e il Verb preferito, il click sinistro costruisce
il Command o cammina sul terreno e il click destro esegue il Verb preferito.
Il HUD occupa una regione permanente della Logical Resolution 426×240 invece di
sovrapporsi alla Scene; la proporzione esatta viene validata con un prototipo.

Il modello contestuale non rimane come Game Setting alternativo: la modifica è
incompatibile, introduce Fondale 2.0 e richiede la migrazione dei Game Project.
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

La Support Baseline 2.0 include mouse, esecuzione rapida con click destro,
rotellina per l'Inventory, F5 per i salvataggi e scorciatoie posizionali
QWE/ASD/ZXC per i nove Verb. Touch, gamepad e navigazione completa del mondo da
tastiera restano esclusi da questa modifica.

Dopo ogni Command risolto, riuscito o fallito, il Command State torna a Walk
To; Escape annulla una costruzione incompleta e il click destro non sostituisce
quella corrente. Un Command rivolto alla Scene raggiunge l'Approach Point e
viene rivalutato sul Game State più recente, mentre i Command fra soli Object
nell'Inventory si risolvono immediatamente.

L'Inventory presenta sempre otto caselle in una griglia 4×2, scorre con frecce
e rotellina e porta in vista ogni Object appena acquisito. Raccolta, rimozione e
ricollocazione ricevono feedback standard brevi rispettivamente nell'Inventory
e sul bersaglio, senza animazioni personalizzabili fra HUD e Scene.

Una Command Response può essere pronunciata da un Character, usando il Player
Character come speaker predefinito, oppure presentata come narrazione. Ogni
Scene Passage mostra il proprio Noun, preferisce Walk To e usa un cursore a
freccia; Tab rivela temporaneamente Noun e Passage, mentre il controllo
diagnostico permanente viene rimosso dal normale HUD.

F5 apre una schermata Engine-owned di Save Slot nominati, identificati per Game
Project e versione, senza miniature. Le Line pronunciate sono ancorate sopra il
Character che parla e la narrazione è centrata nella Scene. Le Choice
sostituiscono temporaneamente Verb e Inventory con l'elenco delle frasi nel HUD;
la frase selezionata viene pronunciata dal Player Character nella Scene prima
di proseguire, poi il Command State sospeso viene ripristinato.
