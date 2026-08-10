# 13 — Mostrare l'approdo della barca dalla torre

**What to build:** fare attraversare al Player il portone della torre, avviare immediatamente nella nuova Scene una Sequence che dirige Camera, Animation e Motion della barca, e restituire infine il controllo con l'approdo registrato nel Game State.

**Blocked by:** 06 — Muovere Object e Scenery durante una Sequence; 09 — Applicare uno Skip Outcome alle Sequence dirette; 10 — Avviare una Sequence all'arrivo in una Scene; 11 — Dirigere la Camera durante una Sequence.

**Status:** ready-for-human

- [x] Michele raggiunge liberamente il portone della torre e lo attraversa tramite un normale Scene Passage.
- [x] La transizione colloca Michele nella Scene Entrance prevista prima di avviare `boat-arrival`.
- [x] La condizione `boatLanded` impedisce l'avvio quando l'approdo è già avvenuto.
- [x] La Sequence prende la regia prima che il Player possa impartire un Command nella nuova Scene.
- [x] La Camera dirige l'attenzione verso il mare usando l'inquadratura dichiarata e resta entro la stessa Scene.
- [x] La barca è una Scenery locale che combina una Animation di oscillazione con il Motion dall'orizzonte alla posizione di riposo sulla spiaggia.
- [x] Le Game Operation finali selezionano l'Appearance approdata e registrano `boatLanded` senza salvare una coordinata arbitraria della Scenery.
- [x] Al termine, la Camera torna a seguire Michele e il Player recupera il normale controllo.
- [x] Save, restore e skip durante l'approdo producono lo stesso risultato permanente coerente.
- [x] Rientrare nella Scene o ripristinare una partita dopo l'approdo mostra direttamente la barca approdata senza riprodurre la Sequence.
- [x] Un test browser attraversa il portone con input reale e verifica l'intero flusso percepibile senza Sequence multi-Scene o trigger spaziali.
