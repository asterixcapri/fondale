# Definire qualità, compatibilità e accessibilità di base

Type: grilling
Status: resolved
Blocked by: 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 15

## Question

Qual è la più piccola baseline verificabile per Chrome desktop corrente,
mouse, controlli da tastiera di HUD e dialoghi, determinismo, build e percorso
Playwright dell'Example? La decisione deve evitare una promessa multi-browser,
touch, gamepad o conformità di accessibilità generale non dimostrata dalla
Versione 1.

## Answer

Fondale 1.0 pubblica una `Support Baseline`: l'insieme ristretto di browser,
input e garanzie essenziali di usabilità che ogni release dimostra
esplicitamente. Non usa la parola “accessibile” come dichiarazione generale e
non trasforma capacità accidentali dell'implementazione in compatibilità
promessa.

### Piattaforma supportata

La piattaforma garantita è l'ultima versione stabile corrente di Google Chrome
desktop con WebGL disponibile. La garanzia segue Chrome nel tempo: una
regressione causata da un suo aggiornamento è un bug di Fondale da correggere,
non una ragione per congelare il supporto alla versione usata nel rilascio
precedente.

Fondale 1.0 non promette versioni storiche di Chrome, Chromium generico, altri
browser, touch, gamepad o una matrice di sistemi operativi. La documentazione
pubblica dichiara sia la Support Baseline sia queste esclusioni.

### Mouse, tastiera e usabilità essenziale

Il mouse controlla esplorazione, movimento e interazioni nel mondo e può usare
anche HUD e dialoghi. La tastiera non sostituisce il mouse nel mondo, ma rende
completi HUD e dialoghi:

- `Tab` e `Shift+Tab` percorrono in ordine prevedibile i controlli disponibili
  del HUD; `Enter` o `Space` attivano il controllo corrente;
- `Enter` o `Space` avanzano una `Line`; in una `Choice`, i tasti freccia
  spostano la selezione e `Enter` o `Space` la confermano;
- quando una Choice diventa attiva, il controllo da tastiera vi entra senza un
  clic preliminare; al termine della Sequence torna al controllo precedente;
- passare fra mouse e tastiera non attiva azioni, non perde selezioni logiche e
  non lascia il Player intrappolato.

Il focus da tastiera e l'Object selezionato nell'Inventory sono sempre
percepibili attraverso un indicatore distinto oltre al solo colore. Questa è
una garanzia mirata di operabilità, non una dichiarazione WCAG: supporto per
lettori di schermo, contrasto certificato, movimento ridotto e completamento
del mondo senza mouse richiedono un nuovo effort.

### Determinismo verificato

La prova deterministica riguarda il comportamento del gioco, non i pixel o il
tempo reale. A parità di Game Project, stato iniziale, input ordinati e passi
logici, il core deve produrre gli stessi stati committed e gli stessi effetti,
indipendentemente dal ritmo del renderer o da una sospensione della scheda.

Un percorso con creazione, validazione e ripristino di un Save Snapshot deve
raggiungere lo stesso stato di una prosecuzione equivalente mai interrotta,
senza perdere o ripetere Game Operation. Animazioni ambientali, tempo di
disegno e identità pixel-perfect delle immagini restano fuori da questa
uguaglianza.

### Verifica continua e blocco della pubblicazione

Ogni cambiamento deve superare almeno type-check, build e prove rapide del core
deterministico. Le prove mirate coprono anche l'equivalenza dopo il ripristino
e i rifiuti essenziali già promessi dal contratto: Save Snapshot corrotto o
incompatibile, WebGL assente e asset richiesto mancante, indecodificabile o con
dimensioni invalide.

Prima della pubblicazione, il pacchetto realmente distribuibile e la sua
documentazione devono superare tutti i gate stabiliti da [Definire validazione,
diagnostica e documentazione pubblica](13-strumenti-autore.md). Inoltre
l'Example esterno deve:

1. installare quel pacchetto e produrre la propria build statica;
2. completare in Chrome stabile l'intero scenario fissato da [Definire lo
   scenario di accettazione di Fondale 1.0](15-scenario-accettazione.md), dalla
   nuova partita allo stato finale, inclusi Inventory, Sequence, Choice,
   salvataggio, arresto e ripristino;
3. attraversare la sola interface pubblica e usare veri eventi di mouse e
   tastiera, senza hook interni o mutazioni dirette dello stato;
4. osservare risultati pubblici e percepibili, non dettagli del renderer o
   dell'implementazione;
5. esercitare almeno una finestra desktop ampia e una più piccola o con
   proporzioni differenti, verificando adattamento, letterbox, HUD e dialoghi.

Le verifiche automatiche controllano presenza, disposizione, stato e percorso;
non impongono confronti pixel-perfect. Screenshot diagnostici e una breve
revisione visiva umana dell'Example completano il gate prima della
pubblicazione.

Un fallimento intermittente resta un fallimento: un nuovo tentativo può
raccogliere evidenza diagnostica, ma non può trasformare il risultato in un
passaggio valido né autorizzare la release.
