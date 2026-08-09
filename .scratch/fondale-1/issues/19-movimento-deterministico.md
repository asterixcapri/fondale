# 19 — Rendere deterministico il movimento nella Walkable Region

**What to build:** Il Player muove con un vero click un Character dentro la
Walkable Region dell'Example. Il movimento attraversa un core deterministico a
passo fisso, resta valido indipendentemente dal frame rate e può essere
verificato senza esporre il Game State o una seam pubblica di test.

**Blocked by:** 18 — Pubblicare un Game Project a una Scene dal pacchetto root.

**Status:** ready-for-human

- [x] Una Scene dichiara una sola Walkable Region poligonale statica; geometria
      degenerata, auto-intersecante o fuori dallo Scene Space viene rifiutata.
- [x] Un Character persistente dichiara posizione iniziale, Ground Point,
      orientamento e Appearance statico nella Scene.
- [x] Un click sul mondo viene tradotto dallo schermo allo Scene Space e crea
      un Player Intent senza rendere pubblici renderer o coordinate fisiche.
- [x] Una destinazione esterna viene ricondotta deterministicamente al punto
      raggiungibile geometricamente più vicino;
      il Character non attraversa bordi e non viene teletrasportato.
- [x] Un nuovo Player Intent sostituisce immediatamente quello in corso invece
      di accodarsi.
- [x] Il core riceve input ordinati e passi logici espliciti e restituisce
      snapshot committed ed effetti; browser adapter e test adapter usano la
      stessa seam interna.
- [x] A parità di Game Project, Game State, input e passi logici, due esecuzioni
      producono gli stessi snapshot ed effetti indipendentemente dal ritmo del
      renderer.
- [x] Una scheda sospesa riprende dal passo successivo senza recuperare in
      blocco il tempo reale trascorso.
- [x] Playwright esercita il movimento tramite eventi reali del mouse; gli hook
      globali della vertical slice non vengono usati come prova.
- [x] Interface, comportamento deterministico, sostituzione dell'intento e casi
      di destinazione invalida sono documentati e verificati.
