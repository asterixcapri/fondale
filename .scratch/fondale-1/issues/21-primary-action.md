# 21 — Risolvere una Primary Action a un Approach Point

**What to build:** Il Player seleziona un Hotspot, il Character raggiunge il
suo Approach Point, si orienta e risolve una Primary Action contro l'ultimo
Game State committed. Casi, condizioni, fallback e Game Operation producono
sempre una risposta percepibile e non possono lasciare cambiamenti parziali.

**Blocked by:** 20 — Comporre profondità, Perspective Scale e camminata.

**Status:** ready-for-human

- [x] Una Scene dichiara Hotspot locali per Background, Scenery e Character con
      una superficie nello Scene Space, un Approach Point e un orientamento.
- [x] Un Hotspot inattivo non riceve Player Intent e non viene pubblicizzato
      dal HUD.
- [x] Senza Object selezionato, il bersaglio offre una Primary Action con
      etichetta autoriale e casi condizionali considerati in ordine.
- [x] Il Character raggiunge l'Approach Point, applica l'orientamento e soltanto
      allora rivaluta Hotspot e Interaction Case sull'ultimo snapshot committed.
- [x] Se il bersaglio diventa inattivo o irraggiungibile, il Player Intent
      termina come esito normale senza eseguire l'Interaction.
- [x] Le condizioni minime esercitate dall'Example includono una Game Variable
      booleana e i compositori strettamente necessari allo scenario.
- [x] Un fallback obbligatorio garantisce una Interaction Response testuale o
      visiva percepibile; non esistono no-op silenziosi.
- [x] Un gruppo ordinato di Game Operation può cambiare la Game Variable e un
      Appearance in modo atomico; ogni operazione vede il risultato delle
      precedenti.
- [x] Un'operazione invalida scarta l'intero gruppo, non prova un altro caso e
      non pubblica uno snapshot parziale.
- [x] Playwright esercita avvicinamento e Primary Action con input reali, mentre
      i test del core verificano rivalutazione e atomicità.
- [x] Hotspot, Primary Action, condizioni, Interaction Response e Game
      Operation introdotte sono documentati con esempi verificati.

