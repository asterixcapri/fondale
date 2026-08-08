# Determinare le dimensioni dell'Inventory Appearance

Type: prototype
Status: resolved
Blocked by: 11

## Question

Quale contratto dimensionale permette all'interfaccia sovrapposta posseduta da
Fondale di mostrare gli `Inventory Appearance` e il cursore di `Inventory Use`
senza ridimensionare automaticamente i PNG forniti dall'Author? Un prototipo
deve esercitare la `Logical Resolution` dell'Example e almeno una seconda
risoluzione rappresentativa, oggetti con proporzioni diverse, selezione tramite
mouse e tastiera e uso sul mondo. Deve fissare vincoli pubblici verificabili per
le immagini e dimostrare che inventario e cursore restano leggibili, senza
rendere configurabili layout o stile dell'interfaccia nella Versione 1.

## Comments

- [Prototipo interattivo dei tre contratti dimensionali](../prototypes/inventory-appearance.html)
  — confronta dimensione fissa compatta, dimensione fissa leggibile e
  proporzioni libere alle risoluzioni logiche 426×240 e 640×360.
- [Ricerca sul dimensionamento degli asset negli altri motori](../research/asset-sizing-other-engines.md)
  — confronta Godot, Unity, Phaser e Ren'Py e distingue tela del progetto,
  dimensione nativa dei PNG e adattamento allo schermo.

## Answer

Fondale distingue tre misure: i pixel nativi di un PNG, la `Logical
Resolution` che costituisce la tela base del `Game Project` e la dimensione
fisica alla quale il quadro completo viene mostrato. `Background`, mondo e HUD
vengono composti sulla stessa tela e poi adattati insieme al target con scala
uniforme. L'HUD resta fuori dallo `Scene Space` sul piano semantico, ma non usa
una scala fisica separata. Cambiare finestra o monitor non richiede altri asset
e non lascia l'Inventory fermo rispetto al mondo.

Ogni `Game Project` dichiara una sola `Inventory Appearance Size`, quadrata ed
espressa in pixel della propria `Logical Resolution`. Ogni Object fornisce un
PNG esattamente di quella larghezza e altezza, trasparenza compresa; Fondale lo
usa alla dimensione nativa sia nello slot dell'Inventory sia come cursore di
`Inventory Use`. `startGame` rifiuta atomicamente dimensioni diverse e riporta
insieme tutti gli asset non conformi. Fondale non ridimensiona, ritaglia,
ricampiona o giudica la leggibilità semantica del contenuto dentro il riquadro.

L'Example `426×240` stabilisce `32×32`. Un progetto realmente disegnato a
`640×360` può conservare la stessa proporzione artistica dichiarando `48×48`;
non cambia asset quando viene semplicemente mostrato su uno schermo più grande.
La dimensione condivisa è un vincolo della scala degli asset, non una
configurazione del layout: posizione, ordine, slot, spaziatura, stile,
selezione e navigazione da tastiera dell'HUD restano posseduti dal motore e non
configurabili nella Versione 1.

Il [prototipo](../prototypes/inventory-appearance.html) separa ora esplicitamente
la tela del progetto dalla dimensione dello schermo. La variante scelta è
**B — Scelta — quadrato coerente**: a schermo 2×, il quadro `426×240` diventa
`852×480` e l'Inventory Appearance `32×32` diventa `64×64`; mouse e tastiera
selezionano lo stesso Object e ne esercitano l'uso sul mondo. Il confronto con
[Godot, Unity, Phaser e Ren'Py](../research/asset-sizing-other-engines.md)
conferma che tela base, asset nativi e display fisico sono grandezze distinte e
che scalare la composizione completa è il modello comune per un gioco 2D a
quadro fisso.
