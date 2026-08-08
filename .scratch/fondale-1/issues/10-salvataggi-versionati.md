# Definire salvataggi, caricamento e migrazioni

Type: grilling
Status: open
Blocked by: 04, 07

## Question

Quale stato deve essere persistito, quali parti devono essere ricostruite, come
sono identificati gioco e versione del formato, e quale punto di migrazione è
offerto a un progetto? La decisione deve prevenire la serializzazione casuale
degli interni del renderer e permettere errori comprensibili su dati non validi.
