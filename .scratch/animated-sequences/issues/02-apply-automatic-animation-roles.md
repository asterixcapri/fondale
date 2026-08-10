# 02 — Applicare gli Animation Role automatici

**What to build:** fare scegliere automaticamente all'Engine le Animation di default, parola e camminata appropriate all'Appearance corrente, così che un Character parli, cammini e torni all'idle senza istruzioni ripetute in ogni Line o movimento.

**Blocked by:** 01 — Espandere Appearance con Animation.

**Status:** ready-for-human

- [x] Ogni nuova Appearance usa il ruolo default come presentazione normale.
- [x] Una Line seleziona automaticamente il ruolo speaking del Character che parla e torna alla Default Animation quando termina.
- [x] Una Line può nominare un'Animation alternativa per una performance speciale.
- [x] Se speaking non è disponibile, la Line continua correttamente usando la Default Animation.
- [x] Il movimento libero di un Character seleziona walking coerentemente con orientamento e direzione e torna alla Default Animation quando termina.
- [x] Un Character che può muoversi in un'Appearance priva di walking produce un Authoring Diagnostic prima dell'avvio invece di scivolare silenziosamente.
- [x] Un override o Animation Role che riferisce un'Animation inesistente produce una diagnostica stabile e contestuale.
- [x] Default, speaking e walking restano selezioni semantiche dell'Engine e non convenzioni sui nomi delle Animation.
- [x] Test deterministici e browser verificano idle, parola, fallback, camminata e ritorno alla Default Animation attraverso l'interface pubblica.
- [x] Build e verifica complete rimangono verdi.
