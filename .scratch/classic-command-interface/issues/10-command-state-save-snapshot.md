# 10 — Command State nei Save Snapshot

**What to build:** salvare e ripristinare esattamente una frase incompleta o
sospesa, mantenendo separate le preferenze locali del Player.

**Blocked by:** 05 — Command binari Give e Use; 09 — Choice nel HUD inferiore.

**Status:** ready-for-human

- [x] Il Game State e il Save Snapshot includono Verb selezionato ed eventuale primo Noun mediante identità stabili.
- [x] Un Command incompleto ripristinato produce la stessa successiva risoluzione di una sessione non interrotta.
- [x] Un Command sospeso durante una Choice viene ripristinato correttamente dopo save, load e completamento del dialogo.
- [x] Hover, puntatore, pagina visuale transitoria e Player Preferences non fanno parte del Save Snapshot.
- [x] Snapshot con Command State malformato o riferimenti non più validi vengono rifiutati con diagnostiche precise.
- [x] La validazione mantiene identità e versione del Game Project e resta disponibile dalla package root.
- [x] Test di equivalenza confrontano sessione ininterrotta e sessione ripristinata per Command unari e binari.
