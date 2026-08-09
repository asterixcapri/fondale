# 03 — Il modello dati di una scena

Type: grilling
Status: resolved

## Question

Definire cosa *è* una stanza come dato: il formato che l'editor scrive e che il motore legge.

Deve coprire almeno: fondale, poligono camminabile, maschere di foreground (cosa passa davanti al personaggio), scala del personaggio in funzione della posizione verticale, hotspot con le loro aree, punti e destinazioni di uscita, posizioni di partenza.

Decisioni da prendere:

- le maschere di foreground come **immagini** (PNG con canale alfa, ritagliate dal fondale) o come **poligoni**? Le prime sono precise e si ricavano dal fondale, i secondi sono leggeri e si disegnano nell'editor.
- la scala del personaggio come **due punti interpolati** (in fondo 55%, davanti 100%) o come **zone** con valori distinti?
- il poligono camminabile: singolo, o più poligoni con collegamenti?
- file per scena o registro unico? Formato TypeScript tipizzato o JSON?

È il ticket che sblocca quasi tutto il resto: sia l'editor sia il motore leggono questo formato.

## Answer

Status: resolved

`src/engine/room.ts`. Le stanze sono **moduli TypeScript tipizzati**, non JSON: un'uscita che punta a una stanza inesistente o una voce mancante fanno fallire la compilazione invece della partita. Nessuno rilegge questi diff, quindi il controllo deve farlo il compilatore.

Decisioni prese sulle domande aperte:

- **Maschere di foreground come poligoni, non come immagini.** Il poligono ritaglia il *fondale stesso*, che viene ridisegnato sopra il personaggio. Costo in arte: zero. E non può andare fuori registro con il dipinto da cui proviene, cosa che un PNG esportato a parte prima o poi fa. Ogni maschera ha una `baseline`: la y dove l'oggetto tocca terra, che decide chi sta davanti a chi.
- **Scala come lista di fermate interpolate linearmente**, non due punti fissi né zone. Due fermate danno la rampa classica (55% in fondo, 100% davanti); fermate aggiuntive la piegano dove la prospettiva non è lineare — una scalinata, un molo che esce in mare. Un caso copre entrambi.
- **Poligoni camminabili multipli trattati come una regione unica.** Un cortile unito al vicolo che ne esce non richiede casi speciali.
- **Coordinate in spazio-stanza**, 0,0 in alto a sinistra. Niente nella definizione di una stanza sa della finestra o del fattore di scala.

Il vicolo è definito in `src/rooms/vicolo-capri.ts`.
