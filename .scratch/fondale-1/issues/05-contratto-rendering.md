# Definire il contratto di rendering e dello spazio di scena

Type: grilling
Status: resolved
Blocked by: 01, 02, 03

## Question

Quali primitive visive appartengono a Fondale, come sono definiti coordinate,
risoluzione logica, scaling, livelli, profondità, occlusione e camera, e dove
finisce il contratto pubblico rispetto a PixiJS? La decisione deve coprire lo
stile classico a bassa risoluzione senza impedire a giochi diversi di usare
asset e dimensioni differenti.

## Answer

Fondale espone un contratto visivo dichiarativo nello spazio della `Scene` e
concentra tutto il comportamento grafico dietro un modulo renderer interno.
PixiJS, il display tree, le texture, i filtri e le coordinate di schermo non
attraversano la seam pubblica; il renderer riceve definizioni validate,
snapshot committed ed effetti del runtime e non modifica il `Game State`.

### Quadro e coordinate

- Ogni `Game Project` sceglie una sola `Logical Resolution`, espressa come
  larghezza e altezza e condivisa da tutte le sue `Scene`. `426×240` resta una
  scelta di Capri 1535, non un valore di Fondale.
- Ogni `Scene` coincide con l'intero quadro visibile. Fondale 1.0 non espone
  camera, panning o zoom e non rappresenta una `Scene` più grande del quadro;
  una località più estesa si compone con più `Scene`.
- `Scene Space` usa pixel logici, con origine `(0, 0)` in alto a sinistra,
  asse `x` verso destra e asse `y` verso il basso. Queste coordinate non
  dipendono da CSS, dimensione del target o densità fisica dello schermo.
- Ogni `Scene` ha un `Background` stabile che copre esattamente la
  `Logical Resolution`. Una dimensione diversa è un errore di authoring o di
  caricamento: Fondale non ritaglia, stira o ricampiona implicitamente il
  fondale per farlo coincidere.

`startGame` adatta uniformemente il quadro al contenitore `target`, lo centra e
usa letterbox senza crop né deformazioni. Il progetto sceglie un profilo:

- `pixel` usa nearest-neighbour, arrotonda soltanto le posizioni disegnate e
  preferisce il massimo fattore intero che entra nel target;
- `smooth` usa filtraggio lineare e il massimo fattore uniforme, anche
  frazionario;
- quando il target è più piccolo della `Logical Resolution`, anche `pixel`
  riduce l'intero quadro con nearest-neighbour come comportamento di sicurezza.

Il colore del letterbox è una `Game Setting`, nero per default; immagini, DOM e
CSS del letterbox non fanno parte dell'interface. Posizioni e movimento nel
core conservano la loro precisione: l'arrotondamento del profilo `pixel` è
soltanto una scelta di resa.

### Primitive e composizione

Le primitive del mondo sono `Background`, `Scenery`, `Character` e `Object`.
Un `Hotspot`, una regione percorribile o altra geometria di authoring non è una
primitiva visiva, anche se gli strumenti diagnostici possono mostrarla.

La composizione ha tre piani concettuali:

1. il `Background`, sempre dietro;
2. il mondo, nel quale `Scenery`, `Character` e gli `Object` presenti nella
   `Scene` partecipano all'ordinamento in profondità;
3. l'overlay posseduto dal motore, che presenta cursore, dialoghi, HUD e
   diagnostica davanti al mondo.

`Character` e `Object` sono collocati tramite un `Ground Point`; la loro
immagine si estende rispetto a un `Visual Anchor`, predefinito al centro del
bordo inferiore e coerente fra tutti i frame di un'animazione. Una `Scenery`
dichiara invece la propria `Baseline`. Il valore verticale del `Ground Point`
o della `Baseline` determina l'ordine nel piano del mondo. A pari profondità
l'ordine è deterministico ma non ha significato autoriale; non esistono
`zIndex`, layer o offset manuali pubblici.

Una `Scenery` può ottenere il proprio aspetto da un asset autonomo oppure da
una regione poligonale ritagliata dal `Background`. Entrambe le forme usano la
stessa `Baseline`: la regione limita quali pixel vengono ridisegnati, ma non
decide da sola quando un elemento passa davanti o dietro.

Ogni `Scene` può dichiarare una `Perspective Scale` opzionale come fermate
`{ y, scale }` interpolate linearmente; in assenza della curva la scala è `1`.
Il motore la applica automaticamente a `Character` e `Object` in base al loro
`Ground Point`. La `Scenery`, collocata direttamente nella composizione, è
dimensionata dall'autore.

### Aspetti, animazioni e renderer

`Scenery`, `Character` e `Object` possono avere aspetti dichiarati statici o
animati. Il `Game State` conserva soltanto la scelta semantica rilevante, per
esempio `door-open`, mai un oggetto grafico o il numero del frame. Il
`Background` della `Scene` resta stabile; cambiamenti locali sono aspetti della
`Scenery` o presenza e aspetto delle entità.

Le animazioni ambientali e cicliche sono resa transiente: avanzano nel
renderer, non entrano nel salvataggio e non possono produrre conseguenze di
gioco. Un'animazione che una sequenza deve attendere è invece una
`Game Activity` governata dal clock logico; il renderer deriva il frame dal
progresso dell'attività. Le operazioni che selezionano presenza e aspetto
saranno definite da [Definire interazioni, condizioni ed
effetti](07-interazioni-condizioni-effetti.md), mentre formati, frame e
validazione dei file spettano a [Definire il contratto di asset e
audio](11-asset-e-audio.md).

Fondale 1.0 richiede WebGL. L'assenza della capacità fa fallire
comprensibilmente `startGame`; Canvas 2D e WebGPU non sono renderer garantiti.
Se il contesto WebGL viene perso durante una sessione, il browser adapter
sospende input e avanzamento logico, tenta il ripristino e ridisegna l'ultimo
snapshot committed senza recuperare il tempo trascorso. Se il ripristino non è
possibile, la `Game Session` entra in `failed` con diagnostica contestuale.

L'interface pubblica non offre callback di rendering, nodi generici, shader,
filtri, blend mode o trasformazioni PixiJS. Nuovi effetti riutilizzabili
diventano capacità nominate e controllate del motore, non escape hatch verso
l'implementazione del renderer.
