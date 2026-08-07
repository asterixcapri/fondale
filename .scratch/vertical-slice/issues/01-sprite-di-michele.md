# 01 — Come produciamo lo sprite di Michele

Type: prototype
Status: open

## Question

È il collo di bottiglia dell'intero progetto e l'unico punto dove la generazione AI di immagini non risolve da sola. I fondali si generano; otto frame coerenti dello stesso personaggio no.

Serve Michele alto circa 100 pixel in primo piano, con come minimo camminata in 4 direzioni a 6-8 frame, idle e parlata. Coerente frame per frame, in palette con i fondali. Da evitare il look "pirata caraibico": è un giovane caprese del Cinquecento.

Sotto il vincolo di autonomia, l'agente deve arrivarci da solo. Strade da provare, in ordine di probabilità:

- **costruzione procedurale a codice** — corpo scomposto in parti (busto, braccia, gambe, testa) disegnate a codice e animate per interpolazione. Coerenza garantita per costruzione, ed è l'unica via completamente sotto controllo dell'agente. Rischio: sembra rigido.
- **posato singolo generato dall'AI, scomposto e animato** — si genera un Michele fermo, lo si ritaglia in parti e le si anima. Compromesso tra qualità del disegno e coerenza.
- **render di un modello 3D grezzo ridotto a pixel art** — tecnica usata da diverse avventure moderne proprio per garantire coerenza tra i frame. Costo di setup alto.

Il ticket è risolto quando esiste **un ciclo di camminata vero, guardato in movimento** dall'agente tramite il banco di verifica, e sappiamo quanto costa produrne un altro. Non quando è stato scelto un metodo in teoria.

Se nessuna delle strade dà un risultato accettabile, è l'informazione più importante dell'intera mappa e va riportata subito all'umano: cambia il preventivo del progetto.
