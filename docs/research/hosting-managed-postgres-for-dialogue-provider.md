# Hosting con PostgreSQL per il Dialogue Provider

Data della ricerca: 12 agosto 2026
Domanda: quale piattaforma può ospitare l'Example Vite di Fondale, un endpoint
TypeScript che protegge la chiave LLM e la memoria persistente delle
conversazioni in PostgreSQL, senza amministrare server e con un costo fisso
basso?

> **Scope corrente:** il deployment è stato rinviato. Lo spike concordato usa
> un servizio Node, Mastra e PostgreSQL esclusivamente in locale; questo report
> resta ricerca comparativa e non registra una scelta di piattaforma. Le
> raccomandazioni condizionali riportate sotto non devono essere applicate allo
> spike locale senza una nuova decisione esplicita.

## Risultato della ricerca sospesa

La novità più rilevante è **Netlify Database**. Dal 28 aprile 2026 Netlify offre
un PostgreSQL gestito nativo, costruito sull'engine serverless di Neon ma
provisionato, migrato e fatturato da Netlify. Static hosting, Functions, secrets
e PostgreSQL appartengono quindi allo stesso progetto e allo stesso control
plane. Non è più necessario collegare manualmente un account Neon come nella
vecchia integrazione beta
([Netlify Database](https://docs.netlify.com/build/data-and-storage/netlify-database/),
[annuncio GA](https://www.netlify.com/changelog/2026-04-28-netlify-database/)).

Se il tema deployment verrà riaperto, questa ricerca aveva identificato:

1. **Spike/prototipo: Netlify Free + Netlify Database**, senza promessa di
   disponibilità pubblica continuativa. Il piano impone un hard limit di 300
   crediti e il database Free ha un massimo di 48 compute-unit mensili.
2. **Piccola produzione commerciale: Netlify Personal a 9 USD/mese**, finché
   l'uso reale rimane entro i 1.000 crediti inclusi. È la soluzione con meno
   componenti e il minor prezzo d'ingresso fra quelle che offrono davvero tutte
   e tre le parti nello stesso servizio.
3. **Fallback più prevedibile: Render**, con static site gratuito, servizio Node
   Starter da 7 USD/mese e Render Postgres Basic da 6 USD/mese, più almeno
   0,30 USD/mese di storage: circa **13,30 USD/mese**, esclusi traffico, modello
   e overage. È meno serverless, ma esegue normali librerie Node e non dipende da
   un sistema di crediti.

Netlify va comunque provato prima della scelta definitiva. Le Functions sincrone
hanno un limite di 60 secondi e il modello di crediti somma deploy, function
compute, database compute, richieste e banda
([configurazione Functions](https://docs.netlify.com/build/functions/configuration/),
[crediti](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)).
Inoltre, il 12 agosto 2026 le pagine pubbliche di Netlify Database dichiarano
ancora che il prezzo dello storage sarebbe stato annunciato non prima del 1°
luglio 2026, senza pubblicare la tariffa successiva. Il costo di 9 USD è dunque
un buon prezzo d'ingresso, non una stima completa garantita
([billing del database](https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage/)).

Se la priorità assoluta fosse il prezzo prevedibile e si accettassero due aziende
sotto una integrazione ufficiale, **Cloudflare Workers Paid + PlanetScale
Postgres Single Node** parte da circa **10 USD/mese**: 5 USD Workers e 5 USD
PlanetScale. Cloudflare permette provisioning e fatturazione PlanetScale dal
proprio dashboard, ma il database rimane fornito e supportato da PlanetScale;
non è PostgreSQL nativo Cloudflare
([integrazione](https://developers.cloudflare.com/hyperdrive/planetscale/),
[prezzi PlanetScale](https://planetscale.com/docs/postgres/pricing)).

## Vincoli usati

- frontend statico costruito con Vite;
- endpoint TypeScript server-side che non espone la chiave del modello;
- PostgreSQL gestito obbligatorio;
- transcript, thread e riassunti persistenti fuori dal Game State;
- compatibilità con una libreria agentica o, almeno, con un AI SDK TypeScript;
- secrets, sviluppo locale e cancellazione tramite `AbortSignal`;
- nessun sistema operativo o server da amministrare;
- uso da parte di un piccolo gioco commerciale;
- costo del modello escluso, perché dipende dal provider e dai token.

"Una piattaforma" nella matrice significa che frontend, compute e database sono
prodotti gestiti dallo stesso control plane. Una integrazione marketplace o una
fattura unificata non trasforma automaticamente il fornitore esterno del
database in un database nativo.

## Matrice comparativa

| Soluzione | Statico | Endpoint | PostgreSQL | Un solo provider reale? | Prototipo | Piccola produzione | Giudizio |
|---|---|---|---|---|---:|---:|---|
| **Netlify + Netlify Database** | CDN nativa | Functions Node/TS | Gestito, nativo; engine Neon | **Sì**, control plane e fattura Netlify | 0 USD con hard limit | **9 USD/mese** entro 1.000 crediti; storage non ancora prezzato pubblicamente | **Prima scelta per lo spike** |
| **Render** | Static Site gratuito | Web Service Node | Render Postgres gestito | **Sì** | 0 USD, ma DB scade dopo 30 giorni e API va in sleep | **circa 13,30 USD/mese** | **Fallback più prevedibile** |
| **Heroku** | Servito dal dyno, non CDN statico separato | Dyno Node | Heroku Postgres gestito | **Sì** | Nessun vero free tier permanente | **12 USD/mese** | Economico, ma frontend e API condividono il dyno |
| **DigitalOcean App Platform** | Static Site gratuito | Functions/App | Managed PostgreSQL | **Sì** | Functions free; DB a pagamento | **da circa 15 USD/mese** | Solido ma non il più economico |
| **Cloudflare + PlanetScale** | Pages | Workers | PlanetScale Postgres via Hyperdrive | **No**: integrazione e billing Cloudflare, servizio PlanetScale | Potenzialmente 5 USD DB con Workers Free | **circa 10 USD/mese** | Prezzo basso, runtime e integrazione più specifici |
| **Netlify + Neon separato** | CDN Netlify | Functions | Neon gestito | No | 0 USD + 0 USD | 9 USD Netlify + Neon a consumo; spesa tipica Neon Launch 15 USD | Superato dal nuovo Netlify Database salvo necessità di controllo Neon diretto |
| **Vercel + database esterno** | CDN Vercel | Functions Node/TS | Neon, Supabase o altro marketplace | No; Vercel Postgres non esiste più | 0 USD solo personale/non commerciale + DB free | 20 USD Pro + database | Buona DX, costo fisso più alto |
| **Supabase + host statico** | Non è un host Vite completo | Edge Functions Deno/TS | Postgres gestito nativo | No per l'intera app | Backend 0 USD + host esterno free | 25 USD Pro + host esterno | Ottimo backend, non soluzione unica |
| **Railway** | Hosting disponibile | Service/Function | Template PostgreSQL **unmanaged** | Sì, ma fallisce il requisito | da 0–1 USD di credito | da 5 USD + consumo | **Escluso** |
| **Cloudflare Agents senza DB esterno** | Pages | Workers/Agents | Solo SQLite embedded/D1 | Sì, ma non PostgreSQL | 0 USD | da 5 USD | **Escluso dal requisito PostgreSQL** |

Le cifre sono prezzi base in USD, al netto di IVA, LLM, dominio e overage. I
free tier sono adatti a spike e demo, non costituiscono una raccomandazione di
affidabilità produttiva.

## 1. Netlify Database — raccomandazione principale

### Perché oggi è diverso da Netlify + Neon

Netlify Database è descritto come un PostgreSQL pienamente gestito e incorporato
nella piattaforma. Sotto usa Neon, ma Netlify gestisce provisioning, branching,
migrazioni e integrazione con deploy e Functions; l'autore non deve gestire un
account Neon separato
([overview](https://www.netlify.com/platform/database/),
[tooling](https://docs.netlify.com/build/data-and-storage/netlify-database/tooling/)).
La precedente estensione `@netlify/neon` rimane un percorso legacy e non va
confusa con il prodotto GA
([migrazione](https://docs.netlify.com/build/data-and-storage/netlify-database/switch-to-netlify-database/)).

Il fit con Fondale è diretto:

- Vite e static deployment sono supportati dal workflow Netlify;
- una Function TypeScript usa le Web API `Request`/`Response` e il runtime Node;
- `NETLIFY_DB_URL` o `@netlify/database` forniscono una connection string
  PostgreSQL standard;
- l'API key LLM può essere una variabile write-only gestita dal Secrets
  Controller;
- `netlify dev` esegue frontend e Functions, mentre Netlify Database fornisce in
  locale un database realmente compatibile con PostgreSQL
  ([sviluppo locale](https://docs.netlify.com/build/data-and-storage/netlify-database/local-development/),
  [secrets](https://docs.netlify.com/build/environment-variables/secrets-controller/)).

Una libreria come Mastra può usare il proprio adapter PostgreSQL; in alternativa
un adapter più piccolo può usare AI SDK e tabelle applicative. La Function non
deve salvare nulla nel Game State: associa i thread a una sessione del gioco e
scrive messaggi e riassunti nel database server-side.

### Prezzo e limiti

I piani correnti sono Free 0 USD/300 crediti, Personal 9 USD/1.000 crediti e Pro
20 USD/3.000 crediti. Un production deploy costa 15 crediti; Functions e
database compute costano 10 crediti per GB-hour; banda 20 crediti/GB; richieste
2 crediti ogni 10.000
([pricing](https://www.netlify.com/pricing/),
[tabella dei piani](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)).

Il database va in sleep dopo cinque minuti di inattività su Free e Personal.
Free consente al massimo 48 compute-unit per database e 5 GB; Personal arriva a
100 GB e non ha un limite mensile pubblicato sulle compute-unit. La pagina
tecnica e la tabella generale non concordano perfettamente sulla retention dei
backup Free, quindi non va promessa una durata precisa prima di chiarirla con il
provider.

Il piano Personal è plausibile per un piccolo gioco intermittente, ma non basta
guardare il numero di chiamate: un database che resta attivo 37 ore al mese a
una unità consuma 370 crediti, secondo l'esempio ufficiale. Lo spike deve quindi
misurare database wake time, durata delle due fasi LLM e numero di deploy.

### Rischi da provare

- Una Function sincrona termina dopo 60 secondi. Per l'MVP conviene restituire
  JSON al termine delle due fasi, senza streaming, e impostare timeout più corti
  sul modello.
- La API `Request` espone un segnale di abort e gli SDK LLM accettano in genere
  `AbortSignal`, ma Netlify non documenta una garanzia end-to-end secondo cui la
  disconnessione del browser interrompa sempre il lavoro upstream. Lo spike deve
  verificarlo; in ogni caso la risposta tardiva va ignorata da Fondale.
- Il listino pubblico dello storage è incompleto alla data della ricerca.
- I crediti sono condivisi: con auto-recharge disabilitato il sito viene sospeso
  al limite; abilitandolo il costo diventa variabile.

## 2. Render — la scelta più prevedibile

Render fornisce davvero tutti i pezzi: Static Sites su CDN, Web Services Node e
Render Postgres gestito. Un `render.yaml` può dichiarare sito, API, database e
iniezione della connection string, mentre le chiavi LLM rimangono variabili
segrete impostate dal dashboard
([tipi di servizio](https://render.com/docs/service-types),
[Blueprint](https://render.com/docs/blueprint-spec),
[secrets](https://render.com/docs/configure-environment-variables)).

Il costo minimo non gratuito è:

```text
Static Site                   0,00 USD/mese
Web Service Starter           7,00 USD/mese
Postgres Basic-256mb          6,00 USD/mese
1 GB storage                  0,30 USD/mese
──────────────────────────────────────────
Totale minimo                13,30 USD/mese
```

Il listino ufficiale pubblica 7 USD per il servizio Starter, 6 USD per il
database Basic-256mb e 0,30 USD/GB per lo storage
([pricing](https://render.com/pricing),
[piani flessibili Postgres](https://render.com/docs/postgresql-refresh)). Tutti i
database a pagamento ricevono point-in-time recovery; nel workspace Hobby la
finestra è tre giorni.

È un normale processo Node sempre disponibile: ha maggiore compatibilità con
Mastra e con librerie che assumono Node completo, e non soffre del limite di 60
secondi di una Function Netlify. Lo svantaggio è pagare compute idle e gestire
localmente un processo Node più un PostgreSQL locale. Non si amministrano VM,
ma è un servizio applicativo, non una singola funzione.

Il free tier non va usato come database persistente dell'MVP pubblico: il Web
Service va in sleep dopo 15 minuti e il Postgres gratuito scade dopo 30 giorni,
non ha backup né pooling gestito
([free tier](https://render.com/docs/free)).

## 3. Heroku e DigitalOcean — alternative all-in-one

### Heroku

Heroku può servire `dist/` e l'API da un unico dyno Node Basic da 7 USD/mese,
insieme a Heroku Postgres Essential-0 da 5 USD/mese: **12 USD/mese**
([pricing](https://www.heroku.com/pricing/),
[piani Postgres](https://devcenter.heroku.com/articles/heroku-postgres-plans)).
È PostgreSQL gestito e la DX Node è semplice, ma non offre in questa
configurazione un CDN statico separato: asset e API condividono il dyno. Il
router richiede che la risposta inizi entro 30 secondi e specifica che un
timeout non cancella automaticamente il lavoro nel dyno, quindi l'app deve
propagare i propri timeout agli SDK LLM
([request timeout](https://devcenter.heroku.com/articles/request-timeout)).

Il database Essential-0 è piccolo e non altamente disponibile. Heroku è quindi
economico e maturo, ma meno adatto di Netlify alla forma static-site + funzione
e meno generoso di Render sull'attesa di una risposta LLM.

### DigitalOcean

App Platform ospita siti statici gratuitamente e Functions include una quota
mensile; Managed PostgreSQL parte da circa 15 USD/mese
([App Platform pricing](https://www.digitalocean.com/pricing/app-platform),
[Functions pricing](https://www.digitalocean.com/pricing/functions),
[database pricing](https://docs.digitalocean.com/products/databases/postgresql/details/pricing/)).
È un solo provider e offre secrets tramite variabili cifrate, ma il database più
piccolo è orientato a sviluppo o carichi preliminari, non ad alta disponibilità.
Per questo progetto non offre un vantaggio rispetto a Render.

## 4. Soluzioni integrate ma con due fornitori

### Cloudflare Workers + PlanetScale Postgres

Cloudflare non ha un PostgreSQL proprio: D1 e lo storage degli Agents sono
SQLite. Può però creare un database PlanetScale Postgres dal dashboard,
collegarlo ai Workers con Hyperdrive e addebitarlo sulla fattura Cloudflare.
Supporto e database restano PlanetScale
([Workers + PlanetScale](https://developers.cloudflare.com/hyperdrive/planetscale/)).

Il Workers Paid plan parte da 5 USD/mese e include Pages Functions e Hyperdrive;
PlanetScale Postgres Single Node parte da 5 USD/mese, per un totale minimo di
circa 10 USD/mese
([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/),
[PlanetScale pricing](https://planetscale.com/docs/postgres/pricing)). È la
combinazione più economica con costo base esplicito, ma:

- non è un singolo fornitore operativo;
- il database da 5 USD è single-node, quindi non altamente disponibile;
- il runtime Workers è meno compatibile di Node con alcune librerie agentiche;
- usare Cloudflare Agents per la cronologia e PostgreSQL per altri dati
  ricreerebbe due storage, mentre il requisito richiede PostgreSQL per la
  memoria conversazionale.

Può essere il piano B se Netlify supera i crediti inclusi, ma non è il percorso
più semplice per il primo spike.

### Netlify + Neon separato

Neon Free offre 100 CU-hour e 0,5 GB per progetto. Il piano Launch costa 0,106
USD per CU-hour e 0,35 USD per GB-mese; Neon indica 15 USD/mese come spesa tipica
per un carico intermittente da 1 GB
([Neon pricing](https://neon.com/pricing)). La combinazione è ben documentata e
`netlify dev` funziona con `DATABASE_URL`
([guida Neon](https://neon.com/docs/guides/netlify-functions)).

Dopo l'introduzione di Netlify Database nativo, questa configurazione ha senso
soltanto se si desiderano un account Neon indipendente, maggiore portabilità o
funzioni Neon non esposte dal prodotto Netlify. Non è più la scelta più semplice.

### Vercel + PostgreSQL esterno

Vercel Postgres è stato ritirato e migrato a Neon nel 2024. Oggi Vercel offre
Neon, Supabase e altri database attraverso Marketplace: provisioning,
connection string e anche fatturazione possono essere integrati, ma il database
resta esterno
([Postgres on Vercel](https://vercel.com/docs/postgres),
[Marketplace storage](https://vercel.com/docs/marketplace-storage)).

Vercel Hobby è gratuito ma destinato a uso personale e non commerciale; Pro
costa 20 USD/mese prima del database
([pricing](https://vercel.com/pricing)). Le Functions Node sono eccellenti per
AI SDK e hanno limiti ampi, ma per un piccolo gioco commerciale questa soluzione
parte già sopra Netlify, Render, Heroku e Cloudflare+PlanetScale.

## 5. Candidati che non soddisfano il requisito

### Supabase

Ogni progetto Supabase include PostgreSQL dedicato ed Edge Functions TypeScript.
Free offre 500 MB e 500.000 invocazioni; Pro costa 25 USD/mese e include il
compute Micro del primo progetto e due milioni di invocazioni
([pricing](https://supabase.com/pricing),
[Functions pricing](https://supabase.com/docs/guides/functions/pricing)). Le
Functions hanno 150 secondi di idle timeout, conservano secrets e supportano npm,
ma girano su Deno, aspetto da verificare per framework agentici Node-first
([Functions](https://supabase.com/docs/guides/functions),
[limiti](https://supabase.com/docs/guides/functions/limits)).

Supabase non offre un vero deployment del sito Vite fra i componenti del
progetto. Storage può servire asset, ma restituisce HTML come testo semplice e
non sostituisce una piattaforma per SPA
([Storage quickstart](https://supabase.com/docs/guides/storage/quickstart)). Serve
quindi comunque Vercel, Netlify, Cloudflare Pages o un altro host. È un ottimo
backend PostgreSQL, ma non è la risposta a "un provider solo".

### Railway

Railway costa poco: Hobby ha un minimo di 5 USD/mese che include 5 USD di uso;
RAM costa 10 USD/GB-mese, CPU 20 USD/vCPU-mese e volume 0,15 USD/GB-mese
([pricing](https://docs.railway.com/pricing/plans)). Può ospitare statico, API e
un container PostgreSQL nello stesso progetto.

Tuttavia la documentazione qualifica esplicitamente i template database come
**unmanaged**: backup, disaster recovery, tuning, sicurezza, monitoraggio e
manutenzione restano responsabilità dell'utente
([database](https://docs.railway.com/databases),
[PostgreSQL](https://docs.railway.com/databases/postgresql)). Poiché PostgreSQL
gestito è un vincolo, Railway va escluso nonostante il prezzo.

### Cloudflare Agents senza PostgreSQL esterno

Cloudflare Agents persiste lo stato in SQLite embedded per ogni Agent e D1 è
anch'esso SQLite
([Agent state](https://developers.cloudflare.com/agents/runtime/lifecycle/state/)).
È una soluzione economica e coerente per memoria conversazionale, ma non
soddisfa il requisito PostgreSQL. Va mantenuta soltanto come controllo del costo
che il vincolo PostgreSQL introduce.

## Cancellazione e memoria agentica

Nessun provider di hosting sostituisce il contratto applicativo già deciso:

```text
browser abort
  -> endpoint interrompe interpretazione/verbalizzazione quando possibile
  -> SDK LLM riceve lo stesso AbortSignal
  -> nessun turno incompleto viene persistito
  -> Fondale ignora sempre una risposta arrivata dopo l'annullamento
```

Un client che chiude `fetch()` non garantisce, da solo e su tutte le piattaforme,
che compute e richiesta LLM siano già terminati. L'endpoint deve impostare un
timeout proprio e passare un `AbortSignal` al client del modello. La persistenza
del turno deve avvenire solo dopo una risposta riuscita; una transazione
PostgreSQL può rendere atomico il salvataggio dei messaggi visibili.

Mastra supporta PostgreSQL come storage intercambiabile per memoria, workflow e
altri domini (`@mastra/pg`), quindi Netlify Database, Render Postgres, Heroku
Postgres e PlanetScale possono stare dietro lo stesso adapter
([Mastra storage](https://mastra.ai/blog/mastra-storage)). Netlify e Render hanno
runtime Node adatti; Cloudflare e Supabase richiedono uno spike di compatibilità
più attento. Fondale deve comunque dipendere soltanto dal proprio
`DialogueProvider`, non da Mastra o dall'host.

## Ipotesi di deployment sospesa

Questa ipotesi non fa parte dello spike locale corrente. Il percorso studiato
era costruire un adapter nell'Example con **Netlify Personal-compatible
architecture**, iniziando sul piano Free:

```text
Netlify project
├── Vite static site
├── /api/dialogue       Netlify Function TypeScript
└── Netlify Database    PostgreSQL gestito
```

Lo spike deve verificare:

1. `netlify dev` avvia frontend, Function e database locale senza una procedura
   manuale fragile;
2. la libreria agentica scelta funziona nel bundle e nel runtime Node della
   Function;
3. due Character e due sessioni non condividono thread;
4. due fasi LLM e salvataggio del turno finiscono entro 60 secondi, con timeout
   applicativo inferiore;
5. un abort non persiste un mezzo turno e una risposta tardiva viene ignorata;
6. il Load invoca il reset delle conversazioni senza toccare il Game State;
7. 1.000 turni simulati permettono di stimare crediti per Functions, database,
   richieste e banda;
8. la tariffa effettiva dello storage viene verificata nel dashboard o con
   Netlify prima di una pubblicazione commerciale.

Se falliscono i punti 2 o 4, passare a **Render**, senza cambiare il contratto
Fondale né lo schema PostgreSQL. Se Netlify funziona ma il costo a crediti supera
9–14 USD/mese, confrontare il consumo reale con Render a circa 13,30 USD/mese e
Cloudflare+PlanetScale a circa 10 USD/mese.

## Metodo e fonti

Sono state usate esclusivamente fonti primarie: documentazione, listini e
changelog ufficiali dei provider. I prezzi e i limiti sono quelli pubblicamente
visibili il 12 agosto 2026. Dove la documentazione è incoerente o non aggiornata
— in particolare prezzo storage e backup Free di Netlify Database — il report
lo segnala invece di colmare il vuoto con una stima. Le valutazioni di fit e il
ranking sono inferenze progettuali applicate ai vincoli di Fondale.
