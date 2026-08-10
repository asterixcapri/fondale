# 01 — Espandere la risoluzione dei Noun dal target

**What to build:** Consentire a un Author di omettere il Noun da un Hotspot che
punta a un Object, Character o Scenery già dotato di Noun, mantenendo
temporaneamente compatibili i Game Project nella forma 0.1. Il Core deve
risolvere il Noun dal riferimento dichiarativo quando l'Hotspot non ne contiene
uno; un Noun legacy ancora presente sull'Hotspot continua provvisoriamente ad
avere precedenza, così l'espansione può atterrare senza rompere i call site non
ancora migrati.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] La forma espansa mantiene obbligatorio il Noun per un Hotspot `background` e rende opzionale, solo per la migrazione, quello dei target Object, Character e Scenery.
- [ ] Un Object Hotspot senza Noun usa label, Preferred Verb, Secondary Verb, Selected Object Verb e Command Case del proprio Object.
- [ ] Un Character Hotspot senza Noun usa il Noun del proprio Character fino alla risoluzione di Line, Sequence, response e Game Operation.
- [ ] Uno Scenery Hotspot senza Noun usa il Noun dello Scenery corretto nella Scene corrente.
- [ ] Background Hotspot e Scene Passage continuano a usare direttamente il proprio Noun locale.
- [ ] Un Hotspot legacy che contiene ancora un Noun conserva temporaneamente il comportamento 0.1 anche quando il target possiede un Noun diverso.
- [ ] Un target esistente senza Noun né fallback legacy produce un Authoring Diagnostic durante `defineGame`, non un errore tardivo durante il gioco.
- [ ] La risoluzione vive in un solo percorso interno del Core, condiviso dalla proiezione degli Hotspot disponibili e dall'esecuzione dei Command.
- [ ] I test attraversano l'interfaccia del Game Project e la Game Session; non chiamano direttamente il resolver interno.
- [ ] I test di regressione dimostrano che la forma legacy e la nuova forma producono entrambe il comportamento atteso durante la fase di espansione.
- [ ] Build e verifica browser del package restano verdi.
