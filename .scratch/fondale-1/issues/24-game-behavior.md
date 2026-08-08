# 24 — Eseguire un Game Behavior controllato

**What to build:** L'Example risolve una Interaction attraverso un piccolo Game
Behavior sincrono che legge soltanto fatti di dominio, richiede le stesse Game
Operation dichiarative e resta verificabile senza aprire lo stato, il browser o
il renderer all'Author.

**Blocked by:** 21 — Risolvere una Primary Action a un Approach Point.

**Status:** ready-for-agent

- [ ] Un Interaction Case sceglie esattamente una lista di operazioni
      dichiarative oppure un Game Behavior, mai entrambe.
- [ ] Il Game Behavior è collocato sulla Game Definition pertinente e riceve un
      contesto temporaneo tipizzato di letture committed, bersaglio e operazioni
      controllate.
- [ ] Il contesto non espone Game State grezzo, mutazione, DOM, PixiJS,
      renderer, input, clock o lifecycle della Game Session.
- [ ] Promise, timer, casualità globale, rete e stato esterno mutabile non
      appartengono al contratto documentato del Game Behavior.
- [ ] Le Game Operation richieste vengono validate e applicate come un unico
      gruppo atomico dopo il ritorno del comportamento.
- [ ] Un comportamento che lancia o richiede un'operazione invalida non produce
      commit e porta la Game Session in `failed` con percorso e causa originale
      disponibili.
- [ ] L'Example esercita almeno un Game Behavior sincrono attraverso
      l'interface pubblica e ne rende percepibile il risultato.
- [ ] Il test adapter dimostra che lo stesso comportamento con lo stesso
      contesto produce gli stessi snapshot ed effetti.
- [ ] La documentazione chiarisce scopo, limiti, operazioni disponibili,
      modalità di fallimento e un esempio compilato e verificato.

