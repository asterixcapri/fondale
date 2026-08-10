# 01 — Espandere Appearance con Animation

**What to build:** permettere a un Author di dichiarare su ogni Appearance di Character, Object e Scenery una Default Animation, anche composta da un solo fotogramma, e osservarne il playback nel gioco senza interrompere i Game Project che usano ancora temporaneamente le forme Appearance precedenti.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] La nuova forma Appearance possiede Animation nominate e identifica una Default Animation obbligatoria.
- [ ] Una Default Animation può usare un solo fotogramma e presenta correttamente un elemento statico.
- [ ] Character, Object e Scenery riproducono la propria Default Animation quando nessun'altra performance li dirige.
- [ ] Frame, frequenza e modalità di playback sono dichiarativi e non espongono oggetti o termini del renderer.
- [ ] Le risorse di tutte le Animation raggiungibili vengono caricate prima dell'avvio insieme agli altri asset del Game Project.
- [ ] Risorse mancanti o indecodificabili, conteggi dei frame invalidi e frequenze non positive producono Authoring Diagnostic aggregati e contestuali.
- [ ] Il fotogramma corrente e la fase di un loop restano presentazione derivata e non compaiono nel Game State o nel Save Snapshot.
- [ ] Le forme Appearance precedenti continuano a compilare e comportarsi come prima durante la fase di espansione.
- [ ] Una fixture browser e una recipe pubblica dimostrano Default Animation statica e animata usando soltanto l'interface pubblica.
- [ ] Build e verifica complete rimangono verdi.
