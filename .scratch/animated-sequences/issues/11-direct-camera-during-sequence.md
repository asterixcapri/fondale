# 11 — Dirigere la Camera durante una Sequence

**What to build:** permettere alla regia di inquadrare temporaneamente l'azione nella Scene corrente con movimenti immediati o graduali, mantenimento e inseguimento di un soggetto, tornando automaticamente a seguire il Player Character al termine o allo skip.

**Blocked by:** 06 — Muovere Object e Scenery durante una Sequence; 09 — Applicare uno Skip Outcome alle Sequence dirette.

**Status:** ready-for-agent

- [ ] Un ADR registra che la Sequence può sostituire temporaneamente la Camera derivata definita da ADR-0009, conservandone transitorietà e separazione dal renderer.
- [ ] Una direzione della Sequence può riposizionare immediatamente la Camera in un punto valido dello Scene Space corrente.
- [ ] Una direzione temporizzata muove la Camera nel tempo logico e rispetta il confine dichiarato del passo.
- [ ] La regia può mantenere l'inquadratura o far seguire alla Camera un Character, Object o Scenery in movimento nella Scene corrente.
- [ ] La Camera rimane limitata ai bordi della Scene e non espone spazio esterno.
- [ ] La Camera diretta non cambia Game State, esito dei Command, Scene corrente o collocazione dei soggetti.
- [ ] Save e restore ricostruiscono l'inquadratura dal progresso della Sequence senza serializzare una Camera indipendente.
- [ ] Termine normale e skip rimuovono la direzione e fanno tornare automaticamente la Camera a seguire il Player Character.
- [ ] Riferimenti fuori dalla Scene, destinazioni invalide e durate non valide producono Authoring Diagnostic.
- [ ] Test browser verificano stacco immediato, movimento graduale, mantenimento, inseguimento e ritorno usando il Fixed Step Clock senza leggere interni PixiJS.
