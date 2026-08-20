# Studio del nome di prodotto per Fondale

Data della seconda ricerca: 16 agosto 2026 Aggiornamento: la lettura
«sufficiente per continuare col package scoped corrente» è stata superata
dall'ADR 0028, che pubblica l'Engine come `fondale` e i satelliti sotto
`@fondale`. Il nome del prodotto, che è la domanda di questo studio, non cambia.
Domanda: qual è il nome più opportuno per il prodotto oggi chiamato Fondale?

## Risultato in breve

La raccomandazione aggiornata è **tenere Fondale**.

Non è una scelta per inerzia. In questa seconda tornata il primo filtro è stato
umano e fonetico: il nome deve essere una parola comune naturale, reggere
pronunciato ad alta voce in italiano e in inglese e non denunciare il processo
con cui è stato inventato. Solo dopo questo gate sono stati valutati fit di
prodotto, collisioni e identificatori digitali.

Con questo ordine, `Tramario` e `Storiario` escono immediatamente. Il feedback
umano «trammammuro» non è una piccola penalità da compensare con un dominio
libero: è il fallimento del requisito fondamentale. Anche le alternative più
serie hanno un limite decisivo. `Quinte` è elegante in italiano ma meno netto in
inglese e molto rumoroso nella ricerca; `Intreccio` descrive bene il modello ma
è difficile da dire e trasmettere fuori dall'Italia; `Ribalta`, `Regia`,
`Scena`, `Ordito`, `Sipario`, `Prospero` e `Diorama` hanno collisioni software o
creative già visibili da fonti first-party.

`Fondale` resta imperfetto: racconta meglio la messa in scena che lo stato, le
azioni e l'autorità narrativa dell'Engine. Ma è una parola vera, sobria, visiva,
memorabile in italiano e coerente con piccole avventure illustrate. Il
descrittore può completarla senza deformarla:

> **Fondale — a TypeScript engine for authored point-and-click worlds.**

Non conviene rinominare un prodotto con un nome soltanto meno occupato. Se si
vuole comunque superare `Fondale`, serve una fase creativa diversa, condotta
prima a voce e senza scoring o availability lookup; questo studio non produce
oggi un sostituto abbastanza buono.

## Che prodotto stiamo nominando

La descrizione pubblica corrente definisce Fondale un Engine web-native e
TypeScript-first per piccole avventure point-and-click, distribuito come
pacchetto MIT e separato dai Game Project che lo usano
([README](../../README.md), [package.json](../../package.json)). Non è un editor
no-code, un generatore di giochi o un semplice renderer.

Il modello canonico in [CONTEXT.md](../../CONTEXT.md) richiede che il nome possa
contenere almeno quattro aspetti:

- un mondo giocabile dichiarativo, validato e interpretato dall'Engine;
- Scene, Character, Object, Camera, Appearance e Animation come messa in scena;
- Command, Noun, Inventory, Passage e HUD come grammatica d'interazione;
- Knowledge-Driven Dialogue libero nell'espressione ma subordinato a
  Narrative Fact, Disclosure, Game State e Game Operation definiti dall'Author.

Il pubblico primario è costituito da sviluppatori TypeScript e piccoli team che
creano avventure 2D per browser. L'identità artistica è italiana e teatrale;
API, package e documentazione sono in inglese. Il nome deve quindi avere gusto
anche senza spiegazione, mentre il descrittore può chiarire la categoria.

## Metodo corretto: la voce viene prima della disponibilità

La prima tornata ha dato troppo potere a semantica, punteggi e disponibilità
tecnica. Questo favorisce neologismi razionalizzabili ma sgradevoli. La seconda
tornata usa tre gate in ordine; un fallimento non può essere recuperato nei
passaggi successivi.

### Gate 1 — suono e naturalezza

Il nome viene letto senza logo e pronunciato in frasi reali: «lo sto costruendo
con X», «X Engine», «la documentazione di X». Deve:

- esistere già come parola comune e non dipendere dalla biografia di una
  persona o di un autore;
- essere sobrio e pronunciabile in IT/EN senza una lezione;
- non generare spontaneamente una battuta, una storpiatura dominante o
  l'impressione di un composto da workshop;
- essere ricordabile e trasmissibile oralmente.

### Gate 2 — fit con l'Engine

Solo i nomi che superano il primo gate vengono confrontati con il prodotto. Un
buon candidato non deve promettere AI, ridurre l'Engine al dialogo o farlo
sembrare un editor per scrittori. Deve poter rappresentare Scene, azioni e stato
insieme all'authorial authority che governa la conversazione libera.

### Gate 3 — collisioni e identificatori

Infine si controllano prodotti vicini, package npm, domini e marchi. Un dominio
libero è un dato operativo, non una qualità del nome. L'USPTO raccomanda di
cercare anche marchi simili per suono, aspetto e significato e usi commerciali
non registrati, non soltanto identici ([USPTO, comprehensive clearance
search](https://www.uspto.gov/trademarks/search/comprehensive-clearance-search-similar-trademarks)).

## Esame dei nomi reali

### Nomi che reggono ad alta voce

| Nome | Giudizio fonetico e di tono | Fit | Esito |
|---|---|---|---|
| **Fondale** | Parola vera, sobria e visiva; naturale in IT, leggibile ma non perfettamente pronunciabile in EN | Forte su Scene e identità illustrata, parziale su azioni e stato | **Promosso: riferimento da battere** |
| **Quinte** | Teatrale e discreto in IT; in EN tende a diventare _quint_ e richiede chiarimento | Le strutture dietro il palco sono una buona metafora dell'Engine che rende possibile l'azione | Non batte Fondale: collisioni e trasmissione EN peggiori |
| **Ribalta** | Energico, naturale, con un significato comprensibile anche tramite _limelight_ | Porta in primo piano azione e Player, meno il sistema sottostante | Escluso per collisione software diretta |
| **Regia** | Autorevole e molto coerente con il controllo autoriale; pronuncia EN non immediata | Ottimo sull'authority, più debole sul mondo giocabile | Escluso per collisione con API AI |
| **Ordito** | Parola vera e metafora strutturale; suono leggermente tecnico ma non artificiale | I fili predisposti dall'Author accolgono la variazione del playthrough | Escluso per prodotto software omonimo |
| **Scena** | Corto, naturale, immediato in entrambe le lingue | Molto forte sul modello di Scene, troppo stretto sul resto | Escluso per collisioni software molto vicine |
| **Atto** | Breve e deciso, ma visivamente coincide con un marchio tecnologico consolidato | Comunica azione e teatro, non continuità di mondo e stato | Escluso per collisioni tecnologiche |
| **Sipario** | Musicale, teatrale e autenticamente italiano | Soglia fra Author e rappresentazione, ma suggerisce apertura/chiusura più che sistema | Escluso per collisioni software e performance |
| **Diorama** | Internazionale, visivo, facile da dire | Adatto a piccoli mondi illustrati, ma ancora più statico di Fondale | Escluso per prodotti creativi e videogiochi omonimi |

Le collisioni decisive sono verificabili sulle fonti che possiedono i prodotti:

- **Ribalta** è già un software interattivo offerto da Mixcity
  ([pagina ufficiale di iscrizione](https://mixcityinc.com/store/ribalta/signup)).
- **Regia** offre un'API AI e SDK JavaScript e Python
  ([documentazione ufficiale](https://docs.regia.ai/quickstart)).
- **Ordito** è un gestionale web modulare per catering e noleggio
  ([sito ufficiale](https://ordito.net/)).
- **Scena** è sia un prodotto con interfaccia JavaScript
  ([documentazione scena.ai](https://docs.scena.ai/widget/interface/)) sia un
  crate che dichiara di possedere scene graph, asset, camere e interaction data
  ([documentazione del crate](https://docs.rs/crate/scena/latest)).
- **ATTO** produce hardware e software per storage e networking
  ([sito ufficiale](https://www.atto.com/support/software-downloads/)); esistono
  inoltre prodotti software omonimi per documenti strutturati
  ([Atto](https://www.atto.tech/)) e time tracking
  ([Atto](https://attotime.com/)).
- **Sipario** è già un'app distribuita per desktop e Android TV
  ([repository ufficiale](https://github.com/Aiml3ss/sipario-releases)) e un
  progetto software per performance immersive
  ([Progetto Sipario](https://www.progettosipario.org/about-en/)).
- **Prospero** è una piattaforma per creare storie interattive ed esperienze
  web ([sito ufficiale](https://prospero.digital/)) e il nome di un'app per
  pianificare produzioni
  ([help center ufficiale](https://intercom.help/prospero-labs/en/articles/9692553-app-overview)).
- **Diorama** è già un editor creativo collaborativo
  ([sito ufficiale](https://diorama.com/)) e identifica uno studio di
  videogiochi ([Diorama Games](https://www.dioramagames.com/)).

### Nomi veri che non superano il gate bilingue

`Intreccio` ha probabilmente il fit semantico migliore: storia, relazioni,
condizioni e stato si intrecciano senza perdere i fili predisposti dall'Author.
Ma _in-TRET-cho_ è difficile da dedurre, scrivere e ripetere per un anglofono.
`Avanscena` è una parola teatrale autentica ma rara anche in italiano e opaca in
inglese. `Proscenio` è più riconoscibile, ma è già il nome di una piattaforma
digitale per la gestione teatrale ([Proscenio](https://proscen.io/)).

Altre parole comuni gradevoli non migliorano il quadro. `Arazzo` coincide con la
specifica OpenAPI per descrivere workflow e dipendenze fra chiamate ([Arazzo
Specification](https://spec.openapis.org/arazzo/latest.html)); `Varco` con una
suite AI per game developer che offre plugin Unity e Unreal ([VARCO Game
AI](https://game-ai.varco.ai/en)); `Teatrino` sia con un toolchain di code
generation ([pubblicazione e artefatto
ufficiali](https://mrg.cs.ox.ac.uk/publications/designing-asynchronous-multiparty-protocols-with-crash-stop-failures/))
sia con un'avventura HTML5 e Windows già pubblicata ([pagina
dell'autore](https://paranoid-alien.itch.io/teatrino-ggj2026)).

Questi nomi non vanno salvati con un buon punteggio semantico: imporrebbero
proprio la spiegazione fonetica che il nuovo metodo vuole evitare.

### Candidati respinti dal test umano

**Tramario** e **Storiario** sono ritirati. Erano neologismi costruiti con una
radice narrativa e un suffisso che suggeriva sistema o repertorio. La
razionalizzazione semantica non ha retto il primo uso ad alta voce: sono stati
percepiti come artificiali e ridicoli, con la storpiatura spontanea
«trammammuro» e, per `Tramario`, l'ulteriore presenza visiva di `MARIO`.

Il loro screening tecnico pulito non ha più alcun peso decisionale. Questa è la
lezione metodologica della prima tornata: un nome non diventa buono perché si
può spiegare e registrare.

Anche **Ariosto** è stato valutato e respinto al gate umano. Come nome proprio è
naturale e suona bene; il riferimento all'_Orlando furioso_ avrebbe avuto un fit
reale con avventura e linee narrative intrecciate — una fonte del Ministero
della Cultura descrive proprio il «complesso intreccio tra diversi filoni
narrativi» ([Pinacoteca Nazionale di
Bologna](https://www.pinacotecabologna.beniculturali.it/images/immagini/parole_ad_arte/LOrlando_Furioso_tra_parole_e_immagini.pdf)).
Esiste inoltre un precedente di categoria: Godot dichiara ufficialmente di
prendere il nome da _Waiting for Godot_ ([press kit di Godot
Engine](https://godotengine.org/press/)).

Il riferimento, però, non si trasforma in identità di prodotto: nel test
immediato `Ariosto` è stato percepito semplicemente come «uno scrittore». Anche
qui il giudizio umano viene prima della buona spiegazione. Lo screening era
peraltro praticabile — nessun documento npm
([registry](https://registry.npmjs.org/ariosto)), `.com` registrato ([Verisign
RDAP](https://rdap.verisign.com/com/v1/domain/ARIOSTO.COM)) e nessun record
`.dev` ([Google Registry
RDAP](https://pubapi.registry.google/rdap/domain/ariosto.dev)) — ma non lo
salva. Questa tornata esclude quindi anche nomi di autori o persone: spostano
l'attenzione sulla biografia del referente e richiedono una nota a piè di pagina
per parlare dell'Engine.

## Ranking aggiornato

La classifica non somma punteggi: rispetta l'ordine dei gate. I nomi sotto il
primo possono essere interessanti, ma non giustificano una migrazione.

| Posizione | Nome | Decisione | Motivo determinante |
|---:|---|---|---|
| **1** | **Fondale** | **Tenere** | È l'unico che combina voce naturale, identità, fit sufficiente e collision screen software relativamente pulito |
| 2 | Quinte | Non rinominare | Metafora elegante ma pronuncia/ricerca EN e collisioni corporate sono peggiori |
| 3 | Intreccio | Non rinominare | Fit eccellente, trasmissione orale EN insufficiente |
| 4 | Avanscena | Non rinominare | Distintivo ma raro, lungo e foneticamente opaco |

`Ribalta` sarebbe la migliore alternativa per gusto puro, ma la collisione con
software interattivo omonimo la elimina prima del ranking operativo. `Regia`
segue per qualità concettuale, con una collisione diretta nel territorio AI.

## Screening operativo dei quattro nomi ordinati

Verifica puntuale del 16 agosto 2026:

| Nome | npm non scoped | `.com` | `.dev` | Lettura |
|---|---|---|---|---|
| `fondale` | nessun documento nel [registry npm](https://registry.npmjs.org/fondale) | registrato secondo [Verisign RDAP](https://rdap.verisign.com/com/v1/domain/FONDALE.COM) | nessun record [Google Registry RDAP](https://pubapi.registry.google/rdap/domain/fondale.dev) | Sufficiente per continuare col package scoped corrente |
| `quinte` | nessun documento nel [registry npm](https://registry.npmjs.org/quinte) | registrato secondo [Verisign RDAP](https://rdap.verisign.com/com/v1/domain/QUINTE.COM) | nessun record [Google Registry RDAP](https://pubapi.registry.google/rdap/domain/quinte.dev) | Il rumore include Quinte Financial Technologies ([sito ufficiale](https://www.quinteft.com/)) |
| `intreccio` | nessun documento nel [registry npm](https://registry.npmjs.org/intreccio) | registrato secondo [Verisign RDAP](https://rdap.verisign.com/com/v1/domain/INTRECCIO.COM) | nessun record [Google Registry RDAP](https://pubapi.registry.google/rdap/domain/intreccio.dev) | Pulizia npm non risolve il limite fonetico |
| `avanscena` | nessun documento nel [registry npm](https://registry.npmjs.org/avanscena) | nessun record [Verisign RDAP](https://rdap.verisign.com/com/v1/domain/AVANSCENA.COM) | nessun record [Google Registry RDAP](https://pubapi.registry.google/rdap/domain/avanscena.dev) | È il più libero tecnicamente e non per questo il migliore |

“Nessun record” descrive la risposta RDAP al momento del controllo; non
garantisce vendibilità, assenza di diritti o disponibilità futura. Un package
scoped come `fondale` non attribuisce diritti esclusivi sulla parola.

Per i marchi questo resta un _knock-out screen_, non una clearance. EUIPO indica
eSearch plus e TMview come strumenti ufficiali, alimentati anche dagli uffici
nazionali e internazionali ([EUIPO, Search
IP](https://www.euipo.europa.eu/en/search-ip)); il Regno Unito offre una ricerca
ufficiale per parola, frase o immagine ([UK
IPO](https://www.gov.uk/search-for-trademark)); l'USPTO precisa che una ricerca
nel database federale non determina da sola la registrabilità ([USPTO, federal
trademark
searching](https://www.uspto.gov/trademarks/search/federal-trademark-searching)).
Qualsiasi rinomina futura richiederà ricerca professionale di marchi identici e
simili nelle classi e nei territori pertinenti.

## Decisione raccomandata

**Mantenere Fondale e smettere di cercare un sostituto per eliminazione.** Il
nome possiede già ciò che lo studio precedente aveva sottovalutato: una voce
riconoscibile e un'immagine mentale immediata. È coerente con la scala intima,
illustrata e teatrale delle avventure, mentre il descrittore spiega che sotto
quella superficie opera un Engine TypeScript che governa mondo, azioni, stato e
dialogo.

Il limite semantico è reale ma gestibile. Un marchio non deve essere la
specifica dell'architettura; deve poterla ospitare senza contraddirla. `Fondale`
non promette un editor passivo e non impedisce estensioni come il Dialogue
Server. `Quinte` cambierebbe soltanto la posizione nella stessa metafora
teatrale, introducendo più attrito internazionale e di ricerca.

Se il team sente ancora che `Fondale` non è il nome definitivo, il prossimo
passo non è un'altra matrice. È una fase creativa breve e orale:

1. produrre nomi senza controllare domini, evitando suffissi inventati e parole
   che tentano di riassumere tutta l'architettura;
2. fare una selezione _sound-only_ con parlanti IT/EN, senza logo né pitch; 3.
conservare soltanto i nomi che generano curiosità e nessuna spiegazione o
   battuta dominante;
4. applicare fit, collisioni e clearance legale solo ai due o tre sopravvissuti.

Fino a quando da quel processo non emerge un nome che batte chiaramente
`Fondale` di pancia e di prodotto, la decisione corretta è non rinominare.
