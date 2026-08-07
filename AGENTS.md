# AGENTS.md

## Git workflow

Fase attuale del progetto: design/pre-produzione.

In questa fase tutto il lavoro va committato e pushato direttamente su `main`, senza branch di feature né PR. Questo vale finché l'utente non indica un cambio di fase (es. inizio sviluppo del codice di gioco), a quel punto questa nota va aggiornata.

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/` (tracked in git, not ignored). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
