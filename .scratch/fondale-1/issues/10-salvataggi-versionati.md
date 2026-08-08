# Definire salvataggi, caricamento e migrazioni

Type: grilling
Status: open
Blocked by: 04, 08, 09, 15

## Question

Qual è il più piccolo snapshot JSON-safe, versionato e validato con cui Fondale
salva soltanto uno stato committed e lo ripristina deterministicamente, inclusa
la `Game Activity` dominante? La decisione deve identificare progetto e formato,
escludere definizioni e interni derivati e rifiutare dati corrotti o versioni
incompatibili; slot, UI, storage, cloud e migrazioni fra versioni non ancora
esistenti non appartengono al motore 1.0.
