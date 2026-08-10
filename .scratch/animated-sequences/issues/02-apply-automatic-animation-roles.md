# 02 — Applicare gli Animation Role automatici

**What to build:** fare scegliere automaticamente all'Engine le Animation di default, parola e camminata appropriate all'Appearance corrente, così che un Character parli, cammini e torni all'idle senza istruzioni ripetute in ogni Line o movimento.

**Blocked by:** 01 — Espandere Appearance con Animation.

**Status:** ready-for-agent

- [ ] Ogni nuova Appearance usa il ruolo default come presentazione normale.
- [ ] Una Line seleziona automaticamente il ruolo speaking del Character che parla e torna alla Default Animation quando termina.
- [ ] Una Line può nominare un'Animation alternativa per una performance speciale.
- [ ] Se speaking non è disponibile, la Line continua correttamente usando la Default Animation.
- [ ] Il movimento libero di un Character seleziona walking coerentemente con orientamento e direzione e torna alla Default Animation quando termina.
- [ ] Un Character che può muoversi in un'Appearance priva di walking produce un Authoring Diagnostic prima dell'avvio invece di scivolare silenziosamente.
- [ ] Un override o Animation Role che riferisce un'Animation inesistente produce una diagnostica stabile e contestuale.
- [ ] Default, speaking e walking restano selezioni semantiche dell'Engine e non convenzioni sui nomi delle Animation.
- [ ] Test deterministici e browser verificano idle, parola, fallback, camminata e ritorno alla Default Animation attraverso l'interface pubblica.
- [ ] Build e verifica complete rimangono verdi.
