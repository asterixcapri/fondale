# 01 — Introdurre il contratto Scene Size

**What to build:** Separare l'estensione completa di una Scene dalla Logical
Resolution del viewport. L'Author deve poter dichiarare una Scene Size 2D
opzionale, con default retrocompatibile, geometria validata nello Scene Space
completo e Background runtime delle dimensioni esatte dichiarate. Registrare i
termini canonici e la decisione architetturale insieme al contratto.

**Blocked by:** None — can start immediately

**Status:** resolved

- [x] Il dominio distingue Logical Resolution, Scene Size e Camera senza termini concorrenti.
- [x] Una Scene accetta una Scene Size opzionale con larghezza e altezza intere positive.
- [x] L'omissione usa la Logical Resolution e conserva il comportamento delle Scene esistenti.
- [x] Ogni asse della Scene Size deve essere almeno pari al corrispondente asse della Logical Resolution.
- [x] Walkable Region, Perspective Scale, Scenery, Background Region, Hotspot, Passage, Approach Point ed Entrance sono validati contro la Scene Size.
- [x] I Ground Point iniziali di Character e Object sono validati contro la Scene Size della propria Scene.
- [x] Il Background deve corrispondere esattamente alla Scene Size e la diagnostica riporta dimensioni effettive e attese.
- [x] Il valore risolto è immutabile e disponibile agli interni dell'Engine senza esporre PixiJS.
- [x] I test attraversano `defineScene`, `defineGame` e `startGame`; non introducono seam interne dedicate.
- [x] Le Scene prive di Scene Size e i relativi Save Snapshot restano compatibili.
