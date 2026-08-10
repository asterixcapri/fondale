# 01 — Espandere Appearance con Animation

**What to build:** permettere a un Author di dichiarare su ogni Appearance di Character, Object e Scenery una Default Animation, anche composta da un solo fotogramma, e osservarne il playback nel gioco senza interrompere i Game Project che usano ancora temporaneamente le forme Appearance precedenti.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [x] La nuova forma Appearance possiede Animation nominate e identifica una Default Animation obbligatoria.
- [x] Una Default Animation può usare un solo fotogramma e presenta correttamente un elemento statico.
- [x] Character, Object e Scenery riproducono la propria Default Animation quando nessun'altra performance li dirige.
- [x] Frame, frequenza e modalità di playback sono dichiarativi e non espongono oggetti o termini del renderer.
- [x] Le risorse di tutte le Animation raggiungibili vengono caricate prima dell'avvio insieme agli altri asset del Game Project.
- [x] Risorse mancanti o indecodificabili, conteggi dei frame invalidi e frequenze non positive producono Authoring Diagnostic aggregati e contestuali.
- [x] Il fotogramma corrente e la fase di un loop restano presentazione derivata e non compaiono nel Game State o nel Save Snapshot.
- [x] Le forme Appearance precedenti continuano a compilare e comportarsi come prima durante la fase di espansione.
- [x] Una fixture browser e una recipe pubblica dimostrano Default Animation statica e animata usando soltanto l'interface pubblica.
- [x] Build e verifica complete rimangono verdi.
