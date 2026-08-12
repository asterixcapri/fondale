# Fondale — Knowledge-Driven Dialogue MVP

Status: ready-for-human

## Problem Statement

Fondale oggi presenta conversazioni esclusivamente attraverso `Sequence`,
`Line` e `Choice` scritte dall'Author. Questo percorso è adatto alle scene in
cui parole, ritmo e diramazioni devono essere esatti, ma obbliga l'Author a
prevedere in anticipo ogni domanda che il Player potrebbe voler formulare.

L'obiettivo è aggiungere una Engine Capability pubblica per la conversazione
esplorativa in linguaggio libero. Un Character deve rispondere in base a ciò
che conosce, a ciò che può rivelare e al proprio modo di comportarsi e parlare,
senza trasformare il modello linguistico nell'autorità narrativa del gioco.

Una semplice chat collegata a un modello non è sufficiente. Fondale deve
continuare a garantire Game State canonico, Game Operation atomiche, Save
Snapshot esatti e comportamento verificabile. Il modello non può inventare
Narrative Fact importanti, sbloccare progressione, apprendere da solo fatti o
far trapelare un `secret`. La memoria necessaria a una conversazione naturale
può essere lunga, ma non deve diventare Game State né essere duplicata nei Save
Snapshot.

La prima consegna deve dimostrare questa separazione end-to-end con un adapter
locale reale, senza legare il contratto pubblico di Fondale a Mastra,
PostgreSQL, OpenRouter o a uno specifico modello.

## Solution

Fondale introduce `Knowledge-Driven Dialogue` come Engine Capability pubblica
e opzionale, complementare al dialogo authored. Un Character configurato per
la capability può aprire una `Conversation` tramite `Talk To`; un Character non
configurato continua a usare le risoluzioni e le `Sequence` esistenti.

Il Game Project dichiara due registri con identità stabili:

- i `Narrative Fact`, che rappresentano proposizioni vere e canoniche;
- le `Claim`, che rappresentano proposizioni comunicabili senza essere
  considerate vere dall'Engine.

La Game Definition di un Character rimane unica e può contenere una sezione
opzionale `dialogue`. Questa sezione dichiara `Biography`, `Personality`,
`Dialogue Behavior`, `Voice`, `Character Knowledge`, `Relationship` iniziali,
eventuale `Dialogue State` e `Cover Story`. La separazione interna per Engine
Capability non obbliga quindi l'Author a definire lo stesso Character in due
registri differenti.

Ogni voce di `Character Knowledge` riferisce un `Narrative Fact` tramite ID e
possiede la propria `Disclosure`. Un fatto `open` è eleggibile quando pertinente;
un fatto `guarded` usa una condizione scelta dall'Author per quella voce; un
fatto `secret` richiede un unlock esplicito che non può essere sostituito dal
solo `Trust`.

Un `Dialogue Turn` attraversa tre responsabilità in ordine:

1. il `Dialogue Provider` interpreta la frase del Player e restituisce un
   risultato strutturato riferito soltanto agli ID dichiarati;
2. Fondale valida quel risultato, applica `Character Knowledge`, `Disclosure`,
   `Relationship`, `Dialogue State`, `Dialogue Behavior` e `Cover Story`, e
   produce un risultato semantico autorizzato;
3. il `Dialogue Provider` verbalizza soltanto tale risultato usando `Biography`,
   `Personality`, `Voice` e il contesto conversazionale visibile.

Interpretazione e verbalizzazione sono due fasi logiche separate dalla seam di
autorità dell'Engine. Il contratto non prescrive il numero di richieste HTTP
usate internamente da un adapter.

Fondale non ricava mai Game State dal testo generato. Soltanto dopo una
verbalizzazione riuscita, il `Dialogue Turn` committa atomicamente la `Line`
accettata e le Game Operation già decise dall'Engine, come l'apprendimento di
un Narrative Fact o la registrazione di una `Testimony`. Un errore, una
cancellazione o un risultato tardivo non cambia Game State.

La continuità della conversazione appartiene al `Dialogue Provider`. Transcript,
riassunti, gestione della context window e identificatori di thread non entrano
nel Game State o nel Save Snapshot. Quando Fondale carica un Save Snapshot,
l'adapter resetta tutte le conversazioni della Game Session; un'eventuale
`Conversation` ripristinata riparte quindi senza la precedente memoria del
provider.

La stessa capability offre `Reflection`: il Player consulta il Player
Character sui suoi Narrative Fact appresi, sulle Testimony ricordate e su
eventuali `Hypothesis` espresse chiaramente come incerte. `Reflection` non ha un
secondo interlocutore, non applica Disclosure o Cover Story e non rende
canoniche le Hypothesis.

La prova reale resta confinata all'Example e usa un processo Node.js TypeScript
locale, Mastra, `@mastra/pg`, PostgreSQL locale e OpenRouter. Il modello iniziale
è `deepseek/deepseek-v4-flash-0731`, configurato server-side e sostituibile senza
modificare Fondale. Una fixture tecnica con Michele e Antonio rimane separata
dalla storia e dai dialoghi canonici dell'Example.

## User Stories

1. Come Player, voglio scrivere liberamente una domanda a un Character, così da
   investigare senza scegliere soltanto frasi previste dall'Author.
2. Come Player, voglio che formulazioni differenti della stessa domanda
   raggiungano la stessa conoscenza pertinente.
3. Come Player, voglio che un Character risponda usando soltanto Narrative Fact
   che conosce e che può comunicare.
4. Come Player, voglio che il modo di parlare e di trattenere informazioni resti
   coerente fra più Dialogue Turn.
5. Come Player, voglio che un Character possa mentire quando l'Author gli ha
   assegnato una Cover Story, senza rendere vera la bugia.
6. Come Player, voglio che il Player Character ricordi chi ha espresso una
   Claim, così da poter riconoscere Testimony incompatibili.
7. Come Player, voglio che una conversazione lunga mantenga continuità senza
   inserire il transcript nel mio Save Snapshot.
8. Come Player, voglio che caricare un Save Snapshot azzeri le conversazioni
   precedenti, così da non mescolare memorie appartenenti a progressioni
   differenti.
9. Come Player, voglio usare Reflection per riepilogare ciò che il Player
   Character sa, ricorda e sospetta senza ottenere conoscenza onnisciente.
10. Come Player, voglio poter lasciare o cancellare una conversazione in attesa
    senza applicare conseguenze parziali.
11. Come Author, voglio dichiarare ogni Narrative Fact e Claim una sola volta
    con un ID stabile, così da riusarli senza duplicare formulazioni.
12. Come Author, voglio assegnare Disclosure differenti allo stesso Narrative
    Fact per Character differenti.
13. Come Author, voglio scegliere la condizione di ogni fatto `guarded` e
    l'unlock esplicito di ogni fatto `secret`.
14. Come Author, voglio configurare il profilo conversazionale accanto alla
    restante Game Definition del Character, senza duplicarne l'identità.
15. Come Author, voglio mantenere `Sequence`, `Line` e `Choice` per le scene che
    richiedono testo, timing e diramazioni esatte.
16. Come Author, voglio fornire un Dialogue Provider senza esporre credenziali
    nel browser o dipendere da un vendor imposto da Fondale.
17. Come Author, voglio che Game Project invalidi riferimenti, Disclosure e
    Cover Story incoerenti prima di avviare la Game Session.
18. Come maintainer dell'Engine, voglio testare Knowledge-Driven Dialogue con un
    FakeDialogueProvider deterministico e privo di rete.
19. Come maintainer dell'Engine, voglio che il testo generato non abbia autorità
    sul Game State, così da preservare commit atomici e Save Snapshot esatti.
20. Come maintainer dell'Example, voglio sostituire il modello OpenRouter tramite
    configurazione server-side, così da confrontare costo e qualità senza
    modificare il motore.

## Authoring Decisions

- Il Game Project espone registri `narrativeFacts` e `claims`. Ogni definizione
  contiene almeno una `proposition` non vuota; la chiave del registro è
  l'identità stabile e la formulazione può cambiare senza cambiare identità.
- `CharacterDefinition` riceve una sezione opzionale `dialogue`. Il dato rimane
  composto una sola volta dall'Author; internamente World non interpreta né
  valida le regole di Knowledge-Driven Dialogue.
- `Biography` è prosa contestuale. Non autorizza da sola alcun Narrative Fact.
- `Personality` usa soltanto valori qualitativi. L'MVP non espone punteggi,
  probabilità o formule numeriche per i tratti.
- `Dialogue Behavior` usa un vocabolario finito e controllato dall'Engine per
  preferenze come rispondere, evadere, rifiutare o contro-domandare. Non è un
  linguaggio libero di regole e non può scavalcare Disclosure.
- `Voice` governa forma, registro e lunghezza della verbalizzazione, mai il
  contenuto autorizzato.
- Ogni Character Knowledge definition contiene un `factId` e la propria
  Disclosure. Due Character possono conoscere lo stesso Narrative Fact con
  Disclosure differenti.
- La forma iniziale di Disclosure distingue `open`, `guarded` e `secret`.
  `guarded` richiede una condizione esplicita scelta dall'Author, inizialmente
  basata su un livello minimo di Trust oppure su una Game Variable booleana.
  `secret` richiede un unlock esplicito basato su una Game Variable; Trust da
  solo non è un unlock valido.
- Una Cover Story è dichiarata sul Character come associazione da
  `concealsFactId` a `claimId`. Entrambi i riferimenti devono esistere e il
  Character deve conoscere il Narrative Fact nascosto.
- Le Relationship sono direzionali. L'MVP modella soltanto Trust come `low`,
  `medium` o `high` e lo cambia esclusivamente tramite Game Operation authored.
- Dialogue State è opzionale, qualitativo e authored. Non viene inferito dal
  testo del Player e non introduce una simulazione emotiva numerica.
- Il Player Character usa lo stesso modello di Character Knowledge,
  Relationship e Testimony degli altri Character.
- Gli identificatori e tutti i type pubblici usano i termini inglesi canonici
  di `CONTEXT.md` e vengono esportati dal package root.

Un esempio illustrativo della forma pubblica desiderata è:

```ts
const project = {
  narrativeFacts: {
    "antonio-on-santa-lucia": {
      proposition: "Antonio was aboard the Santa Lucia.",
    },
  },

  claims: {
    "antonio-denies-santa-lucia": {
      proposition: "Antonio was never aboard the Santa Lucia.",
    },
  },

  characters: {
    antonio: {
      initialScene: "harbour",
      groundPoint: { x: 420, y: 250 },
      facing: "left",
      appearance: "default",

      dialogue: {
        biography: "A former sailor who avoids discussing his last voyage.",
        personality: {
          talkativeness: "low",
          honesty: "low",
          discretion: "high",
          suspiciousness: "high",
        },
        voice: {
          verbosity: "short",
          tone: "dry",
          vocabulary: "simple",
        },
        knowledge: [
          {
            factId: "antonio-on-santa-lucia",
            disclosure: {
              level: "secret",
              when: { variable: "antonio-ready-to-confess", equals: true },
            },
          },
        ],
        coverStories: [
          {
            concealsFactId: "antonio-on-santa-lucia",
            claimId: "antonio-denies-santa-lucia",
          },
        ],
        relationships: {
          michele: { trust: "low" },
        },
      },
    },
  },
} satisfies GameProject;
```

La sintassi esatta può essere affinata durante i test di authoring, ma non può
cambiare la semantica approvata né separare la definizione dello stesso
Character in due registri autoriali.

## Runtime Decisions

- Knowledge-Driven Dialogue possiede un capability module verticale. Game
  Project coordina la compilazione, Game Session coordina l'attività dominante
  e l'applicazione atomica delle Game Operation, Sequence continua a possedere
  Line e la relativa presentazione.
- La Game State iniziale copia Character Knowledge e Relationship dal Game
  Project compilato. Questi valori runtime non mutano le Game Definition.
- L'MVP aggiunge Character Knowledge in modo monotono: una Game Operation può
  apprendere un Narrative Fact non ancora noto, ma non dimenticarlo o
  sostituirlo.
- Le Testimony runtime formano un insieme di associazioni tra speaker, listener
  e `claimId`, non un transcript ordinato. Ripetere la stessa Claim non crea
  duplicati canonici.
- Trust e Dialogue State cambiano soltanto attraverso Game Operation esplicite;
  il Dialogue Provider non può proporre o applicare autonomamente tali cambi.
- Il Dialogue Provider interpreta l'input in un output strutturato. Fondale
  accetta soltanto ID esistenti e pertinenti alle definizioni fornite; valori
  sconosciuti vengono rifiutati senza effetti.
- Se l'interpretazione è ambigua, Fondale autorizza la Response Strategy
  `clarify`. Il turno non comunica Narrative Fact o Claim e non produce altre
  Game Operation.
- Il Behaviour Engine seleziona deterministicamente la Response Strategy e il
  contenuto autorizzato. Non usa probabilità o casualità derivata dai tratti.
- Una Cover Story può essere verbalizzata soltanto quando è associata al
  Narrative Fact nascosto pertinente. Il provider non può improvvisare una
  bugia fattuale.
- Prima della verbalizzazione Fondale costruisce un payload che contiene
  soltanto Narrative Fact, Claim e Response Strategy autorizzati per quella
  risposta. Biography, Personality e Voice possono essere inclusi per la resa,
  ma non ampliano il payload semantico.
- Fondale non esegue un secondo controllo semantico del testo generato. Il
  contratto, la restrizione del payload, i prompt dell'adapter e i test live
  verificano che il provider non aggiunga Narrative Fact importanti.
- Un Dialogue Turn riuscito presenta prima l'input accettato come Line del
  Player Character e poi la risposta come Line dell'interlocutore. Il testo del
  Player resta input non fidato e non diventa Narrative Fact.
- La verbalizzazione e le Game Operation predecise formano un solo commit
  osservabile. Il fallimento della verbalizzazione scarta tutte le conseguenze
  staged.
- Durante una richiesta pending, la Conversation non accetta un secondo invio.
  Il Player può cancellare o lasciare; Save, Load e `stop()` invalidano la
  richiesta. Ogni risultato tardivo viene ignorato tramite identità del turno e
  cancellazione.
- Una Conversation è la Game Activity dominante. Le condizioni authored
  possono avviare una Sequence; l'Engine decide esplicitamente se chiudere o
  riprendere la Conversation al termine.
- `Talk To` apre una Conversation soltanto per un Character con configurazione
  `dialogue`. Gli altri Character conservano esattamente la risoluzione authored
  esistente.
- Reflection usa soltanto Character Knowledge, Testimony e Relationship del
  Player Character disponibili nel Game State caricato. Può esprimere
  Hypothesis e suggerire piste come possibilità non canoniche, senza applicare
  Game Operation.
- Conversation e Reflection usano thread di provider distinti. Conversation
  usa inoltre thread distinti per interlocutore, evitando che due Character
  condividano memoria visibile.
- Il Game State e il Save Snapshot non contengono transcript, riassunto,
  messaggi tecnici, model ID, provider ID, token usage o thread ID.
- Load invoca il reset del Dialogue Provider per la Game Session prima di
  accettare nuovi Dialogue Turn. Se il Save Snapshot ripristina una Conversation
  attiva, questa continua come una nuova conversazione priva della memoria
  provider precedente.

## Dialogue Provider Interface

- Fondale espone una interface pubblica provider-agnostic e riceve il relativo
  adapter come dipendenza di startup. Fondale non crea client di modelli e non
  legge credenziali.
- L'interface esprime le due fasi logiche `interpret` e `verbalize` e un reset
  della memoria conversazionale. Accetta `AbortSignal` e identifica ogni
  Dialogue Turn in modo non canonico.
- `interpret` riceve il testo non fidato del Player, l'identità della
  Conversation e soltanto le definizioni necessarie a riferire l'input agli ID
  dichiarati. Il suo risultato tecnico non viene mostrato al Player né
  persistito come messaggio visibile.
- `verbalize` riceve il risultato semantico già autorizzato, il profilo del
  Character e la stessa identità conversazionale. Restituisce una singola Line
  non vuota entro i limiti dell'Engine.
- L'adapter persiste soltanto i messaggi visibili del Player e del Character
  necessari alla continuità. Gli output strutturati dell'interprete e i payload
  interni dell'Engine non diventano transcript.
- `reset` elimina o invalida tutti i thread associati alla Game Session. La
  retention fisica ulteriore è responsabilità dell'adapter, non del Save
  Snapshot.
- Il FakeDialogueProvider è il secondo adapter reale alla seam: rende i test di
  Fondale deterministici e dimostra che Mastra non fa parte dell'interface.

## Local Adapter Decisions

- L'adapter live appartiene all'Example e gira in un processo Node.js TypeScript
  locale separato dal browser Vite. Fondale non acquisisce dipendenze runtime da
  Mastra, PostgreSQL o OpenRouter.
- Mastra gestisce agent, memoria e context management. `@mastra/pg` persiste i
  thread in PostgreSQL locale.
- Il browser comunica soltanto con l'adapter Node locale. L'API key OpenRouter e
  `DATABASE_URL` rimangono variabili del processo Node e non usano mai il
  prefisso `VITE_`.
- La configurazione locale usa `examples/capri-1535/.env.local`, già ignorato da
  Git. La spec e i test non leggono, stampano o versionano i relativi segreti.
- OpenRouter viene integrato tramite `@openrouter/ai-sdk-provider`. Il modello
  iniziale è `deepseek/deepseek-v4-flash-0731`, che dichiara supporto agli
  structured output. Il model ID è configurabile server-side.
- L'interprete richiede structured output con schema chiuso. La verbalizzazione
  usa testo naturale e un limite breve coerente con Voice.
- Mastra/PostgreSQL conservano la conversazione completa e gestiscono il budget
  di contesto tramite le funzioni di memoria della libreria. L'eventuale
  compattazione è non canonica e deve preservare almeno i messaggi visibili
  recenti.
- Il reset su Load elimina o rende irraggiungibili i thread della Game Session
  precedente prima di rispondere con successo al browser.
- La fixture tecnica Michele/Antonio non modifica Narrative Fact, Character o
  Sequence della storia canonica dell'Example. Può vivere accanto alle fixture
  browser già dedicate alla verifica tecnica.
- Hosting, database gestiti e funzionamento production non fanno parte di
  questa consegna.

## Testing Decisions

- I test automatici di Fondale usano esclusivamente FakeDialogueProvider e non
  richiedono rete, API key, Mastra o PostgreSQL.
- I test di authoring verificano Narrative Fact e Claim mancanti, ID duplicati,
  proposizioni vuote, Character Knowledge con riferimenti inesistenti,
  Disclosure incoerenti, Relationship verso Character inesistenti e Cover
  Story non valide.
- I test di Game State verificano inizializzazione indipendente dalle Game
  Definition, apprendimento monotono, Testimony deduplicate, Trust direzionale,
  Game Operation atomiche e round trip esatto del Save Snapshot.
- I test del Behaviour Engine coprono `open`, `guarded` soddisfatto e non
  soddisfatto, `secret` bloccato e sbloccato, Cover Story, `clarify`, assenza di
  conoscenza pertinente e preferenze qualitative senza casualità.
- I test del Dialogue Turn verificano che una verbalizzazione fallita non
  committi nulla, che un risultato tardivo venga ignorato e che un secondo
  input sia bloccato durante il pending.
- I test verificano che il payload di verbalizzazione non contenga Narrative
  Fact non autorizzati e che nessun parser tenti di ricavare Game Operation dal
  testo restituito.
- I test Save verificano che transcript, thread ID e memoria del provider siano
  assenti dal Save Snapshot e che Load invochi il reset prima di un nuovo turno.
- I test di integrazione con FakeDialogueProvider verificano la convivenza con
  Sequence, Line e Choice e il fallback authored per Character senza profilo
  `dialogue`.
- Una fixture browser deterministica verifica input libero, stato pending,
  cancellazione, presentazione delle due Line, Conversation e Reflection senza
  dipendere da un modello live.
- Un test live separato e opt-in usa Mastra, PostgreSQL e OpenRouter. Non fa
  parte di `npm run build` o `npm run verify`, perché ha costo, latenza e output
  non deterministici.
- La verifica finale dell'Engine rimane `npm run build` e `npm run verify`; il
  test live dispone di un comando e di prerequisiti documentati separatamente.

## Live Spike Acceptance

Lo spike live è riuscito quando una persona può osservare tutti questi casi con
la fixture Michele/Antonio:

1. domande parafrasate individuano lo stesso Narrative Fact pertinente;
2. Antonio comunica un fatto `open`;
3. Antonio protegge un fatto `secret` ancora bloccato;
4. Antonio usa una Cover Story e Michele acquisisce la relativa Testimony;
5. un Narrative Fact selezionato dall'Engine entra nella Character Knowledge di
   Michele e influenza un Dialogue Turn successivo;
6. più Dialogue Turn mantengono continuità attraverso Mastra e PostgreSQL senza
   transcript nel Game State;
7. Load resetta i thread e il turno successivo non ricorda la conversazione
   precedente;
8. Reflection riepiloga Narrative Fact e Testimony disponibili e distingue le
   Hypothesis come incerte.

Il test live registra soltanto esito, latenza indicativa, model ID e token/costo
tecnico fuori dal Game State. Non trasforma una risposta specifica del modello
in una stringa attesa dai test automatici.

## Out of Scope

- Sostituire Sequence, Line o Choice con dialogo generato.
- Permettere al Dialogue Provider di applicare Game Operation o modificare Game
  State direttamente.
- Inferire Narrative Fact, Trust, Dialogue State o Relationship dal testo
  generato o dal sentiment del Player.
- Verificare semanticamente ogni risposta con un secondo modello.
- Generare bugie fattuali non dichiarate come Cover Story.
- False belief generali, confidence, fonti, rumor, gossip, propagazione sociale,
  dimenticanza o deduzioni canoniche automatiche.
- Salvare transcript, riassunti o thread ID nel Game State o nel Save Snapshot.
- Ripristinare la memoria della conversazione associata a un Save Snapshot.
- Costruire un knowledge graph o introdurre un vector database.
- Definire una simulazione numerica di Personality, Trust o emozioni.
- Rendere Mastra, PostgreSQL, OpenRouter o DeepSeek dipendenze pubbliche di
  Fondale.
- Rendere il Dialogue Provider un plugin system generale.
- Integrare la fixture tecnica nella storia canonica dell'Example.
- Scegliere o implementare una piattaforma di deploy, un database cloud,
  autenticazione production, rate limiting o billing multiutente.
- Garantire modalità offline per il Dialogue Provider live.

## Further Notes

- Questa spec deriva dalle decisioni approvate nel grilling e va letta insieme
  a `CONTEXT.md` e agli ADR-0013, ADR-0014, ADR-0015 e ADR-0016.
- Mastra con PostgreSQL e il modello DeepSeek scelto sono decisioni dello spike,
  non Architecture Decision Record e non vincoli per altri Game Project.
- La capability pubblica deve mantenere una interface piccola: l'Author fornisce
  definizioni dichiarative e un Dialogue Provider; orchestration, policy,
  commit atomico e lifecycle restano dietro la seam di Fondale.
- Prima del codice, questa spec deve essere approvata e successivamente
  scomposta in issue verticali sotto `.scratch/knowledge-driven-dialogue/issues/`.
