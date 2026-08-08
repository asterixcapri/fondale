# Definire inventario e oggetti utilizzabili

Type: grilling
Status: resolved
Blocked by: 04, 07, 15

## Question

Qual è il modello minimo con cui il Player raccoglie un `Object`, vede gli
oggetti posseduti, ne seleziona o deseleziona uno e lo usa su un bersaglio? La
decisione deve completare collocazione, consumo e successo o fallimento già
previsti dalle interazioni, senza combinazione fra oggetti, quantità,
contenitori, equipaggiamento o crafting.

## Answer

Fondale 1.0 tratta l'inventario come una capacità minima del motore, esercitata
dall'Example e priva di configurazioni anticipatorie. Ogni `Object` occupa
sempre uno solo di tre stati canonici: è presente in una `Scene` a un
`Ground Point`, è posseduto nell'`Inventory`, oppure è consumato in modo
terminale. Identità e stato restano nel `Game State` anche dopo il consumo.

Ogni `Object` parte in una `Scene`. Lo stato iniziale nell'Inventory e quello
iniziale consumato non appartengono alla Versione 1. Un Object presente viene
disegnato e può rendere attivi i `Hotspot` che lo riferiscono soltanto nella
propria Scene; l'autore non duplica questa presenza in una `Game Variable`.
Scene diverse possono dichiarare Hotspot locali per lo stesso Object, così una
successiva ricollocazione rende operativo soltanto quello pertinente.

### Raccolta e operazioni

La raccolta non è un percorso speciale dell'input. È una normale
`Primary Action` sull'Hotspot dell'Object, con risposta percepibile, che richiede
un'operazione controllata. Fondale espone tre cambiamenti semantici, non una
scrittura generica della collocazione:

- raccogliere l'Object bersaglio dalla Scene corrente nell'Inventory;
- collocare l'Object selezionato dall'Inventory a un Ground Point della Scene
  corrente;
- consumare terminalmente l'Object selezionato nell'Inventory.

Queste operazioni sono contestuali: Fondale 1.0 non permette a un caso di
raccogliere un Object estraneo a distanza, di ricollocare un Object arbitrario
o di usarle da una `Sequence`. Una precondizione violata è un'operazione
invalida e segue la politica atomica già stabilita per gli errori di authoring
e i `Game Behavior`.

La raccolta aggiunge l'Object in fondo all'Inventory e non lo seleziona. Un
Object ricollocato e poi raccolto nuovamente rientra in fondo; selezione,
deselezione e usi falliti non cambiano l'ordine. L'ordine corrente appartiene
al Game State e viene quindi conservato dai salvataggi.

### Presentazione e selezione

La definizione di un Object fornisce un'etichetta statica e un aspetto per
l'inventario distinto dall'aspetto nel mondo; il ticket sugli asset ne stabilirà
la forma concreta. L'HUD posseduto dal motore elenca gli Object, evidenzia
quello selezionato e ne usa l'aspetto da inventario come cursore sul mondo.
Layout e stile non sono personalizzabili nella Versione 1.

Mouse e tastiera possono attivare un elemento dell'Inventory. Attivare un
Object non selezionato lo seleziona e sostituisce l'eventuale selezione
precedente; attivarlo di nuovo o premere `Escape` lo deseleziona. La selezione
è un'identità opzionale nel Game State, attraversa i cambi di Scene e non viene
persa per un uso fallito, un bersaglio irraggiungibile o un intento terminato
senza interazione. Un click generico nel mondo non la annulla.

Se il Player cambia o annulla la selezione mentre un `Player Intent` sta
raggiungendo un bersaglio, quell'intento termina normalmente: non può eseguire
in seguito un uso che l'HUD non rappresenta più. Perdere l'Object
dall'Inventory elimina sempre la selezione.

### Uso ed esiti

Con nessun Object selezionato, un bersaglio risolve la propria
`Primary Action`; con una selezione risolve invece l'`Inventory Use` indicizzato
da quell'identità, dopo avvicinamento e rivalutazione sullo stato committed. Un
uso non riconosciuto raggiunge il fallback percepibile del Game Project già
stabilito.

Il successo o fallimento resta esplicito e indipendente dalle operazioni: un
successo termina la selezione, anche quando non consuma l'Object; un fallimento
la conserva. Di conseguenza un esito dichiarato fallito deve lasciare
nell'Inventory l'Object selezionato. Un gruppo dichiarativo o un Game Behavior
che prova a collocarlo o consumarlo insieme a un fallimento è invalido e viene
rifiutato atomicamente, senza correzioni silenziose.

Per la Versione 1 l'unica condizione pubblica specifica dell'inventario verifica
il possesso di un Object. Gli altri stati restano canonici e serializzati, ma
non ottengono helper pubblici finché un nuovo Example non li esercita.

Restano fuori quantità, ordinamento autoriale, combinazione fra Object,
contenitori, possesso da parte di Character, equipaggiamento, crafting,
configurazione dell'HUD e operazioni generiche sulla collocazione.
