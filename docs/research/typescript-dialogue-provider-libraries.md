# Librerie TypeScript per il Knowledge-Driven Dialogue Provider

Data della ricerca: 12 agosto 2026
Domanda: quale libreria server-side dovrebbe usare un autore per implementare il Dialogue Provider di Fondale, mantenendo conversazioni persistenti fuori dal Game State?

## Risultato in breve

Decisione di spike aggiornata il 12 agosto 2026: il primo prototipo resta
interamente locale e usa **Mastra con `@mastra/pg` e PostgreSQL locale** dietro
il contratto `DialogueProvider`. Hosting e database cloud sono esplicitamente
fuori scope; Mastra rimane una scelta da validare, non una dipendenza pubblica
o un ADR definitivo di Fondale.

Lo spike usa **OpenRouter** tramite l'integrazione documentata
`@openrouter/ai-sdk-provider`: `createOpenRouter()` produce direttamente il
modello accettato da un Agent Mastra
([guida Mastra di OpenRouter](https://openrouter.ai/docs/guides/community/mastra)).
La fase di interpretazione deve fissare un modello che dichiari supporto a
`structured_outputs`; OpenRouter espone il parametro per modelli compatibili e
permette di richiederlo nel routing
([Structured Outputs](https://openrouter.ai/docs/guides/features/structured-outputs)).

Il modello iniziale scelto per lo spike è
`deepseek/deepseek-v4-flash-0731`. Il suo identificatore resta configurazione
server-side, così un confronto successivo non cambia il contratto Fondale.
L'API pubblica dei modelli OpenRouter dichiara per questa versione sia
`response_format` sia `structured_outputs`. La versione è fissata invece di
usare un alias mobile, in modo che i risultati dello spike siano riproducibili.

Mastra è il miglior fit attuale perché combina nello stesso framework TypeScript:

- routing fra provider e modelli;
- memoria conversazionale per thread;
- storage persistente sostituibile;
- gestione del contesto lungo tramite Observational Memory o processor a budget;
- output strutturati, tool e cancellazione con `AbortSignal`;
- eliminazione esplicita dei thread quando viene caricato un salvataggio.

Non è però una decisione da incorporare nel contratto pubblico del motore.
Fondale dovrebbe pubblicare Knowledge-Driven Dialogue e la relativa interface
`DialogueProvider`; l'Author dovrebbe fornire l'adapter. Mastra sarebbe il primo
adapter di riferimento, non una dipendenza concettuale del Game State né il
proprietario delle regole narrative.

La graduatoria rispetto ai requisiti attuali è:

1. **Mastra** — miglior equilibrio fra memoria già gestita, neutralità rispetto ai provider e semplicità di integrazione.
2. **LangChain + LangGraph JS** — soluzione più controllabile e meglio attrezzata per i test, ma più complessa del necessario per l'MVP.
3. **OpenAI Agents SDK for TypeScript** — API pulita e memoria a sessioni, ma provider alternativi e compattazione non sono neutrali quanto il nome dell'astrazione suggerisce.
4. **Vercel AI SDK da solo** — ottimo livello basso per modelli, tool e test; non soddisfa da solo il requisito che la libreria gestisca persistenza e contesto della conversazione.

Se lo spike Mastra fallisse, la scelta successiva dipenderebbe dal motivo: **LangGraph** se serve maggiore controllo indipendente dal provider; **OpenAI Agents SDK** se il progetto accetta di ottimizzare l'integrazione per OpenAI.

## Vincoli usati per il confronto

La libreria non deve cambiare le decisioni già prese sul dominio:

- Knowledge-Driven Dialogue è una capability pubblica e il Dialogue Provider è
  la sua interface di integrazione implementata dall'Author;
- il Game State contiene fatti canonici e progressione, non il transcript delle chat;
- la libreria o il servizio del provider possiede cronologia, storage, riassunti e gestione della context window;
- il caricamento di un salvataggio azzera le conversazioni attive;
- l'LLM può interpretare l'input e verbalizzare una decisione autorizzata dall'Engine, ma non può applicare direttamente Game Operations;
- i test del motore devono poter usare un sostituto deterministico senza rete e senza un modello reale.

Questa ricerca distingue tre livelli:

- **nativo**: funzione esposta direttamente dalla libreria principale;
- **adapter/add-on**: funzione ufficiale, ma in un pacchetto o servizio separato;
- **custom**: codice che dovrebbe scrivere Fondale o l'autore.

## Matrice comparativa

| Criterio | Mastra | LangChain + LangGraph JS | OpenAI Agents SDK | Vercel AI SDK |
|---|---|---|---|---|
| Modelli diversi | **Nativo:** model router; supporta anche modelli AI SDK | **Adapter ufficiali:** interfaccia comune e pacchetti per provider | **Parziale:** `ModelProvider` custom; adapter AI SDK ufficiale ma beta | **Nativo + adapter ufficiali:** interfaccia unificata e registry |
| Storia multi-turn | **Nativa:** Memory per resource/thread | **Nativa:** stato del thread tramite checkpointer | **Nativa:** interfaccia `Session` | **Custom:** la guida fa implementare load/save all'applicazione |
| Storage durevole | **Add-on ufficiali:** LibSQL, PostgreSQL, MongoDB e altri | **Add-on ufficiali:** checkpointer PostgreSQL, Redis, MongoDB e altri | **OpenAI-hosted oppure custom:** per Redis/SQLite/DynamoDB va implementata `Session` | **Custom:** database e schema sono responsabilità dell'app |
| Contesto lungo | **Nativo:** Observational Memory; processor come TokenLimiter | **Nativo/configurabile:** summarization middleware, trimming e stato del grafo | **Nativo solo su OpenAI:** Responses compaction; altrimenti filtro custom | **Primitiva nativa:** pruning; riassunto/memoria durevole esterni o custom |
| Output strutturato e tool | **Nativo** | **Nativo** | **Nativo** | **Nativo** |
| Cancellazione | **Nativa:** `AbortSignal` | **Nativa:** `RunnableConfig.signal` | **Nativa:** `signal` nel runner | **Nativa:** `AbortSignal` e timeout |
| Reset su Load | **Nativo nell'adapter:** `memory.deleteThread()` | **Nativo nell'adapter:** `deleteThread()` del checkpointer | **Nativo:** `clearSession()` | **Custom:** cancellare o invalidare i record applicativi |
| Test deterministici | **Adapter:** mock di AI SDK; nessun fake Mastra altrettanto esplicito | **Nativo:** `fakeModel()` e checkpointer in memoria | **Custom ma semplice:** implementazione di `Model`; `MemorySession` | **Nativo:** `MockLanguageModelV3` e mock stream |
| Licenza | Apache-2.0 per core; cartelle `ee/` separate | MIT | MIT | Apache-2.0 |
| Rischio principale | Framework ampio e in rapida evoluzione | Sovra-ingegnerizzazione per l'MVP | Funzioni migliori legate a OpenAI; pacchetto ancora `0.x` | Dovremmo costruire proprio il sottosistema che vogliamo delegare |

## 1. Mastra — raccomandato per lo spike

### Perché aderisce bene

Mastra è un framework TypeScript server-side in cui agenti, memoria, storage e model routing sono parti coordinate. La documentazione degli agenti usa identificatori `provider/model` e presenta memoria, tool e output strutturati come capability del framework, non come stato da passare ogni volta dall'applicazione ([Agents overview](https://mastra.ai/docs/agents/overview)).

La sua Memory conserva messaggi, risposte e risultati dei tool, e li separa tramite `resource` e `thread`. Uno storage è richiesto per la persistenza oltre il processo; quello in memoria è adatto soltanto a sviluppo e test ([Memory overview](https://mastra.ai/docs/memory/overview), [Storage overview](https://mastra.ai/docs/storage/overview)). Per Fondale questo confine è corretto: il Game State conserva solo dati narrativi, mentre il server assegna un thread alla conversazione attiva con ogni Character.

Per conversazioni lunghe Mastra offre due livelli distinti:

- i memory processor, come TokenLimiter, limitano ciò che entra nella context window;
- Observational Memory sostituisce progressivamente la storia grezza inviata al modello con osservazioni e riflessioni dense, lasciando comunque i messaggi originali nello storage ([Observational Memory](https://mastra.ai/docs/memory/observational-memory)).

Questa seconda funzione è la più vicina al comportamento richiesto: la conversazione può restare lunga nello storage senza essere reinviata integralmente a ogni turno. È nativa, ma usa a sua volta chiamate a modelli e va quindi valutata per costo, latenza e fedeltà narrativa.

`Agent.generate()` accetta sia `abortSignal` sia uno schema `structuredOutput`; tool call e risultati sono esposti separatamente ([riferimento `Agent.generate()`](https://mastra.ai/reference/agents/generate)). L'eliminazione di un thread è disponibile attraverso `memory.deleteThread()` e comprende la pulizia degli embedding associati ([changelog ufficiale](https://mastra.ai/blog/changelog-2026-03-05)).

### Cosa non va dato per scontato

- Lo storage durevole richiede un adapter, per esempio `@mastra/libsql`; non è incluso magicamente nel processo.
- Observational Memory riassume per mezzo di modelli. Non rende deterministica la memoria e non sostituisce i fatti canonici dell'Engine.
- Mastra non documenta un proprio test double equivalente a `fakeModel()` di LangChain. Può ricevere modelli compatibili con AI SDK, quindi il suo mock è riutilizzabile, ma questa integrazione va provata.
- Il repository è principalmente Apache-2.0, mentre il contenuto sotto `ee/` usa una licenza enterprise separata ([licenza Mastra](https://github.com/mastra-ai/mastra/blob/main/LICENSE.md)). Lo spike deve dipendere solo dai pacchetti open-source necessari.
- Le API stanno evolvendo rapidamente. La versione corrente è `1.x`, ma la stabilità reale dell'insieme core + memory + storage va verificata con un lockfile, non inferita dal numero maggiore.

### Fit con le due fasi del dialogo

Mastra permette di implementare le due responsabilità logiche senza dare all'agente autorità sul gioco:

1. l'interprete legge input e contesto e restituisce uno schema validato;
2. l'Engine decide Response Strategy e Game Operations;
3. il verbalizzatore riceve soltanto dati autorizzati e produce la battuta.

Lo spike deve verificare un dettaglio importante: nella memoria conversazionale devono finire soltanto il messaggio del giocatore e la risposta visibile, non l'output tecnico dell'interprete. Mastra offre context messages non persistiti per dati validi per una singola chiamata ([Memory overview](https://mastra.ai/docs/memory/overview#what-the-model-sees)), ma il modo più pulito di condividere la storia con una fase di interpretazione non scrivente va dimostrato con codice prima di fissare l'adapter.

## 2. LangChain + LangGraph JS — il fallback più controllabile

LangChain standardizza le interfacce dei modelli e delega le integrazioni a pacchetti per provider ([Providers and models](https://docs.langchain.com/oss/javascript/concepts/providers-and-models)). LangGraph aggiunge persistenza a checkpoint: ogni thread ha una sequenza di stati, mentre storage durevoli come PostgreSQL, Redis e MongoDB sono pacchetti separati ([Persistence](https://docs.langchain.com/oss/javascript/langgraph/persistence)).

La gestione del contesto è più esplicita che in Mastra. È disponibile un `summarizationMiddleware` con soglie in token, messaggi o frazione della context window e una quantità configurabile di storia recente da conservare ([prebuilt middleware](https://docs.langchain.com/oss/javascript/langchain/middleware/built-in#summarization)). La memoria documenta anche la cancellazione del thread, utile per implementare il reset su Load ([Add memory](https://docs.langchain.com/oss/javascript/langgraph/add-memory)).

È la soluzione migliore sul piano dei test: `fakeModel()` può programmare testo, tool call, errori e output strutturati, e registra gli input ricevuti; i checkpointer in memoria completano il test senza rete ([Unit testing](https://docs.langchain.com/oss/javascript/langchain/test/unit-testing)). Output strutturati e tool sono capability native dell'agente ([Structured output](https://docs.langchain.com/oss/javascript/langchain/structured-output)); la cancellazione passa attraverso `RunnableConfig.signal` ([riferimento](https://reference.langchain.com/javascript/langchain-core/runnables/RunnableConfig)). Il codice è MIT ([repository LangChain JS](https://github.com/langchain-ai/langchainjs)).

Il costo è architetturale: checkpoint, reducer dello stato, nodi e middleware forniscono più controllo di quanto richieda oggi un dialogo Character-player. Se adottato senza un bisogno reale, il Dialogue Provider rischierebbe di diventare un grafo applicativo complesso prima che il gameplay sia validato. È però il fallback più solido se lo spike mostra che Mastra non permette di controllare esattamente quali messaggi vengono persistiti fra interpretazione e verbalizzazione.

## 3. OpenAI Agents SDK for TypeScript — semplice, ma OpenAI-leaning

L'SDK è scritto in TypeScript, usa agenti, tool Zod, output strutturati e un runner cancellabile con `AbortSignal` ([Agents](https://openai.github.io/openai-agents-js/guides/agents/), [Running agents](https://openai.github.io/openai-agents-js/guides/running-agents/)).

La sua astrazione `Session` è pulita: il runner recupera la storia prima del turno e salva i nuovi elementi dopo il turno. Sono disponibili una `MemorySession` in-process e una `OpenAIConversationsSession`; per Redis, DynamoDB, SQLite o un altro database si implementano cinque metodi asincroni della propria Session. `clearSession()` corrisponde direttamente al reset richiesto su Load ([Sessions](https://openai.github.io/openai-agents-js/guides/sessions/)).

L'SDK espone `Model` e `ModelProvider`, quindi non è tecnicamente limitato ai modelli OpenAI. Tuttavia:

- il provider predefinito è OpenAI;
- l'integrazione ufficiale con Vercel AI SDK per modelli non OpenAI è ancora marcata beta ([AI SDK integration](https://openai.github.io/openai-agents-js/extensions/ai-sdk/));
- la sessione di compattazione pronta all'uso invoca l'endpoint OpenAI Responses `responses.compact`; con altri provider trimming o summarization diventano responsabilità dell'implementazione ([Sessions](https://openai.github.io/openai-agents-js/guides/sessions/#openai-responses-api-compaction-sessions)).

Un `Model` finto è facile da scrivere e la `MemorySession` è utile nei test, ma non esiste un helper di mocking dedicato equivalente a quelli di AI SDK e LangChain. Il repository è MIT e dichiara esplicitamente supporto JavaScript/TypeScript e interfacce provider-agnostic ([repository ufficiale](https://github.com/openai/openai-agents-js)), ma il pacchetto corrente è ancora `0.x`. È un'alternativa valida se Fondale sceglie deliberatamente OpenAI come percorso privilegiato, non la prima scelta per un adapter di riferimento neutrale.

## 4. Vercel AI SDK — ottimo componente, incompleto come soluzione

AI SDK è il più convincente dei quattro come strato basso. Offre un'interfaccia comune per provider differenti, registry, output strutturati, tool loop, timeout e `AbortSignal` ([repository ufficiale](https://github.com/vercel/ai), [Providers and models](https://ai-sdk.dev/docs/foundations/providers-and-models), [Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)). Ha inoltre i test double meglio documentati dopo LangChain: `MockLanguageModelV3`, mock provider e generatori di stream consentono test ripetibili senza rete ([Testing](https://ai-sdk.dev/docs/ai-sdk-core/testing)). La licenza è Apache-2.0 ([licenza](https://github.com/vercel/ai/blob/main/LICENSE)).

Non è però il gestore di conversazione richiesto. La guida ufficiale sulla persistenza mostra esplicitamente come l'applicazione debba implementare creazione, caricamento e salvataggio dei messaggi, usando un file solo come esempio e raccomandando un database reale in produzione ([Chatbot message persistence](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence)). La pagina sulla memoria degli agenti rimanda a tool definiti dal provider, servizi di memoria esterni o tool custom ([Agent memory](https://ai-sdk.dev/docs/agents/memory)). Il pruning dei messaggi è disponibile, ma non equivale a una politica completa di riassunto e memoria durevole ([`pruneMessages`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/prune-messages)).

Scegliere AI SDK da solo significherebbe scrivere proprio il sottosistema che si è deciso di non mettere nel Game State e di delegare a una libreria. Resta invece utile sotto Mastra, oppure per un futuro adapter minimale destinato ad autori che preferiscono gestire esplicitamente il proprio storage.

## Interfaccia Fondale raccomandata

La scelta della libreria non dovrebbe comparire nel contratto del motore. Il confine può restare concettualmente simile a questo:

```ts
interface DialogueProvider {
  interpret(request: InterpretDialogueRequest): Promise<DialogueInterpretation>
  verbalize(request: VerbalizeDialogueRequest): Promise<DialogueResponse>
  resetConversations(): Promise<void>
}
```

I request dovrebbero accettare un `AbortSignal` oppure un piccolo execution context che lo contiene. L'interfaccia reale potrà cambiare durante l'implementazione; il punto stabile è la separazione delle responsabilità:

- Fondale passa soltanto Character data, knowledge rilevante, stato autorizzato e identificatori opachi;
- il provider conserva transcript, thread e riassunti nel proprio storage;
- l'Engine valida l'interpretazione e applica eventuali Game Operations;
- il provider verbalizza soltanto la decisione già autorizzata;
- su Load, Fondale invoca `resetConversations()`; l'adapter elimina i thread o cambia namespace e applica la propria retention policy;
- nessun identificatore di thread o transcript diventa parte canonica del Game State.

I test unitari di Fondale non devono avviare Mastra, LangGraph o un modello. Devono usare un `FakeDialogueProvider` controllato dal test. I mock delle librerie servono invece ai test di integrazione dell'adapter.

## Spike raccomandato

Prima di aggiungere una dipendenza al motore, conviene costruire un adapter
locale di prova Mastra + PostgreSQL con criteri di accettazione limitati:

1. due conversazioni con Character diversi non condividono la storia;
2. una conversazione lunga continua a risultare naturale dopo la compattazione;
3. la fase strutturata non viene salvata come battuta visibile nella memoria;
4. l'Engine può autorizzare o rifiutare Game Operations prima della verbalizzazione;
5. un abort interrompe la richiesta senza lasciare un turno incompleto riutilizzato al messaggio successivo;
6. Load azzera tutti i thread attivi senza modificare il Game State caricato;
7. un test deterministico usa un fake model e verifica esattamente contesto e schema ricevuti;
8. il modello OpenRouter può essere sostituito cambiando solo la configurazione server-side.

Se questi otto punti passano, Mastra è una scelta adeguata per il primo adapter. Se falliscono i punti 3 o 5 per mancanza di controllo sulla persistenza, il confronto va riaperto partendo da LangGraph, non compensato aggiungendo transcript o logica conversazionale al Game State.

## Versioni e maturità osservate

Snapshot npm verificato il 12 agosto 2026:

| Pacchetto | Versione | Runtime dichiarato | Licenza del pacchetto |
|---|---:|---|---|
| [`ai`](https://www.npmjs.com/package/ai) | 7.0.62 | Node.js >= 22 | Apache-2.0 |
| [`langchain`](https://www.npmjs.com/package/langchain) | 1.5.5 | Node.js >= 20 | MIT |
| [`@langchain/langgraph`](https://www.npmjs.com/package/@langchain/langgraph) | 1.4.9 | Node.js >= 18 | MIT |
| [`@mastra/core`](https://www.npmjs.com/package/@mastra/core) | 1.58.0 | Node.js >= 22.13.0 | Apache-2.0 |
| [`@mastra/memory`](https://www.npmjs.com/package/@mastra/memory) | 1.26.1 | Node.js >= 22.13.0 | Apache-2.0 |
| [`@openai/agents`](https://www.npmjs.com/package/@openai/agents) | 0.15.0 | Node.js >= 22 nel repository ufficiale | MIT |

I numeri di versione non sono un confronto diretto di qualità. AI SDK e LangChain/LangGraph hanno superfici mature e test double ufficiali; Mastra ha raggiunto `1.x` ma cambia rapidamente; OpenAI Agents SDK è il più giovane dei candidati. Per questo la raccomandazione è uno spike isolato dietro l'interfaccia Fondale, non l'esposizione immediata di una libreria nel public API.

## Metodo e fonti

Sono state consultate esclusivamente fonti primarie: documentazione ufficiale, repository ufficiali, licenze e metadati dei pacchetti pubblicati. I fatti relativi a funzioni native, adapter e codice custom sono stati verificati sulle versioni disponibili alla data della ricerca. Le valutazioni di fit e il ranking sono inferenze progettuali applicate ai vincoli di Fondale.
