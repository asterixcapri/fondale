# 01 — Narration esplicita end-to-end

**What to build:** Consentire all'Author di inserire una `Narration` esplicita
in una `Sequence` e farla arrivare intatta attraverso authoring, Engine,
salvataggio e renderer. Per mantenere verde la transizione, le `Line` senza
Character restano temporaneamente accettate fino alla migrazione prevista dal
ticket 02.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] L'Author può dichiarare una `Narration` non vuota come passo di una
  `Sequence`, anche dentro rami e alternative, e riceve diagnostiche coerenti
  per valori non validi.
- [x] Una `Narration` può essere avanzata, saltata quando la `Sequence` lo
  consente, salvata e ripristinata senza diventare una `Line`.
- [x] Il Player vede la `Narration` al margine inferiore in un pannello scuro
  traslucido, con misura larga e colore caldo governato dall'HUD Theme.
- [x] La documentazione pubblica e il Capri Example mostrano almeno una
  `Narration` esplicita, mentre il formato precedente resta disponibile solo
  come compatibilità transitoria.
