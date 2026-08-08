# Definire Fondale come libreria per progetti esterni

Type: grilling
Status: resolved
Blocked by: 02, 03, 10, 11, 15, 17

## Question

Quali entry point, file pubblicati, dipendenze e comandi minimi servono affinché
un repository esterno TypeScript con Vite installi `@asterixcapri/fondale`,
sviluppi l'Example e produca una build statica con asset visivi e salvataggi?
Il prototipo deve provare questo solo percorso supportato usando la
documentazione pubblicata col pacchetto, senza conoscenza del repository del
motore, scaffolding, CLI generale o compatibilità con più bundler e framework.

## Answer

Fondale 1.0 è distribuito come libreria `@asterixcapri/fondale` e deve poter
essere installato e usato da un `Game Project` TypeScript in un repository
indipendente, senza accesso ai sorgenti o agli interni del motore.

Il pacchetto espone dalla sola radice l'interface pubblica già stabilita e
include il codice eseguibile, i tipi e la documentazione necessari a usarla.
PixiJS e le altre dipendenze dell'implementazione restano possedute e nascoste
dal pacchetto: il progetto esterno non le importa né configura Fondale tramite
import profondi.

Il `Game Project` continua a possedere la propria applicazione, gli asset, lo
storage dei `Save Snapshot` e il processo con cui sviluppa e distribuisce il
gioco. Fondale non introduce un proprio sistema di build, scaffolding, CLI o
plugin. L'Example esterno costruito con Vite resta la prova di accettazione che
la libreria è realmente consumabile, non una promessa che Fondale possieda la
build o supporti esplicitamente ogni bundler.

Non occorre un prototipo separato di packaging: l'Example e la sua verifica
contro il pacchetto distribuito forniranno la prova concreta durante
l'implementazione.
