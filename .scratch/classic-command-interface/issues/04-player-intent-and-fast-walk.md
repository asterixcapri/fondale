# 04 — Player Intent, revalidation e Fast Walk

**What to build:** eseguire i Command sul mondo soltanto dopo che il Player
Character ha raggiunto l'Approach Point, senza applicare intenzioni diventate
invalide durante il movimento.

**Blocked by:** 03 — Preferred Verb e fallback percepibili.

**Status:** ready-for-agent

- [ ] Un Command sul mondo crea un Player Intent verso l'Approach Point e conserva il Command richiesto.
- [ ] Il Command viene rivalutato sul Game State più recente dopo l'arrivo prima di produrre effetti.
- [ ] Un nuovo ordine di movimento o Command sostituisce il Player Intent ancora in corso.
- [ ] Il doppio click sinistro su terreno o Passage richiede Fast Walk senza saltare pathfinding, condizioni o Interaction.
- [ ] Fast Walk cambia soltanto la velocità di presentazione e produce lo stesso risultato di Walk To.
- [ ] Test deterministici dimostrano sostituzione e revalidation; test browser esercitano movimento e doppio click reali.
