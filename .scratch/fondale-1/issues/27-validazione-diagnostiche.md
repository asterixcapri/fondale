# 27 — Rendere coerenti validazione e Authoring Diagnostic

**What to build:** Un Author che prova definizioni, riferimenti, asset, ambiente,
Game Behavior o Save Snapshot invalidi riceve dal primo livello competente una
raccolta stabile di Authoring Diagnostic che localizza il problema e non lascia
Game Project o Game Session parziali.

**Blocked by:** 24 — Eseguire un Game Behavior controllato; 26 — Salvare e
ripristinare una Choice attiva.

**Status:** ready-for-human

- [x] Ogni helper verifica forma, valori, intervalli, geometria e invarianti
      locali e lancia un solo errore con tutte le diagnostiche indipendenti.
- [x] `defineGame` verifica registri, chiavi, riferimenti, stato iniziale,
      fallback, condizioni, operazioni e finitezza e restituisce un Game Project
      soltanto quando l'insieme è valido.
- [x] La validazione di un Save Snapshot `unknown` restituisce un esito esplicito
      anziché trattare un dato esterno invalido come eccezione di programmazione.
- [x] `startGame` conserva soltanto i controlli che richiedono browser o asset e
      raccoglie tutti i fallimenti indipendenti conoscibili nello stesso
      tentativo prima di ripulire il target.
- [x] Ogni Authoring Diagnostic contiene codice stabile, famiglia stabile,
      percorso basato sui nomi autoriali, spiegazione, suggerimento sicuro
      quando disponibile e causa originale quando pertinente.
- [x] Le famiglie pubbliche coprono definizione, riferimento, stato o
      salvataggio, asset, ambiente e Game Behavior.
- [x] Le diagnostiche vengono ordinate stabilmente, raccolgono problemi
      indipendenti e sopprimono quelli puramente conseguenti.
- [x] Fondale rifiuta soltanto invalidità dimostrabili e non emette warning per
      contenuti insoliti, apparentemente inutilizzati o di risolvibilità
      incerta.
- [x] Un Game Behavior fallito conserva percorso e causa, non commette il gruppo
      e rende terminalmente fallita la Game Session.
- [x] Le prove negative coprono almeno target occupato, WebGL assente, asset
      irraggiungibile o invalido, riferimenti mancanti, operazione invalida e
      Save Snapshot corrotto o incompatibile.
- [x] Codici, famiglie, semantica del percorso e modalità di fallimento sono
      documentati come parte dell'interface pubblica.

