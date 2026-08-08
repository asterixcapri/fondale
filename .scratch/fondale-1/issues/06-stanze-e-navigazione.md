# Definire Scene, navigazione e attraversamento

Type: prototype
Status: resolved
Blocked by: 04, 05

## Question

Quale modello di Scena rappresenta sfondo, regioni percorribili, ostacoli,
occlusioni, punti d'approccio, entrate e uscite; e quale comportamento osserva
il giocatore quando chiede a un Personaggio di raggiungere un bersaglio? Un prototipo
deve dimostrare casi limite di pathfinding e transizione usando almeno due
Scene e senza dipendere da dati specifici di Capri.

## Answer

Una `Scene` definisce il proprio spazio esplorabile attraverso geometria
dichiarativa nello `Scene Space`; un modulo di navigazione interno trasforma
gli intenti in percorsi senza esporre all'autore navmesh, griglie, A* o dettagli
del renderer. Il comportamento è stato validato nel
[prototipo di Scene e navigazione](../prototypes/scene-navigation-prototype.html),
che resta un artefatto usa-e-getta e non prescrive l'algoritmo produttivo.

### Geometria della Scene

- Il `Background` e la `Logical Resolution` restano quelli del contratto di
  rendering. Una `Scene` aggiunge una o più `Walkable Region`: poligoni nello
  `Scene Space` la cui unione stabilisce dove può trovarsi il `Ground Point` di
  un `Character`.
- Un `Navigation Obstacle` è un poligono nominato sottratto alle regioni
  percorribili mentre è attivo nel `Game State`. La forma stessa delle
  `Walkable Region` descrive muri e limiti permanenti; gli ostacoli servono per
  impedimenti locali che possono cambiare, come un cancello. Il modo in cui
  condizioni ed effetti li attivano appartiene a
  [Definire interazioni, condizioni ed effetti](07-interazioni-condizioni-effetti.md).
- Geometria di navigazione e composizione visiva sono indipendenti. Una
  `Scenery` può corrispondere visivamente a un ostacolo, ma non lo diventa
  implicitamente; analogamente, una regione di occlusione e la sua `Baseline`
  decidono la resa davanti o dietro un elemento, non dove si può camminare.
  Questa separazione permette anche ostacoli invisibili e Scenery attraversabile
  senza duplicare semantica fra renderer e navigazione.
- Poligoni degeneri, auto-intersecanti o fuori dallo `Scene Space`, entrate e
  approcci non percorribili e riferimenti mancanti sono errori di authoring.
  L'attivazione di un ostacolo che conterrebbe il `Ground Point` corrente è una
  `Game Operation` invalida e non produce uno stato parzialmente corretto.

### Destinazioni e punti d'approccio

Un click intenzionale sul suolo produce una destinazione nello `Scene Space`.
Se il punto richiesto non è percorribile o appartiene a una porzione disconnessa,
Fondale sceglie il punto **raggiungibile** geometricamente più vicino; a parità
usa un ordine deterministico. Il `Character` non attraversa mai un bordo o un
ostacolo e non viene teletrasportato per soddisfare il click.

Un bersaglio che richiede presenza fisica dichiara almeno un `Approach Point`,
composto da `Ground Point` e orientamento finale. L'autore esprime così dove
l'interazione ha senso, senza affidarsi alla forma dello sprite o al punto
preciso cliccato. Il modulo di navigazione valuta gli approcci nello snapshot
committed corrente e sceglie quello raggiungibile con il percorso più corto;
l'ordine dichiarato risolve i pareggi. Se nessuno è raggiungibile, il
`Character` resta fermo, il `Player Intent` termina con un esito normale e
l'interazione non parte.

Il percorso concreto è un risultato derivato e interno. Il `Game State`
conserva il progresso deterministico della `Game Activity` — intento,
destinazione, posa corrente e quanto serve a riprenderla — senza trasformare la
struttura del pathfinder in formato pubblico. Ogni passo parte dall'ultimo
snapshot committed. Se un ostacolo cambia, Fondale ricalcola dalla posa
corrente; se la destinazione non è più raggiungibile, annulla il movimento
senza percorso parziale o teletrasporto.

Resta valida la semantica già scelta per il `Player Intent`: un nuovo intento
sostituisce immediatamente il movimento in corso, non viene accodato. Arrivato
all'approccio, il motore applica l'orientamento dichiarato e soltanto allora può
iniziare l'interazione. Il significato e il feedback percepibile degli esiti
spettano al contratto delle interazioni, non al pathfinder.

### Attraversamento fra Scene

Un `Scene Passage` è un bersaglio navigabile che dichiara uno o più approcci e
nomina `Scene` di destinazione e relativa `Scene Entrance`. Una
`Scene Entrance` è una posa di arrivo nominata, composta da `Ground Point` e
orientamento. I collegamenti non sono implicitamente bidirezionali: un ritorno
è un altro `Scene Passage`, e più passaggi possono condividere la stessa
entrata quando il progetto lo desidera.

Raggiungere l'approccio di un passaggio avvia la transizione già definita dal
lifecycle della `Game Session`. Durante la preparazione la vecchia `Scene`
resta canonica, il `Character` resta alla posa d'approccio e l'input è sospeso.
Un singolo commit cambia `Scene`, colloca il `Character` nella `Scene Entrance`
e applica il suo orientamento; il vecchio intento termina e non trasporta un
percorso nella nuova `Scene`. Un errore di preparazione non produce il commit.

### Seam del modulo

L'interface pubblica dell'autore si ferma alle definizioni validate di regioni,
ostacoli, approcci, passaggi ed entrate. Dietro quella seam, un modulo profondo
di navigazione riceve definizione della `Scene`, snapshot committed, posa e
destinazione e restituisce un piano raggiungibile oppure un esito esplicito di
irraggiungibilità. Scelta e rappresentazione dell'algoritmo restano interne e
possono cambiare senza migrare i progetti di gioco.

Il contratto verificabile richiede che, a parità di definizione, stato e
intento, destinazione ed evoluzione siano deterministiche; che ogni posa
committed sia percorribile; che nessun segmento tagli bordi od ostacoli; che un
nuovo intento sostituisca il precedente; e che una transizione aggiorni
`Scene`, entrata e orientamento atomicamente.

## Scope amendment for Fondale 1.0

La Versione 1 esercita una sola `Walkable Region` per `Scene`, un solo
`Approach Point` per bersaglio e geometria statica. Regioni multiple,
`Navigation Obstacle`, approcci multipli e tracking di bersagli mobili restano
candidati della Versione 2 secondo [Definire lo scenario di accettazione di
Fondale 1.0](15-scenario-accettazione.md).
