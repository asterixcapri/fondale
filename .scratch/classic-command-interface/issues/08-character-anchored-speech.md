# 08 — Speech sopra i Character

**What to build:** presentare Line e Command Response vicino a chi parla,
distinguendo chiaramente speech e narration senza coprire il HUD.

**Blocked by:** 03 — Preferred Verb e fallback percepibili.

**Status:** ready-for-human

- [x] Speech appare sopra il Character visibile, segue la sua posizione e resta clamped nella safe region sopra il HUD.
- [x] Il testo va a capo entro la larghezza massima dichiarata e usa il colore speaker fornito dal tema.
- [x] Narration e speech senza speaker visibile sono centrati nella Scene.
- [x] Una Command Response speech usa il Player Character come speaker predefinito quando non ne dichiara uno.
- [x] La durata automatica considera testo, velocità preferita ed eventuale audio.
- [x] Punto e click centrale avanzano la Line; click sinistro e destro restano bloccati; Escape agisce soltanto su Sequence skippable.
- [x] Test browser verificano ancoraggio, wrapping, input bloccato, avanzamento e presentazione narration.
