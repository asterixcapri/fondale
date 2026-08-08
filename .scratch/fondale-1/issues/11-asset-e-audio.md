# Definire il contratto degli asset visivi

Type: grilling
Status: resolved
Blocked by: 02, 03, 05, 15

## Question

Come dichiara, identifica, carica e valida Fondale i soli asset visivi esercitati
dall'Example: Background, aspetti statici e animazione basilare del Character?
La decisione deve coprire riferimenti, metadati minimi, caricamento asincrono
all'avvio ed errori URL, CORS o dimensione; audio, font personalizzati, pipeline
artistiche, streaming e trasformazioni runtime sono fuori dalla Versione 1.

## Answer

Fondale 1.0 accetta soltanto PNG come asset forniti dal `Game Project`. Il file
non ha identità di gioco: una definizione indica direttamente un URL risolvibile
dal browser, normalmente ottenuto importando il PNG nella build Vite oppure
fornito come URL assoluto. Fondale non introduce un registro globale, una
cartella base, manifest o alias pubblici; più definizioni possono riferire lo
stesso URL e il motore ne nasconde caricamento, riuso e rilascio.

### Background e Appearance

Un `Background` dichiara un solo PNG e deve coincidere esattamente con la
`Logical Resolution`. Un `Appearance` statico dichiara un PNG e un `Visual
Anchor` facoltativo, predefinito al centro del bordo inferiore e obbligatoriamente
interno all'immagine.

`Scenery`, `Character` e `Object` usano la stessa regola: possono dichiarare
uno o più Appearance statici nominati, indicarne uno iniziale e selezionarne un
altro attraverso la stessa `Game Operation` controllata. La selezione semantica
appartiene al `Game State` e al `Save Snapshot`; URL, dati decodificati e
risorse del renderer no. Fondale verifica nomi e riferimenti, ma non interpreta
se il contenuto artistico rappresenti davvero il significato attribuitogli
dall'Author.

Ogni `Object` dichiara inoltre un `Inventory Appearance` statico, distinto
dall'Appearance nel mondo ma libero di riferire lo stesso PNG. Viene usato sia
nell'Inventory sia come cursore dell'`Inventory Use` selezionato.

Vale una sola regola dimensionale per tutte le immagini fornite dall'Author:
Fondale non ridimensiona, ritaglia o ricampiona una singola immagine per farla
coincidere con il suo uso. Un pixel del PNG corrisponde a un pixel logico prima
delle trasformazioni esplicite che agiscono sulla composizione, come
`Perspective Scale` e adattamento uniforme dell'intero quadro al target. Il
contratto dimensionale concreto dell'Inventory Appearance richiede il
prototipo [Determinare le dimensioni dell'Inventory
Appearance](17-dimensioni-inventory-appearance.md).

Una `Scenery` ritagliata dal Background non introduce un secondo asset: la
regione conserva i pixel e le dimensioni del Background già validato.

### Camminata basilare del Character

L'unica animazione pubblica della Versione 1 è l'Appearance di camminata
direzionale richiesto dall'Example. L'Author fornisce tre strisce PNG
orizzontali — lato, fronte e retro — e Fondale specchia quella laterale per la
direzione opposta. Ogni striscia contiene celle rettangolari di uguale misura;
il primo frame rappresenta la posa ferma.

Le tre strisce condividono numero di frame, altezza e cadenza; la larghezza dei
frame può differire fra direzioni. L'Author dichiara numero di frame e cadenza,
mentre Fondale ricava la larghezza delle celle e verifica divisibilità,
dimensioni, coerenza e `Visual Anchor`. Cambiare l'Appearance di un Character
sostituisce l'intero suo aspetto statico o set direzionale, non un singolo frame.
Animazioni ambientali, generiche, narrative o caricate in streaming restano
fuori dalla Versione 1.

### Avvio, lifecycle ed errori

`startGame` carica e valida tutti gli asset riferiti dal `Game Project` prima
di restituire una `Game Session` giocabile. Non espone avanzamento, bundle,
precaricamento differito, scaricamento manuale o controlli di cache; il
`Game Project` può mostrare una propria attesa mentre attende la Promise.

Un fallimento è atomico: non viene restituita alcuna Game Session, gli elementi
parzialmente montati dal motore vengono rimossi e non compaiono placeholder o
schermate d'errore imposte da Fondale. Tutti i problemi indipendenti rilevabili
nello stesso avvio vengono restituiti insieme, indicando almeno il percorso
della definizione, l'URL e la categoria del problema. Rete e CORS condividono
una categoria quando il browser non permette di distinguerli.

Gli helper e `defineGame` verificano nomi, riferimenti e metadati disponibili
senza caricare file. `startGame` verifica invece raggiungibilità, decodifica
PNG, dimensioni effettive, coerenza delle strisce e compatibilità col dispositivo
WebGL corrente. Non esiste un limite numerico globale inventato da Fondale:
valgono i vincoli dimensionali del singolo uso e la capacità effettiva del
dispositivo. Diagnostica e documentazione generalizzeranno queste categorie in
[Definire validazione, diagnostica e documentazione
pubblica](13-strumenti-autore.md).

Audio, font personalizzati, formati alternativi, pipeline artistiche, varianti
di risoluzione, caricamento progressivo e trasformazioni runtime degli asset
non appartengono a Fondale 1.0.
