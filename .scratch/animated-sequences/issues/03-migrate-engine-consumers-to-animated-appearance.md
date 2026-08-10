# 03 — Migrare i consumatori dell'Engine al nuovo Appearance

**What to build:** adottare il nuovo Appearance con Default Animation e Animation Role in tutti i consumatori posseduti dalla libreria, mantenendo invariati gli esempi percepibili e lasciando la compatibilità legacy soltanto dove deve ancora essere migrata separatamente.

**Blocked by:** 02 — Applicare gli Animation Role automatici.

**Status:** ready-for-human

- [x] Sorgenti, fixture e test posseduti dall'Engine usano la nuova forma Appearance anziché le forme static e walking precedenti.
- [x] Le recipe pubbliche mostrano Default Animation statica, Default Animation in loop e ruoli speaking e walking.
- [x] La documentazione pubblica spiega Appearance, Animation e Animation Role con il vocabolario canonico.
- [x] Gli esempi percepibili esistenti conservano immagini, camminata, ancoraggio e comportamento precedenti dopo la migrazione.
- [x] I test compilano le recipe contro la sola radice pubblica del pacchetto e non importano tipi interni.
- [x] Nessun oggetto PixiJS, callback di frame o dettaglio del renderer compare nell'authoring migrato.
- [x] La compatibilità legacy rimane disponibile per Capri e altri consumatori non ancora migrati.
- [x] Build e verifica complete rimangono verdi al termine di questo batch di migrazione.
