# 18 — Pubblicare un Game Project a una Scene dal pacchetto root

**What to build:** Un Author installa l'artefatto di
`@asterixcapri/fondale` in un Example TypeScript separato, dichiara una Scene
con Background attraverso la sola interface pubblica, avvia una Game Session
WebGL e produce una build statica senza conoscere PixiJS o gli interni
dell'Engine. Questo primo tracer sostituisce la forma monolitica della vertical
slice con la struttura sulla quale cresceranno le altre Engine Capability.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] Il pacchetto distribuibile usa nome `@asterixcapri/fondale`, licenza MIT,
      un solo entry point pubblico e include JavaScript, dichiarazioni di tipo
      e documentazione necessaria al primo utilizzo.
- [x] L'Example è un consumer separato che installa l'artefatto prodotto e non
      importa sorgenti interni, path profondi, PixiJS o tipi PixiJS.
- [x] Gli helper minimi compongono una Scene nominata e un Game Project opaco,
      immutabile e validato con Logical Resolution, Background e colore del
      letterbox.
- [x] `startGame` monta il Game Project in un target HTML libero, carica il
      Background prima di risolversi e restituisce una Game Session soltanto
      quando il primo frame è pronto.
- [x] Il renderer WebGL interno mostra il Background alla Logical Resolution,
      usa il profilo `pixel`, centra il quadro e applica letterbox senza crop o
      deformazioni anche a proporzioni diverse.
- [x] `stop()` è idempotente, terminale e rimuove renderer, input e risorse dal
      target; un target già occupato viene rifiutato senza montaggio parziale.
- [x] Definizione locale invalida, riferimento globale invalido, Background di
      dimensioni errate o WebGL assente producono un fallimento comprensibile
      attraverso l'interface pubblica.
- [x] Type-check, build dell'artefatto, build statica dell'Example e una prova
      browser della Scene passano usando il pacchetto installato.
- [x] Ogni export introdotto ha documentazione pubblica di scopo, uso,
      invarianti, default, errori ed esempio minimo.

