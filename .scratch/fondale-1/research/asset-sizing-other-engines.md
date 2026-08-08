# Dimensionamento degli asset 2D negli altri motori

## Domanda

Come distinguono Godot, Unity, Phaser e Ren'Py fra dimensione del progetto,
dimensione dei file grafici e dimensione dello schermo, e quale modello conviene
adottare in Fondale 1.0 per Background, Appearance e HUD?

## Risposta in breve

I quattro motori offrono gradi di libertà diversi, ma la ricetta ricorrente per
un gioco 2D a quadro fisso è questa:

1. si sceglie una **dimensione di riferimento del progetto**;
2. sfondo, personaggi, oggetti e interfaccia vengono composti usando le
   coordinate di quel quadro;
3. il quadro completo viene adattato uniformemente alla finestra fisica,
   conservando le proporzioni;
4. per la pixel art si preferiscono nearest-neighbour e fattori interi, con
   bande vuote quando il formato dello schermo non coincide.

La dimensione dello schermo non stabilisce quindi la dimensione dei PNG. Un
monitor più grande non richiede altri file: rende più grande l'intera
composizione. Serve invece produrre asset più grandi quando l'Author sceglie una
dimensione di riferimento più grande per **quel progetto**.

## Tre grandezze da non confondere

| Grandezza | Che cosa decide | Esempio |
| --- | --- | --- |
| Dimensione del PNG | Quanti pixel contiene una singola immagine e quanto spazio occupa nativamente nel quadro | un Character di `48×96`, un'icona di `32×32` |
| Risoluzione logica del progetto | La tela e il sistema di coordinate in cui l'intero gioco viene composto | `426×240` |
| Risoluzione fisica | Lo spazio finale disponibile nella finestra o nello schermo | `1920×1080` |

Con un progetto `426×240` mostrato a fattore `4`, un'icona `32×32` occupa
`128×128` pixel dello schermo. Il PNG resta `32×32` e tutte le coordinate del
gioco restano quelle del quadro `426×240`.

## Godot

Godot chiama la dimensione iniziale **base size** o **design size**: è l'area
usata nell'editor, non un comando per cambiare la risoluzione del monitor. Con
lo stretch mode `viewport`, il motore disegna prima il gioco alla base size e
poi scala il viewport verso lo schermo. L'opzione `keep` conserva le proporzioni
e aggiunge letterbox o pillarbox. Per la pixel art la documentazione consiglia
una base viewport fra `256×224` e `640×480`, `viewport`, aspect `keep` e scala
intera. Una scala intera evita che un pixel del gioco finisca su un numero
frazionario di pixel fisici. [Godot: Multiple resolutions](https://docs.godotengine.org/en/stable/tutorials/rendering/multiple_resolutions.html)

Godot non prescrive una dimensione universale per Background o Sprite: una
texture conserva una propria dimensione in pixel ed è il progetto a decidere
come usarla. Per la UI offre `Control`, anchor e container che possono reagire
al ridimensionamento del parent o del viewport; questa flessibilità serve anche
a giochi che espandono l'area visibile anziché usare bande. [Godot: Texture2D](https://docs.godotengine.org/en/stable/classes/class_texture2d.html),
[Godot: Control](https://docs.godotengine.org/en/stable/classes/class_control.html)

**Lettura utile per Fondale:** la ricetta pixel-art di Godot coincide quasi
esattamente con il contratto già scelto da Fondale: quadro base, composizione a
bassa risoluzione, scala uniforme intera e bande. Anchor e layout responsivi
sono possibilità generali di Godot, non una necessità per un motore 1.0 a
quadro fisso.

## Unity

Unity separa più nettamente mondo e interfaccia. Nel mondo 2D, `Pixels Per Unit`
stabilisce quanti pixel dello Sprite corrispondono a una unità del mondo. La
Pixel Perfect Camera ha una **Reference Resolution**, cioè la risoluzione
originale per cui gli asset sono stati disegnati, e può ingrandire scena e
asset conservando netta la pixel art; offre anche pixel snapping, crop e bande.
[Unity: preparare gli Sprite per la Pixel Perfect Camera](https://docs.unity3d.com/Manual/urp/2d-pixelperfect-prep-sprites.html),
[Unity: Pixel Perfect Camera](https://docs.unity3d.com/Manual/urp/2d-pixelperfect-ref.html)

Per HUD e menu, `Canvas Scaler` offre scelte distinte. `Constant Pixel Size`
mantiene la UI della stessa grandezza in pixel fisici; `Scale With Screen Size`
usa invece una **Reference Resolution** della UI e ingrandisce o riduce insieme
tutti gli elementi. La guida multi-risoluzione mostra esplicitamente che con
quest'ultima scelta scalano pulsanti, distanze dai bordi, immagini e testo.
[Unity: Canvas Scaler](https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/script-CanvasScaler.html),
[Unity: Designing UI for Multiple Resolutions](https://docs.unity3d.com/2018.3/Documentation/Manual/HOWTO-UIMultiResolution.html)

**Lettura utile per Fondale:** il comportamento visto nel prototipo, con icone
che sembrano restare uguali mentre il quadro cambia, somiglia alla modalità
Unity `Constant Pixel Size`. Non è l'unica soluzione e non è quella più coerente
con il desiderio di far crescere insieme mondo e Inventory. La modalità Unity
equivalente a quel desiderio è `Scale With Screen Size`.

## Phaser

Phaser è il confronto più vicino perché è web-native. Il suo Scale Manager
distingue:

- `gameSize`: la dimensione del gioco dichiarata nella configurazione e usata
  da mondo e camere;
- `baseSize`: la dimensione interna del canvas;
- `displaySize`: la dimensione CSS con cui quel canvas viene mostrato.

In modalità `FIT`, Phaser mantiene fisso il canvas interno e ne adatta larghezza
e altezza CSS allo spazio disponibile, conservando le proporzioni. La
documentazione indica `FIT` come la scelta probabile per la grande maggioranza
dei giochi. [Phaser: ScaleManager](https://docs.phaser.io/api-documentation/3.90.0/class/scale-scalemanager)

Uno Sprite assume nativamente la dimensione del frame della sua texture; scale
`1` significa stessa dimensione, mentre un ridimensionamento esplicito modifica
la dimensione mostrata. Phaser avverte che ingrandire o ridurre una texture
obbliga il renderer a ricostruire o scartare pixel e suggerisce un asset già
dimensionato correttamente quando la qualità non è sufficiente.
[Phaser: Game Object Components](https://docs.phaser.io/phaser/concepts/gameobjects/components)

Per la pixel art, `pixelArt: true` disattiva l'antialiasing e abilita
`roundPixels`; il filtraggio nearest-neighbour mantiene i bordi netti. Gli
elementi UI possono essere bloccati rispetto alla camera con scroll factor
zero, ma restano dentro lo stesso canvas che `FIT` scala nel suo complesso.
[Phaser: Core Configuration](https://docs.phaser.io/api-documentation/typedef/types-core),
[Phaser: Scroll Factor](https://docs.phaser.io/phaser/concepts/gameobjects/components)

**Lettura utile per Fondale:** fissare un canvas logico e adattare con CSS la
composizione completa è una soluzione web normale. “UI ferma rispetto alla
camera” significa ferma nel quadro logico, non necessariamente della stessa
misura fisica su ogni monitor.

## Ren'Py

Ren'Py espone `config.screen_width` e `config.screen_height` come dimensione
**virtuale** del gioco e distingue `config.physical_width` e
`config.physical_height`, che riguardano la finestra. Può forzare anche soli
fattori interi della dimensione originale. Le bande usate quando il rapporto
della finestra non coincide sono un comportamento documentato.
[Ren'Py: Configuration Variables](https://www.renpy.org/doc/html/config.html)

La dimensione in pixel di un'immagine determina per default quanto spazio essa
occupa. Un'immagine `1920×1080` riempie quindi un gioco virtuale `1920×1080`.
Ren'Py supporta opzionalmente varianti sovracampionate `@2`, `@3` e così via,
che contengono più dettaglio ma mantengono la stessa dimensione virtuale.
[Ren'Py: Displaying Images](https://www.renpy.org/doc/html/displaying_images.html)

Ren'Py separa semanticamente immagini narrative e UI: Background e Character
stanno normalmente sul layer `master`, mentre l'interfaccia usa il sistema
`screens`. Posizioni e misure della UI possono essere espresse in pixel della
tela virtuale o come frazioni dell'area che le contiene. Quando si crea un
progetto, il launcher chiede una risoluzione di progetto e genera la GUI per
quella scelta. [Ren'Py: Screens](https://www.renpy.org/doc/html/screens.html),
[Ren'Py: Style Properties](https://www.renpy.org/doc/html/style_properties.html),
[Ren'Py: GUI Customization Guide](https://www.renpy.org/doc/html/gui.html)

**Lettura utile per Fondale:** Ren'Py è un precedente forte per chiedere
all'Author una sola dimensione di progetto, creare sfondi che la riempiano e
dimensionare anche la UI in relazione a quella tela, lasciando poi al motore
l'adattamento alla finestra.

## Sintesi comparativa

| Motore | Riferimento del progetto | Adattamento allo schermo | Dimensione nativa degli asset | UI/HUD |
| --- | --- | --- | --- | --- |
| Godot | base/design size | viewport o canvas stretch; keep e integer per pixel art | libera, scelta dall'Author nel sistema del progetto | Control nello stesso viewport, con anchor/layout opzionali |
| Unity | camera/reference resolution e unità di mondo | Pixel Perfect Camera o camera configurabile | libera; `Pixels Per Unit` collega pixel e mondo | canvas separato: può restare in pixel fisici oppure scalare da una reference resolution |
| Phaser | `gameSize`/canvas interno | `FIT` scala il canvas completo via CSS | il frame della texture è la size nativa; scala esplicita opzionale | oggetti fissati alla camera ma sempre nel canvas scalato |
| Ren'Py | virtual screen size | virtual screen adattato alla finestra | size del file = size virtuale per default; varianti `@2` opzionali | screen separati semanticamente, dimensionati nella tela virtuale |

Nessuno dei motori impone “tutti i personaggi devono essere `48×96`” o “tutti
gli oggetti devono essere `32×32`”. Queste misure dipendono dalla direzione
artistica e dalla scala relativa allo sfondo. I motori stabiliscono o espongono
il sistema che rende coerenti le misure, non una taglia universale per ogni
categoria di immagine.

## Raccomandazione per Fondale 1.0

### Modello

Conservare il modello già deciso, chiarendolo con termini meno ambigui nella
documentazione per Author:

- **dimensione base del gioco** come spiegazione accessibile di `Logical
  Resolution`;
- un solo quadro logico per tutto il Game Project;
- Background esattamente grande quanto il quadro;
- un pixel di ogni PNG uguale a un pixel logico prima di `Perspective Scale`;
- Background, mondo e HUD composti nello stesso quadro e adattati **insieme**
  alla finestra con scala uniforme;
- profilo pixel con nearest-neighbour, fattore intero quando entra, bande senza
  crop o deformazione.

L'HUD può restare semanticamente fuori da `Scene Space`: ciò significa che non
cammina nel mondo e non partecipa a profondità o interazioni della Scene. Non
significa che usi pixel fisici separati. Deve essere disegnato sopra il mondo
nello stesso quadro logico e partecipare alla stessa scala finale.

### Dimensioni dei PNG

- **Background:** esattamente la dimensione base. In un progetto `426×240`,
  ogni Background è `426×240`.
- **Character, Object e Scenery:** nessuna taglia universale. Il file va
  disegnato alla grandezza con cui deve apparire sul Background a scala `1`.
  Se una porta disegnata nello sfondo è alta 90 pixel logici, un Character alto
  70–80 pixel è una scelta artistica leggibile; Fondale non deve inventarne il
  rapporto. Frame e Appearance alternativi devono condividere una baseline e
  un ingombro coerente, anche se la larghezza può cambiare.
- **Inventory Appearance:** dimensione uniforme e quadrata all'interno di un
  progetto, perché l'Inventory posseduto dal motore deve poter comporre slot
  prevedibili e navigabili da tastiera. La dimensione va però rapportata alla
  dimensione base del progetto, non al monitor.

Per non introdurre ridimensionamento automatico dei singoli PNG e, allo stesso
tempo, evitare che `32×32` diventi relativamente piccolo nei progetti a
risoluzione logica più alta, la regola più semplice e generale è:

> Il Game Project dichiara una sola `Inventory Appearance Size`, quadrata e
> valida per tutti i suoi Object; ogni PNG deve avere esattamente quella
> dimensione.

Per il progetto `426×240`, la scelta raccomandata è `32×32`. Se un altro
progetto viene realmente disegnato a `640×360` e vuole conservare la stessa
proporzione visiva, può dichiarare `48×48`. Fondale non scala il singolo PNG:
valida semplicemente che il file abbia la misura scelta. Questo unico Game
Setting è un vincolo degli asset, non una configurazione pubblica del layout o
dello stile. È anche più chiaro di una formula nascosta legata all'altezza del
quadro e non impone rapporti artificiali alle Logical Resolution ammesse.

### Correzione necessaria al prototipo

Il controllo “cambia risoluzione” deve distinguere due prove diverse:

1. **stesso progetto, finestra diversa:** il Background, il mondo e
   l'Inventory devono crescere o ridursi tutti insieme;
2. **progetto diverso, dimensione base diversa:** l'Author deve fornire tutti
   gli asset alla nuova scala artistica, compresa un'Inventory Appearance
   proporzionalmente più grande.

Mostrare `32×32` sia su `426×240` sia su `640×360` non simula un monitor più
grande: confronta due progetti diversi che hanno deciso di usare la stessa
icona nativa. È precisamente il motivo per cui l'Inventory appare
relativamente più piccolo nella seconda vista.
