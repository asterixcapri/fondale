# 01 — Espandere la risoluzione dei Noun dal target

**What to build:** Consentire a un Author di omettere il Noun da un Hotspot che
punta a un Object, Character o Scenery già dotato di Noun. Poiché le versioni
Fondale sono ancora interne, l'intero effort atterra atomicamente sulla forma
target-owned senza uno stadio legacy pubblico. Il Core deve risolvere il Noun
dal riferimento dichiarativo.

**Blocked by:** None — can start immediately

**Status:** ready-for-human

- [x] La forma espansa mantiene obbligatorio il Noun per un Hotspot `background` e lo rifiuta sui target Object, Character e Scenery.
- [x] Un Object Hotspot senza Noun usa label, Preferred Verb, Secondary Verb, Selected Object Verb e Command Case del proprio Object.
- [x] Un Character Hotspot senza Noun usa il Noun del proprio Character fino alla risoluzione di Line, Sequence, response e Game Operation.
- [x] Uno Scenery Hotspot senza Noun usa il Noun dello Scenery corretto nella Scene corrente.
- [x] Background Hotspot e Scene Passage continuano a usare direttamente il proprio Noun locale.
- [x] Un Hotspot legacy che contiene ancora un Noun viene rifiutato dal contratto TypeScript corrente.
- [x] Un target esistente senza Noun produce un Authoring Diagnostic durante `defineGame`, non un errore tardivo durante il gioco.
- [x] La risoluzione vive in un solo percorso interno del Core, condiviso dalla proiezione degli Hotspot disponibili e dall'esecuzione dei Command.
- [x] I test attraversano l'interfaccia del Game Project e la Game Session; non chiamano direttamente il resolver interno.
- [x] I test di regressione dimostrano la forma target-owned insieme ai Noun locali di Background Hotspot e Scene Passage.
- [x] Build e verifica browser del package restano verdi.

## Comments

- 2026-08-10: l'utente ha chiarito che le versioni sono interne; il fallback
  transitorio 0.1 non serve quando tutti i call site dell'effort vengono migrati
  e contratti nello stesso cambiamento.
