# 04 — Choice LucasArts completa

**What to build:** Presentare una `Choice` come un elenco LucasArts di frasi
che il Player Character potrebbe pronunciare, mantenendo equivalenti mouse e
tastiera e trasformando la frase selezionata in una vera `Line` quando è
marcata come parlata.

**Blocked by:** 02 — Line visivamente legata al Character.

**Status:** ready-for-human

- [x] Le alternative eleggibili appaiono numerate, allineate a sinistra e
  impilate verticalmente nella parte bassa della Scene.
- [x] Le frasi usano colore, scala e contorno della `Line` del Player Character,
  senza sfondi o bordi individuali.
- [x] L'intero elenco poggia su un solo sfondo scuro senza bordo, traslucido
  circa al 65% e sfumato verso l'alto nella Scene.
- [x] Hover e focus da tastiera rendono inequivocabile l'alternativa corrente;
  selezione con mouse e tasti numerici producono lo stesso risultato.
- [x] Durante la `Choice`, l'elenco possiede l'input, le interazioni col mondo
  non partono e il trigger dell'Inventory non compete con le alternative.
- [x] Una alternativa parlata riappare come `Line` del Player Character prima
  che la `Sequence` prosegua; una alternativa esplicitamente non parlata non
  viene mostrata come `Line`.
