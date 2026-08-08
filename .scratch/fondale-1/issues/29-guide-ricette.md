# 29 — Insegnare le Engine Capability con guide e ricette verificate

**What to build:** Un Author parte da un progetto TypeScript esterno, segue la
documentazione distribuita e arriva alla prima Scene; può poi apprendere ogni
Engine Capability attraverso una ricetta minima compilata e, quando mostra
comportamento, verificata contro il pacchetto realmente distribuibile.

**Blocked by:** 27 — Rendere coerenti validazione e Authoring Diagnostic; 28 —
Garantire la Support Baseline di mouse e tastiera.

**Status:** ready-for-agent

- [ ] Un avvio rapido conduce dall'installazione del pacchetto alla prima Scene
      eseguibile senza import profondi o conoscenza degli interni.
- [ ] Una guida concettuale spiega almeno Engine, Game Project, Game Definition,
      Game Behavior, Game Session, Game State, Scene Space, Game Activity, Save
      Snapshot e Authoring Diagnostic.
- [ ] Esistono ricette focalizzate per Scene, Background, Appearance e camminata,
      navigazione, Interaction, condizioni e Game Operation.
- [ ] Esistono ricette focalizzate per Sequence, Inventory, creazione-validazione-
      ripristino di Save Snapshot e Game Behavior.
- [ ] Ogni ricetta mostra una sola idea con il minimo contesto completo e deriva
      da sorgenti realmente compilati contro l'artefatto distribuibile.
- [ ] Le ricette che mostrano comportamento vengono verificate automaticamente
      attraverso la seam pubblica o quella del core appropriata.
- [ ] Guide e ricette usano il linguaggio canonico di Fondale e non richiedono
      conoscenza di PixiJS, algoritmi, layout interno o hook di test.
- [ ] La documentazione collega l'Example come composizione completa senza
      trasformare ogni ricetta in un Game Project autonomo.
- [ ] Un Author può ricostruire il percorso dell'Example usando soltanto
      documentazione e pacchetto distribuiti.

