# Specifica di produzione dei fondali

Questa è la fonte operativa per generare, valutare e preparare ogni fondale di
Capri 1535. Traduce la direzione artistica del progetto in istruzioni
riutilizzabili per un generatore di immagini e in vincoli verificabili per il
gioco.

## Formato di consegna

- **Sorgente:** PNG opaco, RGB, orizzontale, preferibilmente **2048x1152
  (16:9)**. Non generare direttamente alla risoluzione logica del gioco.
- **Destinazione:** PNG RGB a **426x240**, 64 colori per scena, senza dithering
  aggiunto in quantizzazione.
- **Percorsi:** il sorgente va in `art/concept/backgrounds/<slug>.png`; il file
  elaborato viene scritto in `art/rooms/<slug>.png`.
- **Contenuto escluso:** nessun personaggio, testo, logo, cursore, interfaccia o
  cornice nell'immagine.

Il formato corrente 426x240 e l'aspect ratio 16:9 sostituiscono le ipotesi
provvisorie 320x200 e 16:10 del documento iniziale. L'interfaccia è sovrapposta
e non sottrae spazio alla scena.

## Identità visiva

Il fondale deve sembrare creato per un'avventura grafica VGA dei primi anni
Novanta, con un trattamento originale e non come imitazione letterale di un
artista o di un gioco specifico.

Caratteristiche comuni:

- pittura digitale a mano, non fotorealistica;
- forme semplificate e silhouette leggibili alla risoluzione finale;
- dettagli suggeriti per masse, non micro-dettaglio fotografico;
- gradienti airbrush e dithering pittorico sottile e raggruppato;
- tre piani leggibili: primo piano, spazio giocabile, sfondo;
- prospettiva leggermente teatrale, con verticalità mediterranea accentuata;
- pietra calcarea calda, intonaco bianco, legno invecchiato e terracotta;
- mare blu intenso, ombre viola e luce dorata radente;
- vegetazione mediterranea: ulivi, fichi, viti, cipressi e bouganville usata con
  moderazione;
- atmosfera avventurosa e abitata, mai da cartolina turistica moderna.

I cinque riferimenti canonici sono in `art/concept/backgrounds/`. Allegare a
ogni nuova generazione il fondale esistente più simile e, quando utile,
`vicolo-capri.png` come riferimento generale di palette e trattamento. Il
riferimento definisce lo stile, non la composizione da copiare.

## Capri nel 1535

La geografia deve restare riconoscibile, mentre edifici e oggetti devono essere
credibili per il XVI secolo. Usare case semplici in pietra e calce, piccoli
edifici religiosi, orti, vigneti, pergolati, muri a secco, cisterne, barche in
legno, vele latine, reti, corde, botti, casse e approdi minori.

Non inserire:

- porto moderno, yacht, motori, automobili o strade asfaltate;
- funicolare, Via Krupp, hotel o architettura ottocentesca;
- illuminazione elettrica, insegne moderne, plastica o arredi turistici;
- costumi da pirata caraibico o decorazioni fantasy;
- monumenti reali spostati soltanto per riempire la composizione.

Quando una scena rappresenta un luogo reale preciso, raccogliere prima due o
tre riferimenti geografici o architettonici. Il prompt deve nominare gli
elementi che rendono riconoscibile quel luogo e separare ciò che è documentato
da ciò che è ricostruzione plausibile.

## Composizione giocabile

Un bel panorama non è ancora una stanza giocabile. Ogni fondale deve contenere:

1. un piano di calpestio continuo e inequivocabile, abbastanza largo per uno
   sprite alto fino a 100 pixel in primo piano;
2. almeno un ingresso vicino a un bordo e un'uscita visivamente leggibile;
3. una variazione di profondità sufficiente a scalare Michele dal 100% in primo
   piano a circa il 55% sul fondo;
4. da uno a tre possibili hotspot con sagome riconoscibili;
5. almeno un elemento di primo piano dietro cui il personaggio possa passare;
6. spazio libero attorno ai punti d'interazione, senza barriere puramente
   decorative che rendano ambiguo l'avvicinamento.

La camera è fissa, a tre quarti e leggermente rialzata. Evitare grandangoli
estremi, profondità di campo, sfocature, prospettive fotografiche deformate e
inquadrature cinematografiche che nascondono il suolo. Porte, archi, sentieri e
scale devono avere una destinazione spaziale comprensibile.

Non incorporare personaggi o oggetti mobili nel fondale: vengono prodotti come
asset separati. Gli elementi statici che devono coprire Michele non richiedono
un PNG separato; il motore li ritaglia dal fondale tramite una maschera.

## Prompt riutilizzabile

Sostituire le parti tra parentesi quadre e allegare uno o due fondali canonici.

```text
Genera un fondale originale per una stanza di un'avventura grafica 2D
point-and-click ambientata a Capri nel 1535.

LUOGO E FUNZIONE
[Descrizione del luogo, momento narrativo e funzione giocabile della scena.]

COMPOSIZIONE
Inquadratura fissa a tre quarti, leggermente rialzata, orizzontale 16:9. Mostra
un piano di calpestio continuo da [ingresso] a [uscita], abbastanza largo per un
personaggio. Disponi [hotspot] in modo leggibile e inserisci [elemento di primo
piano] dietro cui il personaggio possa passare. Mantieni liberi i punti di
avvicinamento. Tre piani di profondità chiaramente separati.

STILE
Fondale dipinto a mano per un'avventura VGA dei primi anni Novanta: forme
semplificate, silhouette leggibili, gradienti airbrush, dithering pittorico
sottile, dettagli pensati per sopravvivere alla riduzione a 426x240. Pietra
calcarea calda, intonaco bianco, mare blu intenso, ombre viola e luce
mediterranea dorata. Usa le immagini allegate come riferimento di palette,
trattamento e densità del dettaglio, senza copiarne la composizione.

VINCOLI STORICI
[Elementi geografici e architettonici obbligatori.] Capri cinquecentesca,
credibile e geograficamente riconoscibile. Nessun elemento moderno, turistico,
ottocentesco, fantasy o da pirati caraibici.

OUTPUT
PNG opaco, 2048x1152, senza personaggi, testo, logo, interfaccia, cursori o
cornici. Non aggiungere bordi decorativi. Non sfocare alcun piano.
```

## Metodo di iterazione

1. Generare poche bozze e giudicare prima la **geografia del gioco**: suolo,
   entrate, uscite, hotspot e occlusioni.
2. Scegliere una sola composizione; da quel momento modificarla invece di
   rigenerarla da zero.
3. Chiedere una correzione per volta, indicando cosa cambia e cosa deve restare
   identico.
4. Solo dopo l'approvazione produrre il sorgente finale ad alta qualità.
5. Processare il file:

   ```sh
   python tools/process_background.py art/concept/backgrounds/<slug>.png
   ```

6. Guardare `art/rooms/<slug>.png` sia a 1x sia ingrandito con
   nearest-neighbour. L'approvazione del sorgente non sostituisce quella del
   risultato a 426x240.
7. Allestire area camminabile, maschere, hotspot e uscite; validarli con
   `?debug` nel browser.

## Criteri di accettazione

- Il luogo è riconoscibile e non contiene anacronismi evidenti.
- La scena appartiene visivamente alla stessa famiglia dei quattro riferimenti.
- La composizione resta leggibile dopo riduzione e quantizzazione.
- Esiste un percorso continuo tra ingresso e uscita.
- Gli hotspot si distinguono senza contorni artificiali o testo.
- Il primo piano crea profondità senza nascondere il percorso principale.
- Non ci sono personaggi, oggetti mobili o UI incorporati nel fondale.
- Il PNG finale è 426x240 e la verifica browser non mostra errori o zone
  interattive fuori registro.

## Asset da produrre separatamente

Non mescolare questi asset nella richiesta del fondale:

- sprite degli NPC, con idle, parlata e l'eventuale gesto richiesto dalla scena;
- icone degli oggetti d'inventario;
- oggetti mobili e varianti di stato necessarie agli enigmi;
- piccoli loop ambientali, come acqua, fiamme, vele o animali;
- eventuali ritratti dei dialoghi, quando la loro presenza sarà decisa.

I controlli HUD, i cursori e le icone semplici vanno preferibilmente disegnati
come SVG o codice nativo, non generati dentro un'immagine raster.
