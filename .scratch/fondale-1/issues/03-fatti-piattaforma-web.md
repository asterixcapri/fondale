# Verificare i vincoli della piattaforma web e di PixiJS

Type: research
Status: resolved

## Question

Quali capacità, limiti e requisiti correnti delle API web e di PixiJS 8
condizionano il contratto di Fondale 1.0 per rendering 2D, caricamento asset,
browser desktop e packaging npm? La ricerca deve usare soltanto
documentazione, specifiche e sorgenti primarie e distinguere i fatti dalle
decisioni che resteranno a Fondale.

## Answer

La ricerca è raccolta in
[Fatti di piattaforma per Fondale 1.0](../research/fatti-piattaforma-web-pixijs-8.md).
WebGL resta la baseline produttiva più prudente; WebGPU non è interoperabile su
tutta la matrice e il nuovo fallback Canvas di PixiJS 8 è sperimentale. Avvio e
asset sono asincroni e gli asset mantengono semantica URL/CORS. Il pacchetto
deve fissare entry point e `.d.ts` senza esporre PixiJS e lo scope npm
`@asterixcapri` richiede un'identità npm omonima.

## Scope amendment for Fondale 1.0

I fatti sull'audio restano nel documento di ricerca come materiale storico per
un effort futuro, ma non condizionano il contratto attivo: Fondale 1.0 non
dichiara, carica o riproduce audio.
