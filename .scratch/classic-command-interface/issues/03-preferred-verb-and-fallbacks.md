# 03 — Preferred Verb e fallback percepibili

**What to build:** rendere ogni Noun esplorabile con un Preferred Verb rapido e
garantire una risposta pertinente per ogni Command completo, anche quando non
esiste un caso specifico.

**Blocked by:** 02 — HUD con nove Verb e Walk To.

**Status:** ready-for-human

- [x] Noun Label e Preferred Verb possono avere casi condizionali con un fallback incondizionato.
- [x] Hover presenta Noun Label e Preferred Verb prima dell'azione.
- [x] Il click destro esegue il Preferred Verb senza distruggere un Command binario incompleto.
- [x] La risoluzione segue l'ordine caso specifico, fallback locale del Noun e fallback globale response-only del Game Project.
- [x] Un fallback globale non può mutare Game State o avviare una Sequence.
- [x] Un progetto che può produrre un silent no-op viene rifiutato con Authoring Diagnostic contestuali e aggregati.
- [x] I test pubblici coprono condizioni, precedenza e diagnostiche; il browser copre hover e click destro.
