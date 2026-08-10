# 13 — HUD Theme “A — Moderno trasparente”

**What to build:** promuovere il verdetto visuale del prototipo in un HUD Theme
dichiarativo di produzione, con identità originale di Capri e leggibilità alla
Logical Resolution reale.

**Blocked by:** 07 — Passage leggibili e Tab reveal; 08 — Speech sopra i Character; 09 — Choice nel HUD inferiore; 11 — Options, Help e Player Preferences.

**Status:** ready-for-human

- [x] Il Game Project configura palette, font locale, backing, opacità, bordi, stati dei Verb, Inventory wells, cursori e colori speaker senza accesso a DOM, CSS o PixiJS.
- [x] Capri usa piano blu notte trasparente, testo sabbia, Preferred Verb oro-corallo, selezione turchese e wells scuri leggeri.
- [x] Un font pixel originale, bundled e distinto dagli asset dei giochi di riferimento supporta tutto il testo italiano ed è leggibile a 426×240.
- [x] Font, cursori e altri asset finali possiedono Art Master separati dai Runtime Asset caricati dal Game Project.
- [x] Tema incompleto, font non caricabile o asset incompatibile impediscono un mount parziale e producono Authoring Diagnostic contestuali.
- [x] A 1280×720 e 900×700 il frame mantiene proporzioni, ordine, hit area e safe region senza deformazioni.
- [x] I test automatici usano geometria e stati osservabili; una revisione screenshot documenta l'esito senza snapshot pixel-perfect come gate.

## Comments

### 9 agosto 2026 — verdetto visuale superato

La ricerca comparativa in `docs/research/classic-adventure-ui-comparison.md` ha distinto il pannello dedicato di *Monkey Island 2*, l'overlay trasparente di *Thimbleweed Park* e le interfacce contestuali. Dopo il prototipo A/B/C del commit `e962ab4`, è stata selezionata la variante **C — UI contestuale**.

Questo ticket conserva la decisione e l'implementazione storiche di Fondale 1.1, ma il suo verdetto “A — Moderno trasparente” è superato per la prossima iterazione. La produzione non viene modificata finché non sono definiti separatamente apertura e chiusura dell'Inventory e presentazione dei Verb contestuali.

### 9 agosto 2026 — accesso all'Inventory confermato

L'Inventory contestuale si apre e si richiude con il click destro. `I` è l'alternativa da tastiera; `Escape` e il click esterno lo chiudono. Non esiste un pulsante Inventory sempre visibile. Il primo Object raccolto produce un feedback transitorio e un suggerimento una tantum sul click destro. Il click sinistro cammina o esegue l'azione contestuale principale; una pressione prolungata apre il verb coin per scegliere un'alternativa.

Questa scelta supera l'uso del click destro per il Preferred Verb. Il contenuto e la presentazione esatta del verb coin restano da decidere separatamente prima di riscrivere il contratto di produzione.

### 9 agosto 2026 — prototipo focalizzato sul verb coin

Il prototipo avviabile con `npm run prototype:capri-verb-coin` e l'URL `http://localhost:5174/?focus=verb-coin&variant=A` confronta tre politiche sullo stesso Noun e sullo stesso Object selezionato:

- A mostra soltanto Preferred Verb e Command Case pertinenti;
- B mostra le azioni pertinenti e permette di espandere volontariamente tutte le nove;
- C mostra sempre le nove azioni, attenuando quelle che produrranno soltanto un fallback.

Il prototipo espone Preferred Verb, casi contestuali, azioni visibili e fallback nello state inspector. Nessuna variante è ancora approvata.

### 10 agosto 2026 — prova Return-style

La variante B del verb coin è stata scartata perché mantiene troppo evidente la
scelta dei Verb. Il prototipo avviabile con
`npm run prototype:capri-return-style` e l'URL
`http://localhost:5174/?focus=return-style` prova invece un'interazione ispirata
a *Return to Monkey Island*: la scena resta libera a riposo, mentre l'hover su
un Noun mostra soltanto azione primaria e secondaria. Il click sinistro esegue
l'azione primaria, il click destro quella secondaria e `I` apre l'Inventory
sopra la scena. Selezionare un Object rende contestuale l'azione primaria;
`Escape` chiude l'Inventory o deseleziona l'Object.

La prova è isolata nel mode `prototype` e non cambia il runtime di produzione.
Sostituisce nel prototipo l'ipotesi precedente del click destro per aprire
l'Inventory, ma non costituisce ancora un nuovo verdetto di produzione.
Il selettore dell'inspector ripete la stessa interazione su Porto, Aiano e
Boffe, con Noun e azioni propri di ciascuna scena.
