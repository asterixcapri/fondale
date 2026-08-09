# 28 — Garantire la Support Baseline di mouse e tastiera

**What to build:** In Chrome desktop corrente il Player usa il mouse per il
mondo e può controllare interamente HUD, Line e Choice con la tastiera, con
focus prevedibile e visibile e senza che l'alternanza fra dispositivi cambi lo
stato logico.

**Blocked by:** 22 — Eseguire una Sequence con Line e Choice; 23 — Raccogliere e
usare un Object tramite l'Inventory.

**Status:** ready-for-human

- [x] La piattaforma verificata usa l'ultima Google Chrome stabile desktop con
      WebGL; la configurazione non implica supporto per altri browser.
- [x] Mouse e click reali controllano navigazione, Hotspot, HUD, Line e Choice;
      nessuna azione richiesta dipende esclusivamente dal tasto destro.
- [x] `Tab` e `Shift+Tab` percorrono in ordine prevedibile i controlli visibili
      del HUD e `Enter` o `Space` attivano il controllo corrente.
- [x] `Enter` o `Space` avanzano una Line; le frecce cambiano alternativa nella
      Choice e `Enter` o `Space` la confermano.
- [x] Quando una Choice diventa attiva acquisisce il controllo da tastiera senza
      click preliminare e al termine della Sequence lo restituisce al controllo
      precedente.
- [x] `Escape` deseleziona l'Object dell'Inventory quando il contesto lo
      consente e non interferisce con la modalità della Sequence.
- [x] Alternare mouse e tastiera non attiva azioni, non perde selezioni logiche
      e non lascia il Player intrappolato.
- [x] Focus da tastiera e Object selezionato hanno un indicatore inequivocabile
      oltre al solo colore.
- [x] Le prove Playwright usano eventi reali e coprono una finestra desktop
      ampia e una più piccola o con proporzioni differenti, inclusi letterbox,
      HUD e Sequence.
- [x] La documentazione dichiara esattamente la Support Baseline e le esclusioni:
      vecchie Chrome, altri browser, touch, gamepad, sola tastiera nel mondo,
      lettori di schermo e conformità WCAG generale.

