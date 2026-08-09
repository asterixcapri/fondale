# 05 — Command binari Give e Use

**What to build:** permettere al Player di comporre frasi con due Noun, usando
Object dell'Inventory e bersagli del mondo senza movimenti privi di significato.

**Blocked by:** 03 — Preferred Verb e fallback percepibili; 04 — Player Intent, revalidation e Fast Walk.

**Status:** ready-for-agent

- [ ] Give richiede sempre due Noun, Use accetta uno o due Noun e gli altri Verb visibili restano unari.
- [ ] Il Command Preview usa i modelli grammaticali dichiarati per frasi come `Use X with Y` e `Give X to Y`.
- [ ] Un Object dell'Inventory può essere il primo o il secondo Noun quando il Command Case lo consente.
- [ ] Un Command composto soltanto da Object nell'Inventory si risolve immediatamente senza Player Intent.
- [ ] La selezione del primo Noun resta visibile e può essere annullata con Escape.
- [ ] Arity, riferimenti e combinazioni non validi producono Authoring Diagnostic anziché comportamento implicito.
- [ ] Test pubblici e browser coprono Use unario, Use binario, Give, fallback e ordine dei Noun.
