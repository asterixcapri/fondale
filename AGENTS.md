# AGENTS.md

## Git workflow

Current project phase: alpha design/pre-production.

During this phase, commit and push all work directly to `main`, without feature
branches or pull requests. This remains in effect until the user announces a
phase change, such as the start of game-code development; update this note when
that happens.

Never add a co-author trailer for a coding agent to a commit. Commits record the
person who owns the work, not the tools used to produce it.

## Project language

Use English for the ubiquitous language, source code, code comments, and public
interfaces. Follow the canonical terms in `CONTEXT.md`. Planning issues and
human discussion may be written in Italian.

## Local development

In a fresh checkout or container, install dependencies and restore the skills
registered in the repository:

```sh
npm ci
npx skills experimental_install
```

Then start the development server:

```sh
npm run dev
```

The server exposes the browser-test fixtures used by the Engine verification.

Verification commands:

```sh
npm run build   # type-check and build the library package in dist/
npm run verify  # run browser tests with Playwright
```

The tests use Playwright's `chrome` channel and require Google Chrome. If it is
not available in the environment, install it with:

```sh
npx playwright install chrome
```

`npm run build` also exercises the Runtime Asset normaliser, which requires
ImageMagick 7 — the `magick` command — on the PATH.

## Agent skills

The skills installed for this project can be reconstructed from
`skills-lock.json`; the generated `.agents/` directory is ignored by Git. To
restore all skills:

```sh
npx skills experimental_install
```

To find, inspect, and install a new skill:

```sh
npx skills find <query>
npx skills add <owner/repo> --list
npx skills add <owner/repo> --skill <skill-name> --agent codex -y
```

Before installation, inspect the skill's provenance, contents, and security
assessments. After installation, verify that `skills-lock.json` was updated and
commit it; leave `.agents/` uncommitted.

To list the skills currently available in the project:

```sh
npx skills list
```

Use the project content skills for their owning definitions:

- `skills/define-scene/SKILL.md` for Scenes fabricated against a game's own
  world contract: geometry measured at 1:1, the Walkable Region, Perspective
  Scale, placeholder and finished artwork, and the `SceneDefinition`;
- `skills/define-character/SKILL.md` for Characters fabricated against a game's
  own world contract: target height, generation, normalisation, Appearances,
  Animations and the `CharacterDefinition`;
- `skills/define-object/SKILL.md` for Objects fabricated against a game's own
  world contract: the world target measured beside the carrying Character, the
  Inventory Appearance on the UI scale, the lifecycle, the Noun and the
  `ObjectDefinition`;
- `skills/define-dialogue/SKILL.md` for narrative authority, Character Knowledge,
  Disclosure, authored Conversation, and Knowledge-Driven Dialogue.

`docs/agents/visual-direction.md` now records Capri 1535's own visual choices
alone: the three fabrication skills are portable to any game and take their
scale and their art direction from that game's `docs/game/world.md`.

Their `SKILL.md` files are generated: see `skills/shared/README.md` before
changing any of them.

### Issue tracker

Issues live as Markdown files under `.scratch/`, which is tracked by Git. See
`docs/agents/issue-tracker.md` when working with issues or specs.

### Triage labels

Use the five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md` when triaging
issues.

### Domain docs

The repository uses a single domain context: `CONTEXT.md` and `docs/adr/` at the
repository root. See `docs/agents/domain.md` when changing the domain model or
recording architectural decisions.
