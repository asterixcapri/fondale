# 02 — Implementare la Camera che segue il Player Character

**What to build:** Aggiungere al renderer browser una Camera 2D transitoria che
presenta una porzione dello Scene Space nel viewport logico. Deve seguire il
Player Character con una Follow Region centrale, raggiungere dolcemente il
bersaglio senza overshoot, fermarsi ai bordi e disegnare il mondo su pixel
logici interi.

**Blocked by:** 01

**Status:** resolved

- [x] Background, Scenery, Object e Character condividono una sola trasformazione Camera.
- [x] La Camera segue il Player Character sugli assi orizzontale e verticale.
- [x] Un asse non più grande del viewport rimane all'origine.
- [x] La Camera è limitata fra zero e Scene Size meno Logical Resolution su ogni asse.
- [x] Il Player Character può muoversi dentro una Follow Region centrale prima che il bersaglio Camera cambi.
- [x] Il movimento ordinario converge dolcemente e monotonamente senza overshoot, oscillazione o deriva residua.
- [x] La trasformazione disegnata è arrotondata a pixel logici interi e conserva il profilo pixel.
- [x] Avvio, restore, ingresso in Scene e spostamento discontinuo producono uno snap prima del primo frame osservabile.
- [x] Una Scene senza Player Character visibile usa una vista deterministica all'origine.
- [x] Perspective Scale, profondità, pathfinding, Game Activity e risultato logico del movimento restano invariati.
- [x] Camera e parametri di follow non entrano nel Game State, nei Save Snapshot o nell'interfaccia pubblica.
- [x] Una fixture browser dimostra follow orizzontale, verticale e diagonale, clamp e retrocompatibilità delle Scene fisse.
