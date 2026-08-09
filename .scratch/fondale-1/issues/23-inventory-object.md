# 23 — Raccogliere e usare un Object tramite l'Inventory

**What to build:** Il Player raccoglie un Object con una Primary Action, lo
vede e seleziona nell'Inventory, prova un bersaglio invalido conservando la
selezione e completa un Inventory Use valido che cambia il mondo e ricolloca o
consuma l'Object.

**Blocked by:** 21 — Risolvere una Primary Action a un Approach Point.

**Status:** ready-for-human

- [x] Ogni Object parte in una Scene e occupa sempre una sola collocazione
      canonica: Scene, Inventory o consumo terminale.
- [x] Un Object presente viene reso e può attivare Hotspot soltanto nella Scene
      che lo contiene; la presenza non viene duplicata in una Game Variable.
- [x] La raccolta è una Primary Action percepibile che sposta contestualmente
      l'Object bersaglio in fondo all'Inventory senza selezionarlo.
- [x] Il HUD posseduto dall'Engine elenca gli Object in ordine di acquisizione,
      mostra l'unica selezione e usa l'Inventory Appearance come cursore sul
      mondo.
- [x] Il Game Project dichiara una Inventory Appearance Size quadrata; tutti i
      relativi PNG coincidono esattamente e l'Example `426×240` usa `32×32`.
- [x] Attivare un Object lo seleziona, attivarne un altro sostituisce la
      selezione e riattivarlo o premere `Escape` lo deseleziona.
- [x] La selezione appartiene al Game State, attraversa i cambi di Scene e non
      viene persa per uso fallito, bersaglio irraggiungibile o click generico.
- [x] Cambiare selezione durante un Player Intent termina quell'intento; perdere
      l'Object dall'Inventory elimina sempre la selezione.
- [x] Con una selezione il bersaglio risolve l'Inventory Use per quell'identità;
      un uso non riconosciuto raggiunge un fallback percepibile.
- [x] Un fallimento conserva Object e selezione; un successo termina la
      selezione e può cambiare Game Variable e Appearance, ricollocare l'Object
      nella Scene o consumarlo terminalmente.
- [x] Un fallimento che tenta di collocare o consumare l'Object viene rifiutato
      atomicamente invece di essere corretto in silenzio.
- [x] Mouse, stato committed e risultato visivo verificano raccolta, ordine,
      selezione, fallback, successo, ricollocazione e consumo attraverso le
      seam approvate.
- [x] Object, Inventory, Inventory Appearance e operazioni contestuali sono
      documentati con una ricetta verificata.

