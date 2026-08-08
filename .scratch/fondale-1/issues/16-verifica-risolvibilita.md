# Definire il confine della verifica di risolvibilità

Type: grilling
Status: resolved
Blocked by: 07

## Question

Fondale 1.0 deve offrire una capacità generale che analizzi condizioni,
operazioni e stato raggiungibile per trovare enigmi bloccati, oppure questa
verifica deve restare uno strumento specifico del `Game Project`? La decisione
deve distinguere le garanzie possibili sui casi dichiarativi da quelle
impossibili in presenza di `Game Behavior` TypeScript opachi, senza promettere
una prova completa della risolvibilità quando il modello non la consente.

## Answer

Il verificatore generale di risolvibilità è oltre la destinazione di Fondale
1.0: l'Example e i suoi test Playwright verificano il percorso costruito, senza
promettere un solver del modello generale in presenza di `Game Behavior`
opachi. L'eventuale capacità richiederà un nuovo effort, non è una promessa
della Versione 2.
