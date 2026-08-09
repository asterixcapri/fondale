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
