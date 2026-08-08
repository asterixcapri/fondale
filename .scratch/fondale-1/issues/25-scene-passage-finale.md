# 25 — Attraversare un Scene Passage e concludere l'Example

**What to build:** Dopo il corretto Inventory Use, il Player rende disponibile
un Scene Passage, raggiunge il suo Approach Point, entra nella seconda Scene
attraverso una Scene Entrance nominata e raggiunge uno stato finale osservabile.

**Blocked by:** 23 — Raccogliere e usare un Object tramite l'Inventory.

**Status:** ready-for-agent

- [ ] L'Example dichiara due Scene, ciascuna con Background, Walkable Region e
      gli elementi locali necessari al percorso.
- [ ] Un Scene Passage nomina la Scene di destinazione e una Scene Entrance con
      Ground Point e orientamento; il collegamento non è implicitamente
      bidirezionale.
- [ ] Il passaggio finale è inattivo finché il precedente Inventory Use non ha
      cambiato il fatto canonico che lo rende disponibile.
- [ ] Raggiungere il passaggio usa il normale Player Intent e il suo Approach
      Point prima di avviare la transizione.
- [ ] Durante la preparazione la vecchia Scene resta canonica e l'input è
      sospeso; un solo commit aggiorna Scene, posizione e orientamento e termina
      l'intento precedente.
- [ ] Un fallimento prima del commit conserva lo stato precedente, non mostra
      parzialmente la destinazione e porta la sessione in `failed` con
      diagnostica.
- [ ] Il Player raggiunge nella seconda Scene uno stato finale percepibile e
      osservabile dal test senza leggere interni del renderer.
- [ ] Playwright percorre con input reali raccolta, sblocco, passaggio e finale;
      il core verifica l'atomicità della transizione.
- [ ] Scene Entrance, Scene Passage, direzionalità, lifecycle ed errori sono
      documentati con un esempio verificato.

