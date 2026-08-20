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

The skills under `skills/` are the game-authoring pipeline: `define-story`,
`define-puzzles` and `setup-game` interview a game's author, and
`define-character`, `define-scene` and `define-object` fabricate its artwork.
They are written to be installed into a game's own repository, not used on this
one. `docs/public/building-a-game.md` is the entry point that documents the
pipeline; change it whenever a skill's `## Documents` table changes.

The three fabrication skills share `fabrication-cycle`, which owns the six steps
that turn a brief into an approved Runtime Asset and carries the only copy of
`normalise-runtime-asset.mjs`. It knows nothing about Scenes, Characters or
Objects: each caller carries a `## Fabrication definitions` section whose
headings are the names the cycle's steps ask for. Change a step's name in one
place and change it in the other four.

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

## Releasing

The two packages are published independently, each by its own tag. Pushing the
tag is the release: `.github/workflows/publish.yml` refuses a tag that disagrees
with the version its package declares, then builds, runs the full suite, and
publishes only what the tag names. Nothing is published from a workstation.

To release the Engine as `fondale`:

```sh
npm version patch          # or minor, or major
git push --follow-tags
```

To release `@fondale/dialogue-server`, whose tag `npm version` does not write
for you:

```sh
npm version patch --workspace @fondale/dialogue-server
git tag dialogue-server-v0.4.1
git push --follow-tags
```

A `minor` or `major` release changes the series the README names, and
`npm run build` fails until `README.md` says the new one. A patch leaves the
series alone.

The server's `peerDependencies` pins the Engine version it expects, so raising
the Engine alone leaves the published server declaring an incompatibility. Raise
both, or widen the range, before releasing an Engine the server has not caught
up with.
