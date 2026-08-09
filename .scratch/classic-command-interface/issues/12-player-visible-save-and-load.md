# 12 — Save/Load visibile al Player

**What to build:** permettere al Player di creare, riconoscere e caricare
salvataggi nominati, comprendendo anche perché un record precedente è
incompatibile.

**Blocked by:** 10 — Command State nei Save Snapshot; 11 — Options, Help e Player Preferences.

**Status:** ready-for-agent

- [ ] Ctrl+S apre Save e Ctrl+L apre Load; entrambe le azioni sono raggiungibili anche da Options.
- [ ] Il Player può creare e sovrascrivere Save Slot liberi con un nome riconoscibile.
- [ ] Un Save Slot compatibile carica un nuovo Game Session con Game State e Command State ripristinati.
- [ ] Un record con Project Identity o Project Version incompatibile resta visibile, spiega il problema e non può essere caricato.
- [ ] La UI non stabilisce come contratto numero esatto di slot, miniature, autosave o cloud save.
- [ ] Input di mondo e Sequence restano sospesi mentre Save/Load è aperto.
- [ ] Test browser verificano creazione, caricamento, sovrascrittura, incompatibilità e scorciatoie reali.
