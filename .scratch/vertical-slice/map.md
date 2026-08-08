# Mappa: Vertical slice giocabile

Label: `wayfinder:map`

## Destination

Una scena di Capri **giocabile nel browser**: il vicolo, a 426x240, con Michele che cammina (pathfinding sul poligono, scaling per profondità), almeno un walk-behind, un hotspot esaminabile, un dialogo e un enigma a due passaggi.

Serve a misurare due numeri che nessuna discussione può darci: **quanto costa davvero una scena** una volta che il motore esiste, e **se la stima di 4.000-8.000 righe di motore regge**. Il documento tecnico è un sottoprodotto del codice che funziona, non il traguardo.

Il tetto contro il rischio "costruisco un motore invece di un gioco": si costruisce solo ciò che serve a far funzionare *questa* scena.

## Notes

**Dominio:** avventura grafica punta-e-clicca, Capri 1535. Il documento di progetto è `docs/capri-adventure-game-handoff.md` — leggerlo prima di decidere qualsiasi cosa di narrativa o estetica.

**Divisione del lavoro: l'agente lavora in autonomia.** L'umano è il designer e il committente — genera i fondali con l'AI, decide narrativa ed estetica, giudica il risultato. Tutto il resto è dell'agente: il motore, il codice, **la derivazione delle aree camminabili e delle maschere**, e **la verifica di giocabilità nel browser**. L'umano non rilegge il codice, non allestisce le scene e non fa da collaudatore.

Ne discendono due vincoli non negoziabili su ogni ticket che produce codice:

1. **Deve essere verificabile senza umani.** Chromium e Playwright sono disponibili in ambiente: il gioco si avvia, si clicca e si fotografa a comando. Un ticket non è risolto finché l'agente non ha *visto* funzionare la cosa, non quando il codice sembra giusto.
2. **L'allestimento delle scene è un problema dell'agente, non un lavoro manuale da delegare.** Aree camminabili, maschere di foreground e hotspot si ricavano dal fondale e si validano per sovrapposizione visiva.

**Esecuzione dentro la mappa:** questa mappa deroga al "pianifica, non fare" di wayfinder. La destinazione è un artefatto costruito, non una decisione: i ticket di prototipo producono codice funzionante, non raccomandazioni.

**Fase di git:** tutto direttamente su `main`, senza branch né PR. Vedi `AGENTS.md`.

**Skill da consultare:** `/grilling` e `/domain-modeling` per i ticket di discussione; `/prototype` per quelli di prototipo; `/tdd` per il codice del motore.

## Decisions so far

Decisioni prese nella sessione di charting, prima che la mappa esistesse:

- **Destinazione = vertical slice, non documento** — le incognite rischiose di un'avventura grafica non sono decidibili a tavolino.
- **Stack: TypeScript + PixiJS, su web** — [ricerca completa](research/adventure-engines.md). AGS escluso (editor solo Windows, l'umano è su Linux); Visionaire escluso (closed source, prezzo non verificabile, versione gratuita ferma a 25 scene); Popochiu è un plugin giovane senza giochi commerciali verificabili. Pesano invece: corpus di training più ampio = minor tasso di errore dell'agente, distribuzione via link, e proprietà a lungo termine di una base di codice che l'umano può far mantenere da chiunque.
- **Risoluzione: 426x240, 16:9** — la via Thimbleweed Park (stanze 320x128 / 428x172). I fondali AI a 1586x992 reggono benissimo la riduzione: verificato quantizzando a 64 colori. Il ritaglio a 16:9 costa 100px di cielo, invisibili.
- **Sprite: circa 100px in primo piano, 60 in fondo** — budget di animazione identico al VGA classico, ed è la voce di costo che decide tutto.
- **Logica degli enigmi: dichiarativa, non imperativa** — precondizioni ed effetti come dato, non `if` sparsi negli script. Rende il grafo delle dipendenze esplicito e permette un verificatore automatico di completabilità e stati insolubili. È il modo in cui compensiamo i vent'anni di casi limite che un motore maturo avrebbe già assorbito.
- **L'editor visuale è una pagina web che costruiamo noi** — scioglie il conflitto tra "serve un editor col mouse" e "l'agente non può cliccare in una GUI".
- **Tracker: markdown locale sotto `.scratch/`**, versionato su git.

Ticket chiusi:

- [01 — Sprite di Michele](issues/01-sprite-di-michele.md) — scelto e misurato
  lo sheet v4; `tools/build_sprite.py` produce la striscia laterale usata dal
  gioco. Frontale, retro e riallineamento della palette restano debiti
  dichiarati.
- [02 — Pipeline dei fondali](issues/02-pipeline-fondali.md) — `tools/process_background.py`: ritaglio al rapporto d'aspetto, riduzione, quantizzazione. Palette per scena, 64 colori, senza dithering. Dimensioni parametriche, così il ticket 04 non costringe a riscrivere.
- [03 — Modello dati di scena](issues/03-modello-dati-di-scena.md) — stanze
  TypeScript tipizzate, poligoni di foreground con baseline, scala a fermate e
  coordinate in spazio-stanza.
- [05 — Allestimento automatico](issues/05-allestimento-automatico-scene.md) —
  coordinate ricavate dal fondale e validate ridisegnando dal dato reale
  walkable area, maschere, hotspot e uscite con `?debug`.
- [06 — Motore di rendering](issues/06-motore-di-rendering.md) — scena a
  426x240 con scala intera, nearest-neighbour, movimento continuo e animazione
  a 10 fps, scaling per profondità e walk-behind ordinato per baseline.
- [10 — Banco di verifica nel browser](issues/10-banco-di-verifica-nel-browser.md) — `npm run verify` apre il gioco nel Chrome di sistema, aspetta il primo fotogramma, fotografa. Fa fallire errori di console e risorse mancanti.

## Not yet specified

- **Palette condivisa tra tutte le scene** — emersa chiudendo il ticket 02. Darebbe coerenza cromatica al gioco intero e renderebbe quasi gratuiti gli effetti di palette (notte, tramonto, lampi). Giudicabile solo quando le scene saranno abbastanza da vedere se stonano tra loro.
- **Audio** — musica, effetti, eventuale doppiaggio. Nessuna idea ancora di che ruolo abbia.
- **Salvataggi** — il modello dichiarativo li rende quasi gratuiti (serializzi lo stato globale), ma il formato e la UI non sono stati guardati.
- **Impacchettamento desktop / Steam** — Tauri o Electron, achievement, overlay. Si decide solo se e quando il progetto punta alla vendita.
- **Localizzazione** — il gioco nasce in italiano; se deve uscire anche in inglese cambia il modo di scrivere i dialoghi fin da subito. Va guardato prima di scrivere molti dialoghi, non dopo.
- **Mappa di viaggio tra le località** e struttura lineare o semi-aperta.
- **Ritratti nei dialoghi**, HUD, ciclo giorno/notte.
- **Come si produce il resto degli sprite** — NPC, animazioni ambientali. Dipende interamente da come va il ticket su Michele.

## Out of scope

Fuori dalla destinazione di *questa* mappa — non dal progetto:

- Le altre location (Sorrento, Amalfi, Procida, Ischia, Napoli) e le restanti scene di Capri.
- La trama: identità del marinaio, nome della nave, cosa accadde all'ammutinamento, antagonista, finale. È il "prossimo passo consigliato" del documento di progetto e merita una mappa sua.
- Il sistema di enigmi *del gioco completo*. Qui ne validiamo il meccanismo con un enigma solo.
