# 04 — Interfaccia: verbi classici o click contestuale

Type: grilling
Status: resolved

## Question

Rimasta aperta dal documento di progetto, sezione 26. Va chiusa prima dello slice, perché decide quanto schermo resta al fondale e che forma hanno le interazioni.

- **Verbi alla LucasArts** — GUARDA, PARLA, PRENDI, USA, APRI, CHIUDI in una griglia nel quarto inferiore. È la scelta di Thimbleweed Park, e in quel caso la stanza scende a 428x172 di altezza utile.
- **Click contestuale moderno** — tasto sinistro cammina e usa, destro guarda; oppure un piccolo menu circolare. Lo schermo resta tutto al fondale.

Da pesare: il pubblico, quanto l'umorismo del gioco dipende dalle combinazioni assurde verbo-oggetto (che i verbi espliciti incoraggiano), e il fatto che i verbi moltiplicano il numero di risposte da scrivere per ogni hotspot.

Nota tecnica: a 426x240 con la barra dei verbi, la stanza scende a circa 426x180. I fondali vanno ritagliati di conseguenza — quindi questa decisione ricade sul ticket 02.

## Answer

Status: resolved

Scelta un'**interfaccia contestuale moderna** che mantiene l'intera scena a
426x240. L'estetica LucasArts resta nella direzione artistica, nella scrittura e
negli enigmi, senza imporre la sua griglia storica di verbi.

### Contratto d'interazione

- Ogni hotspot dichiara una sola **azione primaria**, con un'etichetta adatta
  alla situazione (`Guarda`, `Parla`, `Bussa`, `Paga`), non presa da un elenco
  fisso del motore.
- Un click sull'hotspot esprime un solo **intento del giocatore**: Michele
  raggiunge il punto d'approccio, si orienta e infine esegue l'interazione.
- Un nuovo intento sostituisce immediatamente quello ancora in corso.
- Al passaggio del puntatore compaiono nome e azione dell'hotspot. Un comando
  separato li rivela tutti temporaneamente per accessibilità.

### Inventario e HUD

- Due piccoli controlli HUD sovrapposti negli angoli aprono l'inventario e
  rivelano gli hotspot; entrambi hanno anche una scorciatoia da tastiera. Nessuna
  azione dipende esclusivamente dal tasto destro.
- L'inventario è un pannello temporaneo sopra il fondale. Selezionare un oggetto
  lo porta sul cursore e il bersaglio successivo riceve un **uso di inventario**.
- Un uso incompatibile riceve una risposta comune, salvo eccezioni significative
  o comiche. Dopo il fallimento l'oggetto resta selezionato; dopo il successo si
  deseleziona. Il giocatore può sempre annullare la selezione esplicitamente.

La capienza dell'inventario e la struttura delle scelte di dialogo restano
decisioni separate. La decisione architetturale è registrata in
`docs/adr/0001-full-scene-contextual-interaction.md`; il vocabolario condiviso è
in `CONTEXT.md`.
