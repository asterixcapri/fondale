# AGENTS.md

## Git workflow

Fase attuale del progetto: design/pre-produzione.

In questa fase tutto il lavoro va committato e pushato direttamente su `main`, senza branch di feature né PR. Questo vale finché l'utente non indica un cambio di fase (es. inizio sviluppo del codice di gioco), a quel punto questa nota va aggiornata.

## Avvio locale

In un checkout o container nuovo, installare le dipendenze e ripristinare le
skill registrate nel repository:

```sh
npm ci
npx skills experimental_install
```

Avviare quindi il server di sviluppo:

```sh
npm run dev
```

Il gioco è disponibile su `http://localhost:5173`.

Comandi di controllo:

```sh
npm run build   # type-check e build single-file in dist/
npm run verify  # test browser con Playwright
```

`playwright.config.ts` indica il percorso dell'eseguibile Chromium usato dai
test. Se il browser dell'ambiente si trova altrove, adeguare
`use.launchOptions.executablePath` prima di eseguire `npm run verify`.

## Agent skills

Le skill installate nel progetto sono ricostruibili da `skills-lock.json`; la
directory generata `.agents/` è ignorata da Git. Per ripristinarle tutte:

```sh
npx skills experimental_install
```

Per cercare, ispezionare e installare una nuova skill:

```sh
npx skills find <query>
npx skills add <owner/repo> --list
npx skills add <owner/repo> --skill <skill-name> --agent codex -y
```

Prima dell'installazione esaminare provenienza, contenuto e valutazioni di
sicurezza della skill. Dopo l'installazione verificare che `skills-lock.json`
sia stato aggiornato e committarlo; non committare `.agents/`.

Per vedere le skill attualmente disponibili nel progetto:

```sh
npx skills list
```

### Issue tracker

Issues live as markdown files under `.scratch/` (tracked in git, not ignored). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
