# Fatti di piattaforma per Fondale 1.0

> Nota di scope: i fatti sull'audio sono conservati come ricerca per un effort
> futuro, ma non condizionano Fondale 1.0, che non dichiara, carica o riproduce
> audio.

Ricerca svolta l'8 agosto 2026. Le osservazioni su PixiJS si riferiscono alla
linea 8.x e, dove conta il comportamento esatto, al sorgente versionato
`v8.19.0`. Le fonti sono esclusivamente documentazione, specifiche e sorgenti
ufficiali.

## Risultato in breve

La piattaforma non impedisce il prodotto concordato, ma impone cinque confini
al contratto di Fondale 1.0:

1. l'avvio del renderer e il caricamento degli asset sono operazioni asincrone;
2. WebGL è la base produttiva più prudente, mentre WebGPU non è ancora una base
   interoperabile e il fallback Canvas 2D di PixiJS è ancora sperimentale;
3. l'audio udibile non può essere dato per avviato prima di un gesto dell'utente;
4. URL, origine, CORS e ciclo di vita degli asset fanno parte del comportamento
   osservabile di un gioco distribuito;
5. `@asterixcapri/fondale` richiede un omonimo scope npm e un pacchetto con
   entry point e dichiarazioni pubbliche espliciti.

Questi sono vincoli e capacità della piattaforma. Non decidono da soli il
contratto pubblico: indicano le scelte che i ticket di Wayfinder devono rendere
esplicite.

## Rendering 2D

### Fatti

- PixiJS è un renderer 2D con scene graph; `Application` viene costruita e poi
  inizializzata con `await app.init(...)`. La preferenza documentata è WebGL.
  La guida indica WebGL/WebGL2 come renderer stabile e raccomandato per la
  produzione e WebGPU come ancora soggetto a incoerenze fra browser
  ([Application](https://pixijs.com/8.x/guides/components/application),
  [Renderers](https://pixijs.com/8.x/guides/components/renderers)).
- WebGPU ha disponibilità limitata, non è Baseline e richiede un contesto
  sicuro nei browser che lo implementano. Non può quindi essere l'unica base
  di una promessa rivolta a Chrome, Firefox, Safari ed Edge correnti
  ([MDN: WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)).
- Dalla versione 8.16 PixiJS possiede anche un Canvas renderer, annunciato
  esplicitamente come sperimentale. Nel sorgente 8.19.0
  `autoDetectRenderer()` prova per impostazione predefinita WebGL, poi WebGPU,
  poi Canvas; una lista `preference` può restringere i renderer ammessi
  ([release 8.16](https://github.com/pixijs/pixijs/releases/tag/v8.16.0),
  [sorgente 8.19.0](https://github.com/pixijs/pixijs/blob/v8.19.0/src/rendering/renderers/autoDetectRenderer.ts)).
  La guida `Renderers` lo indica ancora come “coming soon”: per il contratto
  vanno dunque preferiti release e sorgente versionati alla pagina non
  allineata.
- WebGL è disponibile nei browser moderni, ma la disponibilità effettiva
  dipende anche da hardware e driver. Limiti quali dimensione massima delle
  texture e drawing buffer sono specifici dell'implementazione; la specifica
  permette inoltre la perdita e il ripristino del contesto, dopo il quale le
  vecchie risorse GPU non sono più valide
  ([MDN: WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API),
  [specifica WebGL 1.0](https://registry.khronos.org/webgl/specs/latest/1.0/),
  [best practice WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)).
- La risoluzione del drawing buffer non coincide necessariamente con lo spazio
  occupato in CSS e i vincoli della piattaforma possono ridurre il buffer
  richiesto. PixiJS espone separatamente `width`, `height`, `resolution`,
  `autoDensity` e `resizeTo`
  ([specifica WebGL 1.0](https://registry.khronos.org/webgl/specs/latest/1.0/),
  [opzioni Application](https://pixijs.com/8.x/guides/components/application)).

### Decisioni che restano a Fondale

- Se 1.0 garantisca solo WebGL, oppure un sottoinsieme verificato anche sul
  Canvas renderer sperimentale. La semplice presenza del fallback non dimostra
  parità funzionale.
- Quale errore leggibile mostrare quando nessun renderer promesso è disponibile
  e quale comportamento promettere durante una perdita di contesto.
- Come separare coordinate logiche della stanza, dimensione CSS e risoluzione
  fisica; quali limiti agli asset controllare in validazione e quali rilevare
  soltanto a runtime.
- PixiJS può restare l'adapter interno: nessun fatto tecnico obbliga a esporne
  scene graph, renderer o tipi nell'API di authoring.

## Audio e autoplay

### Fatti

- PixiJS core non fornisce il sistema di riproduzione audio del gioco. Il suo
  ecosistema presenta `@pixi/sound` come libreria separata basata su Web Audio;
  la linea 6.x della libreria dichiara compatibilità con PixiJS 8
  ([ecosistema PixiJS](https://pixijs.com/8.x/guides/getting-started/ecosystem),
  [documentazione PixiJS Sound](https://pixijs.io/sound/docs/index.html)).
- Le regole di autoplay si applicano sia a Web Audio sia alle chiamate
  programmatiche a `HTMLMediaElement.play()`. In generale un `AudioContext` va
  creato o ripreso durante un gesto dell'utente; `play()` restituisce una
  Promise che può essere rifiutata con `NotAllowedError`. L'interfaccia non può
  quindi assumere che la musica sia partita solo perché ne ha richiesto la
  riproduzione
  ([best practice Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices),
  [`HTMLMediaElement.play()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play)).
- `AudioContext.resume()` è asincrono. `decodeAudioData()` è anch'esso
  asincrono, lavora sull'intero file già acquisito e lo ricampiona alla
  frequenza del contesto; non decodifica frammenti in streaming
  ([`AudioContext.resume()`](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume),
  [`decodeAudioData()`](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData)).

### Decisioni che restano a Fondale

- L'adapter audio interno (`@pixi/sound`, Web Audio diretto o combinazione con
  elementi media) e la separazione fra effetti brevi decodificati e musica
  lunga eventualmente riprodotta in streaming.
- Il gesto che sblocca l'audio, lo stato pubblico “audio non ancora attivo” e
  la risposta a rifiuti, sospensione, mute e cambio di visibilità.
- Formati obbligatori e varianti ammesse. Il motore deve validare la propria
  baseline, non delegare all'autore l'ipotesi che un singolo file sia sempre
  decodificabile.

## Asset, URL e memoria

### Fatti

- `Assets` di PixiJS è Promise-based, riconosce i formati tramite estensioni,
  memorizza in cache per URL o alias e supporta manifest, bundle, caricamento in
  background, varianti e `basePath`. `Assets.unload()` rimuove una risorsa dalla
  cache; per texture grandi la documentazione raccomanda la distruzione o lo
  scaricamento esplicito dalla GPU
  ([Assets](https://pixijs.com/8.x/guides/components/assets),
  [Resolver](https://pixijs.com/8.x/guides/components/assets/resolver),
  [Textures](https://pixijs.com/8.x/guides/components/textures)).
- Un URL relativo usato da `fetch()` viene risolto rispetto al `baseURI` del
  documento. Richieste cross-origin, web font, texture WebGL e immagini
  disegnate su canvas sono soggette a CORS; senza gli header corretti un host
  differente non è intercambiabile con asset serviti dalla stessa origine
  ([`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch),
  [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS),
  [texture WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL)).
- Il caricamento riuscito è distinto dalla risposta HTTP: la Promise di
  `fetch()` si risolve già alla ricezione degli header anche per uno status HTTP
  di errore. Un loader deve controllare e riportare appropriatamente gli errori
  della risorsa
  ([Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)).

### Decisioni che restano a Fondale

- Una semantica unica per la radice degli asset che funzioni anche quando il
  gioco è pubblicato sotto un sottopercorso, e un override esplicito per CDN.
- La granularità dei bundle (per esempio bootstrap, stanza e audio), la
  schermata/stato di caricamento e il ciclo di vita con cui le stanze rilasciano
  memoria senza invalidare risorse condivise.
- Il formato canonico degli errori: asset mancante, URL non valido, CORS,
  decodifica e limite GPU devono diventare diagnosi dell'autore, non eccezioni
  grezze di PixiJS.

## Browser desktop

### Fatti

- “Browser moderno supportato” non garantisce da solo che WebGL sia attivo: la
  piattaforma dipende anche da GPU e driver. WebGPU non copre ancora tutti i
  browser della baseline concordata; Canvas 2D può essere una degradazione, ma
  in PixiJS 8 è ancora sperimentale. Sono tre profili di capacità distinti, non
  tre sinonimi.
- Le API fondamentali qui considerate — Promise, Fetch, WebGL, Web Audio e
  media element — sono disponibili nelle famiglie desktop concordate, ma
  policy di autoplay, formati media e limiti GPU rimangono runtime-dependent.
  Baseline è un riassunto di disponibilità, non sostituisce test di usabilità,
  accessibilità o prestazioni
  ([MDN: Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility),
  [MDN: WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API),
  [guida autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)).

### Decisioni che restano a Fondale

- La matrice deve nominare browser, renderer e comportamento, non soltanto
  browser: almeno avvio, caricamento stanza, input, audio dopo gesto,
  salvataggio e ripristino.
- Servono un controllo automatico continuo su Chromium e verifiche reali
  periodiche su Firefox, Safari ed Edge, come già scelto; la cadenza e i criteri
  di blocco restano da fissare nel ticket qualità.
- Una build statica non richiede un server applicativo in produzione, ma gli
  asset conservano semantica URL/origine. “Nessun server obbligatorio” non deve
  diventare una promessa implicita di funzionamento affidabile aperto con
  `file://`.

## Pacchetto npm e TypeScript

### Fatti

- Uno scope npm appartiene all'utente o organizzazione npm omonimi; l'account
  GitHub `asterixcapri` non assegna automaticamente `@asterixcapri`. Il package
  previsto richiede quindi un account o un'organizzazione npm con quel nome e
  permesso di pubblicazione. La prima pubblicazione di un package scoped
  pubblico usa `npm publish --access public` e richiede 2FA o un token granulare
  configurato per la pubblicazione
  ([scope npm](https://docs.npmjs.com/misc/scope/),
  [pubblicazione scoped](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)).
- `package.json#exports` definisce gli entry point importabili e impedisce ai
  consumer di importare subpath non dichiarati. È quindi il meccanismo di
  packaging adatto a rendere fisico il confine fra API pubblica e interni
  ([Node.js: package entry points](https://nodejs.org/api/packages.html#package-entry-points),
  [npm: `package.json`](https://docs.npmjs.com/cli/configuring-npm/package-json/#exports)).
- TypeScript può emettere `.d.ts` con `declaration`; un package tipizzato deve
  includere le dichiarazioni e indicare il file principale con `types`. Se le
  dichiarazioni pubbliche dipendono dai tipi di un altro package, quel package
  deve essere una dipendenza disponibile al consumer
  ([TypeScript: `declaration`](https://www.typescriptlang.org/tsconfig/declaration.html),
  [TypeScript: publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)).
- `files` restringe il contenuto pubblicato e `npm pack --dry-run` mostra il
  tarball prima della pubblicazione
  ([`npm publish`](https://docs.npmjs.com/cli/publish/)).

### Decisioni che restano a Fondale

- Se pubblicare soltanto ESM o anche CommonJS; se PixiJS sia dipendenza runtime,
  peer dependency oppure codice inglobato nella build. Queste decisioni vanno
  verificate installando il tarball in un repository esterno.
- Quali entry point siano pubblici. Se PixiJS deve restare interno, per
  conseguenza le `.d.ts` pubbliche non devono esporre tipi PixiJS: altrimenti il
  renderer diventa parte effettiva del contratto TypeScript.
- Separare l'SDK del motore dalla build del gioco: npm distribuisce codice e
  tipi del motore; fondali, sprite, audio e configurazioni appartengono al
  progetto consumer e alla sua build statica.

## Input per i prossimi ticket Wayfinder

- **Rendering (05):** scegliere renderer garantito, coordinate logiche,
  scaling e comportamento di capability/failure.
- **Asset e audio (11):** scegliere adapter audio, gesto di sblocco, bundle,
  root URL, formati e ciclo di vita.
- **Pacchetto esterno (12):** provare tarball, `exports`, `.d.ts`, dipendenza da
  PixiJS e pubblicazione sotto scope npm reale.
- **Qualità (14):** tradurre la baseline Chrome/Firefox/Safari/Edge in una
  matrice verificabile che includa renderer, autoplay e fallimenti di asset.
