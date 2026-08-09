# 02 — HUD con nove Verb e Walk To

**What to build:** permettere al Player di vedere e selezionare i nove Verb nella
griglia approvata, camminare implicitamente con Walk To e comprendere il Command
che sta componendo.

**Blocked by:** 01 — Primo Command end-to-end.

**Status:** ready-for-agent

- [ ] Il HUD Engine-owned mostra sempre la griglia 3×3 con Open/Pick Up/Push, Close/Look At/Pull e Give/Talk To/Use nelle posizioni stabilite.
- [ ] Il Command Lexicon italiano presenta Apri, Raccogli, Spingi, Chiudi, Guarda, Tira, Dai, Parla con e Usa senza cambiare l'ordine spaziale.
- [ ] QWE, ASD e ZXC selezionano i Verb corrispondenti e lo stato selezionato è percepibile senza dipendere soltanto dal colore.
- [ ] Un click sinistro sul terreno esegue Walk To; un click sinistro su un Noun completa il Command selezionato.
- [ ] Il Command Preview mostra Verb e Noun vicino al puntatore e rimane entro la Logical Resolution.
- [ ] Escape annulla un Command incompleto e un Command concluso o fallito torna allo stato neutro Walk To.
- [ ] La griglia e gli input sono verificati con mouse e tastiera reali nel browser pubblico.
