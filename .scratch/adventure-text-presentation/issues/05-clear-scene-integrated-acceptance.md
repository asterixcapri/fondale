# 05 — Scena libera e accettazione integrata

**What to build:** Riunire le presentazioni approvate in una Scene con zone di
lettura prevedibili: speech sopra i Character, prosa e feedback in basso,
Choice in basso e istruzioni soltanto in Help. Il pacchetto Capri deve
dimostrare il comportamento completo sulle diverse famiglie di Scene.

**Blocked by:** 03 — Esiti dei Command semanticamente distinti; 04 — Choice
LucasArts completa.

**Status:** ready-for-human

- [x] Nessun testo narrativo o di controllo appare al centro della Scene e
  Help contiene le istruzioni aggiornate per mouse, tastiera, Inventory,
  reveal, Choice, avanzamento, Options, Save e Load.
- [x] Una `Narration` o `Command Response` è centrata nello spazio di Scene
  realmente disponibile e non viene coperta da un Inventory aperto.
- [x] Le quattro presentazioni restano distinguibili quando si susseguono:
  `Line`, `Command Response`, `Narration` e `Choice` non si sovrappongono né
  lasciano residui della presentazione precedente.
- [x] L'accettazione del pacchetto Capri copre `Line` diretta da Command,
  `Command Response`, `Narration`, `Choice` via mouse e tastiera e testo
  inferiore con Inventory aperto.
- [x] L'evidenza visiva finale copre le famiglie di Scene Porto, Aiano e Boffe
  ai viewport della Support Baseline, includendo fondali chiari e densi.
- [x] La verifica finale usa il pacchetto pubblico e non introduce snapshot CSS
  o test accoppiati ai dettagli privati del renderer.
