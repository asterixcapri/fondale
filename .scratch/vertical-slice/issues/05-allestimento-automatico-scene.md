# 05 — Allestimento automatico delle scene

Type: prototype
Status: open
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
