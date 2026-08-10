# 03 — Contrarre l'interfaccia Hotspot di Fondale 0.2

**What to build:** Rendere target-owned l'unica forma pubblica accettata da
Fondale. TypeScript deve distinguere gli Hotspot `background`, che possiedono un
Noun locale, dagli Hotspot Object, Character e Scenery, che possono usare
soltanto il Noun del target. `defineGame` deve proteggere l'invariante con
diagnostiche aggregate e il Core deve abbandonare ogni fallback legacy.

**Blocked by:** 02 — Migrare fixture, test e ricette ai Noun proprietari

**Status:** ready-for-agent

- [ ] L'interfaccia pubblica degli Hotspot è una discriminated union basata sul tipo di target.
- [ ] TypeScript richiede un Noun su ogni Background Hotspot.
- [ ] TypeScript rifiuta il campo Noun sugli Hotspot Object, Character e Scenery.
- [ ] Object, Character e Scenery non interattivi possono continuare a omettere il proprio Noun.
- [ ] `defineGame` rifiuta un Object, Character o Scenery referenziato da un Hotspot quando il proprietario non possiede un Noun.
- [ ] Il problema viene riportato una sola volta sul percorso del Noun proprietario anche quando più Hotspot puntano allo stesso target.
- [ ] Proprietari distinti senza Noun producono diagnostiche indipendenti e aggregate insieme agli altri errori di authoring.
- [ ] Un target inesistente conserva la propria diagnostica di riferimento e non genera anche una diagnostica dipendente per il Noun mancante.
- [ ] La Noun Definition del proprietario viene validata con il target semantico corretto, compresi Command Case, riferimenti e Game Operation target-relative.
- [ ] Il Core risolve sempre il Noun dal target per Object, Character e Scenery; il fallback verso un Noun legacy dell'Hotspot non esiste più.
- [ ] Nessun resolver, cache o rappresentazione eager viene aggiunto all'interfaccia pubblica o al Game Project composto.
- [ ] I test compile-time e runtime attraversano esclusivamente la package root e la Game Session.
- [ ] Build, dichiarazioni pubbliche e verifica browser del package restano verdi con la sola forma Fondale 0.2.
