# 12 — Animare l'inserimento della manovella nell'argano

**What to build:** trasformare l'uso della manovella sull'argano in una regia completa di Capri nella quale Michele agisce, l'argano reagisce al Cue corretto e il mondo conserva l'Appearance con la manovella inserita quando il Player recupera il controllo.

**Blocked by:** 02 — Applicare gli Animation Role automatici; 08 — Coordinare le direzioni con Animation Cue; 09 — Applicare uno Skip Outcome alle Sequence dirette.

**Status:** ready-for-human

- [x] Il Command pertinente con la manovella selezionata avvia una Sequence dichiarativa invece di cambiare istantaneamente soltanto il Game State.
- [x] Michele raggiunge la posa prevista e riproduce una Animation di utilizzo coerente con il proprio Appearance.
- [x] Un Animation Cue corrispondente al contatto avvia la reazione animata dell'argano.
- [x] I normali input del Player restano sospesi per tutta la regia e riprendono soltanto alla conclusione.
- [x] Le Game Operation finali consumano o ricollocano la manovella secondo l'enigma esistente e selezionano l'Appearance permanente dell'argano riparato.
- [x] Terminata la Sequence, Michele e argano tornano alle rispettive Default Animation corrette.
- [x] Save e restore prima e dopo il Cue producono lo stesso stato finale dell'esecuzione ininterrotta.
- [x] Lo skip applica lo Skip Outcome una sola volta e mostra immediatamente l'argano nello stato permanente coerente.
- [x] Le risposte, condizioni e progressione narrativa dell'enigma esistente non cambiano oltre alla nuova presentazione diretta.
- [x] Un test browser di Capri esegue il Command con input reale e verifica regia, risultato, skip e ritorno del controllo.
