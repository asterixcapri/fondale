# 11 — Options, Help e Player Preferences

**What to build:** dare al Player un luogo unico per apprendere i controlli e
adattare leggibilità e ritmo senza modificare il Game State.

**Blocked by:** 02 — HUD con nove Verb e Walk To; 08 — Speech sopra i Character.

**Status:** ready-for-human

- [x] F5 apre e chiude Options senza eseguire Command sul mondo.
- [x] Options controlla text speed, speech text visibility, HUD backing/opacity e Command Preview versus Sentence Line.
- [x] I controlli di volume compaiono soltanto quando il Game Project dichiara audio pertinente.
- [x] Help documenta mouse, Tab, rotellina, QWE/ASD/ZXC, 1–6, F5, Ctrl+S, Ctrl+L, punto, click centrale ed Escape.
- [x] Suggerimenti una tantum introducono click sinistro, click destro, Tab e Inventory scrolling.
- [x] Player Preferences e stato dei suggerimenti persistono localmente ma non modificano Game State o Save Snapshot.
- [x] Test browser verificano Options, Help, persistenza locale e assenza di effetti sul risultato dei Command.
