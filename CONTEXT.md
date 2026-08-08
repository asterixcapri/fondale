# Fondale

Glossario condiviso del motore per avventure grafiche: nomina i concetti con
cui un progetto di gioco definisce il mondo e il giocatore vi interagisce.

## Linguaggio del prodotto

**Motore**:
Il sistema riutilizzabile che interpreta un progetto di gioco e ne rende
giocabile l'avventura senza richiedere modifiche ai propri interni.
_Avoid_: Gioco, framework generico

**Capacità del motore**:
Un comportamento riutilizzabile che Fondale garantisce ai progetti di gioco
attraverso il proprio contratto pubblico.
_Avoid_: Caratteristica di Capri, dettaglio del renderer

**Impostazione di gioco**:
Una scelta o un valore con cui un progetto adatta una capacità del motore alla
propria direzione artistica e al proprio comportamento.
_Avoid_: Costante del motore, API interna

**Autore**:
Lo sviluppatore web che costruisce un progetto di gioco attraverso il
contratto pubblico di Fondale, senza dipendere dagli interni del motore.
_Avoid_: Giocatore, utente finale

**Progetto di gioco**:
L'insieme autonomo di contenuti, configurazioni e comportamenti che definisce
una specifica avventura costruita con Fondale.
_Avoid_: Motore, demo

**Definizione di gioco**:
La descrizione dichiarativa di un elemento dell'avventura, separata dai
comportamenti eccezionali scritti appositamente per un progetto di gioco.
_Avoid_: Classe del motore, configurazione generica

**Comportamento di gioco**:
Una regola specifica dell'avventura che completa le definizioni di gioco senza
modificare gli interni del motore.
_Avoid_: Patch del motore, plugin

**Esempio**:
Un progetto di gioco distribuito con Fondale per dimostrare e verificare le
capacità supportate; Capri 1535 è il primo esempio.
_Avoid_: Codice del motore, demo usa e getta

## Linguaggio delle interazioni

**Hotspot**:
Una parte riconoscibile della scena con cui il giocatore può interagire.
_Avoid_: Oggetto interattivo, punto cliccabile

**Oggetto**:
Un'entità persistente che il giocatore può prendere. La sua definizione
appartiene al progetto di gioco; una stanza può indicarne la posizione
iniziale, ma non la possiede.
_Avoid_: Elemento scenografico, sinonimo di hotspot

**Interazione**:
Una risposta significativa del mondo a un intento del giocatore; la scena ne
definisce liberamente l'etichetta, come Guarda, Parla, Bussa o Paga.
_Avoid_: Verbo, comando

**Azione primaria**:
L'interazione predefinita di un hotspot quando nessun oggetto dell'inventario è
selezionato.
_Avoid_: Click contestuale, azione di default

**Intento del giocatore**:
La richiesta completa di raggiungere un bersaglio, orientarsi ed eseguire
un'interazione. Un nuovo intento sostituisce quello ancora in corso.
_Avoid_: Click, movimento accodato

**Uso di inventario**:
Il tentativo di applicare un oggetto selezionato a un bersaglio. Un fallimento
mantiene la selezione; un successo la conclude.
_Avoid_: Drag-and-drop, verbo Usa
