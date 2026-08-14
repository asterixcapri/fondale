# Formati degli sprite sheet 2D e interoperabilità con Fondale

Data della ricerca: 14 agosto 2026  
Domanda: esiste un formato standard per gli sprite sheet e quale formato conviene
usare per importare in Fondale il `walking/right` di Michele generato da
AutoSprite?

## Risultato in breve

Non emerge uno **standard formale unico** per uno sprite sheet 2D. PNG e JSON
hanno standard propri
([PNG, W3C Recommendation](https://www.w3.org/TR/png-3/),
[JSON, RFC 8259 / STD 90](https://www.rfc-editor.org/rfc/rfc8259)), ma non
esiste un vocabolario universale che stabilisca
come un'immagine debba esprimere ordine dei frame, animazioni, tempo, trimming,
rotazione o pivot. Questa è una conclusione comparativa: Aseprite esporta cinque
layout e due forme JSON; Phaser distingue fra griglia uniforme e atlas; PixiJS,
Tiled e TexturePacker documentano schemi di metadati differenti
([Aseprite CLI](https://github.com/aseprite/docs/blob/main/cli.md),
[Phaser Textures](https://docs.phaser.io/phaser/concepts/textures),
[PixiJS `SpritesheetData`](https://pixijs.download/release/docs/assets.SpritesheetData.html),
[Tiled JSON](https://doc.mapeditor.org/en/stable/reference/json-map-format/),
[TexturePacker](https://www.codeandweb.com/texturepacker/documentation)).
JSON standardizza soltanto la sintassi del formato di scambio, non i nomi o la
semantica dei campi di un atlas
([RFC 8259 / STD 90](https://www.rfc-editor.org/rfc/rfc8259)).

Nella pratica ricorrono tre famiglie interoperabili per convenzione:

1. una sequenza di file, uno per frame;
2. una griglia uniforme, di cui la strip orizzontale è il caso `N × 1`;
3. un texture atlas, in cui rettangoli anche irregolari o ruotati richiedono
   metadati associati.

Per la prova di Michele non serve eliminare frame e non conviene cambiare ora il
runtime. La soluzione più piccola è convertire senza perdita la griglia
AutoSprite `5 × 5` in una strip `25 × 1`, mantenendo l'ordine per righe e tutti i
25 frame. La scelta del frame rate va fatta esplicitamente: `10 FPS` produrrebbe
un ciclo da `2,5 s`; preservare i `2,042 s` dichiarati dall'export AutoSprite
richiederebbe circa `12,24 FPS` (`25 / 2,042`).

## Vocabolario pratico

| Famiglia | Come individua un frame | Punti di forza | Informazione esterna necessaria |
|---|---|---|---|
| Sequenza di immagini | file e ordine della lista | semplice, frame di dimensioni diverse | ordine, tempo, gruppi, loop, pivot |
| Strip o griglia uniforme | dimensione cella, righe/colonne e indice | import semplice, nessun atlas obbligatorio | ordine, numero di frame validi, tempo, loop, pivot |
| Atlas packed | rettangolo nominato nel file metadata | riduce spazio vuoto e cambi di texture | schema esatto, trim, rotazione e ricostruzione della sorgente |

Phaser usa esattamente questa distinzione operativa: uno `spritesheet` contiene
celle uniformi in righe o colonne e viene caricato con `frameWidth`,
`frameHeight`, margine e spaziatura; un `atlas` può collocare frame di qualunque
dimensione e posizione e usa dati associati
([loader](https://docs.phaser.io/phaser/concepts/loader#sprite-sheet),
[textures](https://docs.phaser.io/phaser/concepts/textures#loading-images-for-textures)).
Aseprite conferma che non c'è un solo layout canonico: il suo exporter offre
`horizontal`, `vertical`, `rows`, `columns` e `packed`, più metadata
`json-hash` o `json-array`; può inoltre applicare padding, trimming ed extrusion
([CLI ufficiale](https://github.com/aseprite/docs/blob/main/cli.md#options)).

Una strip non è quindi più “standard” di una griglia: è una griglia con una sola
riga, particolarmente facile da interpretare senza metadata. Un atlas packed è
più efficiente nello spazio ma non è autosufficiente: senza lo schema che
descrive i rettangoli, l'immagine non permette di ricostruire i frame.

## Cosa deve dichiarare un formato completo

### Geometria e ordine

Per una griglia servono almeno immagine, larghezza e altezza della cella, numero
di colonne e numero di frame validi. Il numero di frame è indipendente dalla
capienza della griglia: l'ultima riga può essere parziale. L'ordine deve essere
esplicito, tipicamente da sinistra a destra e poi dall'alto in basso; il solo PNG
non codifica tale semantica.

Per un atlas servono almeno un identificatore e il rettangolo `{x, y, w, h}` di
ogni frame. PixiJS usa un dizionario `frames`, può raggruppare nomi in
`animations`, e conserva in `meta` immagine, scala e dimensioni dell'atlas
([esempio e API PixiJS](https://pixijs.download/release/docs/assets.Spritesheet.html),
[`SpritesheetData`](https://pixijs.download/release/docs/assets.SpritesheetData.html)).
Phaser accetta a sua volta frame nominati con un rettangolo e distingue quegli
atlas dalle proprie celle indicizzate da zero
([Phaser Textures](https://docs.phaser.io/phaser/concepts/textures#loading-images-for-textures)).

### Tempo e playback

Il tempo non appartiene necessariamente al PNG o all'atlas. Sono comuni almeno
due modelli:

- frame rate uniforme e durata relativa per eventuali eccezioni;
- durata assoluta per ogni frame.

Godot `SpriteFrames` combina FPS, modalità di loop e durata relativa del
singolo frame; la durata assoluta è
`relative_duration / (animation_fps * abs(playing_speed))`
([API ufficiale](https://docs.godotengine.org/en/stable/classes/class_spriteframes.html)).
PixiJS può invece ricevere frame con `time` individuale in millisecondi, oltre a
velocità e loop del player
([`AnimatedSprite`](https://pixijs.download/release/docs/scene.AnimatedSprite.html)).
Tiled usa ancora un altro schema: ogni elemento di `animation` contiene
`tileid` e `duration` in millisecondi
([Tiled JSON](https://doc.mapeditor.org/en/stable/reference/json-map-format/#frame)).
Un campo chiamato genericamente `duration` senza unità documentata non è dunque
interoperabile per nome soltanto.

### Trimming, rotazione e dimensione sorgente

Un packer può eliminare trasparenza attorno a un frame o ruotarlo di 90 gradi.
Per renderlo nella posizione originale servono almeno:

- il rettangolo nell'atlas;
- `rotated`;
- la dimensione logica non tagliata;
- il rettangolo/offset del contenuto tagliato nella dimensione logica.

PixiJS chiama questi dati `frame`, `rotated`, `sourceSize`,
`spriteSourceSize` e `trimmed`
([`SpritesheetFrameData`](https://pixijs.download/release/docs/assets.SpritesheetFrameData.html)).
TexturePacker espone gli stessi concetti ai suoi exporter come `frameRect`,
`rotated`, `untrimmedSize`, `cornerOffset` e `sourceRect`; documenta inoltre
formati generici, formati specifici per engine e perfino exporter custom
([custom exporter ufficiale](https://www.codeandweb.com/texturepacker/documentation/custom-exporter)).
La corrispondenza concettuale non rende però identici i due schemi.

### Pivot, anchor e allineamento

Il punto di appoggio deve specificare sia unità sia sistema di coordinate.
PixiJS documenta l'anchor di uno Sprite come normalizzato fra `0` e `1`, mentre
il pivot di un Container è in pixel
([PixiJS, Anchor vs Pivot](https://pixijs.com/8.x/guides/components/scene-objects#anchor-vs-pivot)).
TexturePacker distingue a sua volta `pivotPoint` e `pivotPointNorm`
([custom exporter](https://www.codeandweb.com/texturepacker/documentation/custom-exporter#sprite)).
Un semplice campo `{x, y}` non è quindi portabile finché non dichiara origine,
unità e riferimento alla dimensione trimmed o non trimmed.

## AutoSprite osservato

AutoSprite dichiara come export una coppia composta da PNG trasparente in
griglia e JSON atlas, da usare nei workflow dei diversi engine
([pagina fornita per questa ricerca](https://www.autosprite.io/sprite-sheet-generator#engine-workflows)).
La stessa documentazione precisa però che con Phaser la griglia uniforme va
caricata tramite `load.spritesheet`, mentre `load.atlas` richiede prima un
repacking in un formato compatibile con Phaser
([workflow Phaser di AutoSprite](https://www.autosprite.io/phaser-sprite-sheet-generator#actual-workflow)).
Per Godot il JSON viene presentato come guida per impostare manualmente griglia
e `SpriteFrames`, non come risorsa importata automaticamente
([workflow Godot di AutoSprite](https://www.autosprite.io/godot-sprite-sheet-generator#spriteframes-setup)).
“Game-ready” descrive quindi una buona convenzione di handoff, non uno standard
universale né la compatibilità diretta del JSON con ogni loader.

Il 14 agosto 2026 il server MCP collegato ha restituito per il
`walking/right` di Michele:

| Proprietà | Valore osservato |
|---|---:|
| Frame | 25 |
| Cella | 256 × 256 px |
| Colonne | 5 |
| Immagine | 1280 × 1280 px, quindi 5 × 5 |
| Ordine | chiavi `0`–`24`, coordinate per righe |
| Durata sorgente dichiarata | 2,042 s |

Il JSON effettivo contiene per ogni chiave soltanto `x`, `y`, `w`, `h` e
`duration: 1`; in `meta` contiene dimensione dell'atlas, dimensione della cella,
modalità di rimozione dello sfondo e `duration_s`. Non contiene unità per
`duration`, nome/gruppo dell'animazione, loop, pivot, trimming, rotazione o nome
dell'immagine. Queste osservazioni provengono da `get_spritesheet` e dal relativo
atlas del server MCP; gli URL firmati sono temporanei e non sono riportati come
fonti durevoli. L'ordine per righe è verificabile dalle coordinate: `0` è a
`(0,0)`, `4` a `(1024,0)`, `5` a `(0,256)` e `24` a `(1024,1024)`.
La griglia `5 × 5` descrive questo export, non un impegno permanente dell'API:
ogni sheet va importato leggendo le proprie specifiche e coordinate.

Il `duration: 1` non va interpretato automaticamente come un secondo. Dato che
25 secondi contraddirebbero `meta.duration_s: 2.042`, può rappresentare un peso
relativo o un placeholder, ma questa è un'inferenza: per un import ripetibile va
usato solo dopo che AutoSprite ne documenterà l'unità.

## Compatibilità con il contratto Fondale attuale

Fondale adotta deliberatamente un formato runtime più stretto:

- `AnimationStrip` è una sola strip orizzontale con `image` e `count`;
- ogni Character Animation fornisce `left`, `right`, `front` e `back` con lo
  stesso numero di frame;
- `framesPerSecond`, `loop` e cue in secondi appartengono all'Animation;
- un unico `visualAnchor` in pixel stabilizza tutte le Animations e Facing
  dell'Appearance;
- tutte le celle runtime di una Character Appearance devono avere le stesse
  dimensioni.

Questi vincoli sono definiti in
[`src/capabilities/animation/index.ts`](../../src/capabilities/animation/index.ts)
e descritti nella
[`Game Authoring Guide`](../public/game-authoring.md#four-facing-character-artwork).
Il browser divide oggi esclusivamente la larghezza dell'immagine per `count` e
crea rettangoli lungo `y = 0`; non legge righe, colonne o un JSON atlas
([`src/browser/assets.ts`](../../src/browser/assets.ts)). Non c'è invece alcun
limite a otto frame: `count` deve soltanto essere un intero positivo.

| Informazione | AutoSprite Michele | Fondale oggi | Esito diretto |
|---|---|---|---|
| Layout | griglia uniforme 5 × 5 | strip orizzontale 25 × 1 | conversione necessaria |
| Frame | 25 | qualunque `count > 0` | compatibile |
| Cella | 256 × 256 | uniforme nell'Appearance | compatibile se preservata |
| Ordine | per righe, ricavato dal JSON | sinistra → destra | compatibile dopo riordino |
| Timing | 2,042 s globali; `duration: 1` non documentato | FPS uniforme | scelta/import esplicito |
| Loop | non presente nell'atlas | booleano sull'Animation | authoring esplicito |
| Anchor | non presente | coordinate immagine in pixel | va scelto e verificato |
| Facing | solo `right` | quattro Facing sincronizzati | solo fixture/pilota |

## Raccomandazione per Fondale

### Per la prova di Michele

1. Conservare il PNG e JSON originali come **Source Asset** e registrare la
   provenienza; non usarli direttamente come Runtime Asset.
2. Ricomporre in modo lossless i 25 rettangoli del JSON, nell'ordine numerico
   `0…24`, in una strip RGBA `6400 × 256`; non scartare né duplicare frame.
3. Usare la prova solo per `right` finché le altre tre Facing non hanno 25 frame
   e le stesse dimensioni runtime.
4. Provare prima circa `12,24 FPS` per preservare la durata sorgente di
   `2,042 s`; confrontare poi intenzionalmente `10 FPS` se si preferisce un
   passo più lento. Non dedurre il valore dal `duration: 1` non documentato.
5. Misurare un `visualAnchor` stabile sui piedi e verificare loop, scorrimento
   dei piedi, bordi, identità e borsa a scala runtime.

### Per una pipeline riutilizzabile

Fondale dovrebbe mantenere la strip uniforme come formato runtime semplice per
i Character e aggiungere, se gli import diventano frequenti, un **importer di
build** che normalizzi formati sorgente diversi. Il runtime non dovrebbe
incorporare direttamente ogni dialetto JSON dei fornitori.

Il contratto intermedio dell'importer dovrebbe essere versionato e validato,
con campi espliciti per:

- file immagine e rettangoli ordinati dei frame;
- dimensione sorgente logica, offset di trim e rotazione;
- durata in millisecondi per frame oppure FPS uniforme, con unità nel nome;
- gruppi/nome Animation, loop e ordine;
- anchor/pivot con unità, origine e riferimento alla dimensione non trimmed;
- mapping semantico fra Animation e Facing;
- provenance del generatore e versione dello schema.

Un adapter AutoSprite può leggere il suo JSON minimale e produrre la strip
Fondale; adapter successivi possono leggere Aseprite/Pixi/TexturePacker senza
allargare il contratto pubblico dell'Engine. Se in futuro l'ottimizzazione di
memoria giustificherà atlas packed a runtime, va scelto e versionato uno schema
preciso — per esempio il sottoinsieme PixiJS — e vanno implementati insieme
trim, rotazione e anchor. Chiamarlo genericamente “JSON atlas” non basta a
garantire interoperabilità.

## Metodo e fonti

Sono state usate soltanto fonti primarie: standard IETF, documentazione e API
ufficiali di AutoSprite, Aseprite, Phaser, PixiJS, Godot, Tiled e TexturePacker,
oltre al codice e alla documentazione di Fondale. I dati specifici di Michele
sono uno snapshot read-only ottenuto dal server MCP AutoSprite collegato. Le
conclusioni su standardizzazione e scelta della pipeline sono inferenze
progettuali basate sul confronto degli schemi documentati.
