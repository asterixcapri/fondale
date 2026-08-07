# 05 — Allestimento automatico delle scene

Type: prototype
Status: resolved
Blocked by: 03

## Question

*(Sostituisce il precedente "editor web di allestimento": l'umano non allestisce le scene, quindi non serve uno strumento per lui. Serve che l'agente sappia farlo da solo.)*

Dato un fondale, ricavare senza intervento umano: il poligono dell'area camminabile, le maschere di foreground (cosa passa davanti al personaggio), le aree degli hotspot e i punti di uscita.

Strade da provare:

- **lettura diretta dell'immagine da parte dell'agente**, che identifica il piano di calpestio e gli elementi occludenti e ne scrive le coordinate;
- **segmentazione programmatica** — analisi di colore e texture per separare il selciato dalle pareti;
- combinazione delle due: l'agente propone, il codice raffina sui contorni reali.

Il pezzo indispensabile è il **controllo per sovrapposizione**: rendere il poligono semitrasparente sopra il fondale, salvare l'immagine e guardarla. È così che l'agente vede se ha sbagliato, ed è ciò che rende il ciclo autonomo.

Risolto quando il vicolo di Capri è allestito interamente senza mani umane, e la sovrapposizione mostra un'area camminabile che segue davvero il selciato.

## Answer

Status: resolved

Metodo che ha funzionato, tra i tre proposti: **lettura diretta dell'immagine da parte dell'agente**. Non segmentazione programmatica.

Procedimento: si traccia una griglia di coordinate sopra il fondale, l'agente la guarda e legge i vertici; per le zone piccole si ingrandisce un ritaglio con griglia fine. I numeri finiscono nel modulo della stanza.

Il pezzo che rende il ciclo autonomo è il **controllo per sovrapposizione**: `src/engine/debug-overlay.ts` ridisegna area camminabile, maschere, hotspot e uscite sopra il dipinto, partendo **dagli stessi oggetti che il gioco usa** — non da una copia, quindi non può divergere da ciò che gira davvero. Si apre con `?debug` ed è catturato dal banco di verifica.

**Ed è servito subito.** Al primo passaggio due aree su quattro erano sbagliate: la maschera della giara cadeva su pietre vuote e l'hotspot della porta era finito sul muro accanto. Senza guardare la sovrapposizione sarebbero entrambe passate per buone. Corrette rileggendo le coordinate su ritagli ingranditi, poi riverificate.

**Costo misurato per una scena:** tre iterazioni di correzione, nell'ordine dei minuti. È uno dei numeri che il vertical slice doveva produrre.
