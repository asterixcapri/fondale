# 26 — Salvare e ripristinare una Choice attiva

**What to build:** Durante la Choice dell'Example, il Game Project crea un Save
Snapshot JSON-safe, arresta la Game Session, valida il dato recuperato e avvia
una nuova sessione che presenta la stessa Choice e continua fino allo stesso
risultato di una partita mai interrotta.

**Blocked by:** 22 — Eseguire una Sequence con Line e Choice; 25 — Attraversare
un Scene Passage e concludere l'Example.

**Status:** ready-for-agent

- [ ] Ogni Game Project dichiara Project Identity e Project Version distinte da
      titolo, versione commerciale e versione del pacchetto.
- [ ] Il Save Snapshot include versione del formato, Project Identity, Project
      Version e tutti i fatti canonici necessari alla ripresa esatta.
- [ ] Scene, Scenery, Character, Object, Inventory, Game Variable e progresso
      della Game Activity dominante sono rappresentati senza includere Game
      Definition, callback, asset o interni derivabili.
- [ ] La Game Session crea su richiesta un valore JSON-safe dall'ultimo stato
      committed anche durante attività o transizioni, senza catturare
      preparazione parziale.
- [ ] Dopo `stop()` o `failed` non è possibile creare un nuovo Save Snapshot.
- [ ] Un dato recuperato viene trattato come `unknown`; la validazione restituisce
      un esito esplicito e richiede corrispondenza esatta di formato, Project
      Identity e Project Version.
- [ ] Dati corrotti, incompleti, con campi inattesi, riferimenti mancanti o
      invarianti contraddittorie vengono rifiutati senza riparazioni, migrazioni
      o nuova partita silenziosa.
- [ ] Soltanto il risultato validato può essere passato a `startGame`, che crea
      una nuova Game Session indipendente.
- [ ] Il ripristino sulla Choice conserva Sequence, percorso, alternative
      eleggibili e stato del mondo senza rieseguire Game Operation già committed.
- [ ] Una prosecuzione ininterrotta e quella con Save Snapshot raggiungono gli
      stessi snapshot ed effetti a parità di input successivi.
- [ ] L'Example conserva il dato con storage posseduto dal Game Project; Fondale
      non introduce slot, UI, autosave o storage.
- [ ] Creazione, validazione, compatibilità, ripristino e limiti di sicurezza
      sono documentati con una ricetta compilata e verificata.

