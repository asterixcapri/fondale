# 03 — Il modello dati di una scena

Type: grilling
Status: open

## Question

Definire cosa *è* una stanza come dato: il formato che l'editor scrive e che il motore legge.

Deve coprire almeno: fondale, poligono camminabile, maschere di foreground (cosa passa davanti al personaggio), scala del personaggio in funzione della posizione verticale, hotspot con le loro aree, punti e destinazioni di uscita, posizioni di partenza.

Decisioni da prendere:

- le maschere di foreground come **immagini** (PNG con canale alfa, ritagliate dal fondale) o come **poligoni**? Le prime sono precise e si ricavano dal fondale, i secondi sono leggeri e si disegnano nell'editor.
- la scala del personaggio come **due punti interpolati** (in fondo 55%, davanti 100%) o come **zone** con valori distinti?
- il poligono camminabile: singolo, o più poligoni con collegamenti?
- file per scena o registro unico? Formato TypeScript tipizzato o JSON?

È il ticket che sblocca quasi tutto il resto: sia l'editor sia il motore leggono questo formato.
