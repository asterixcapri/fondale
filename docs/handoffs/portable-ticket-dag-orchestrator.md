# Handoff: portable ticket-DAG orchestration skill

## Goal

Create a project skill that executes implementation tickets according to their
recorded dependency graph. Independent tickets run concurrently in isolated Git
worktrees. Integration into the main branch remains single-writer and serial.

The skill should run in both Codex and Claude Code. It orchestrates an existing
single-ticket implementation skill; it does not duplicate that implementation
workflow.

## Starting point

The originating project uses Matt Pocock's engineering flow:

```text
idea -> grill-with-docs -> to-spec -> to-tickets -> implement
```

`to-tickets` produces self-contained tickets with explicit `Blocked by` edges.
`implement` handles one assigned ticket: it uses TDD where appropriate, runs
typechecking and tests, performs code review, and commits to the current branch.
The surrounding `ask-matt` guidance intentionally starts each `implement` run
with fresh context loaded from the ticket.

The missing capability is orchestration across multiple tickets. The new skill
should supply only that capability.

## Responsibility split

```text
ticket-DAG skill
  - reads ticket state and dependency edges
  - computes the frontier
  - claims exact tickets
  - creates isolated worktrees
  - starts and collects parallel subagents
  - integrates successful commits serially
  - runs fan-in verification
  - recomputes the frontier

implement skill
  - implements exactly one assigned ticket
  - follows the project's TDD and review workflow
  - verifies the ticket in its worktree
  - commits the result to the worker branch
```

If the target project does not have Matt Pocock's `implement` skill, identify
the project's equivalent single-ticket workflow first. Keep that workflow
behind the same orchestration seam.

## Terms

- **Node:** one implementation ticket.
- **Edge:** a recorded `Blocked by` dependency.
- **Frontier:** every unresolved, unclaimed ticket whose blockers are resolved.
- **Fan-out:** launching one worker for every selected frontier ticket.
- **Fan-in:** waiting for those workers, then integrating and verifying their
  results serially.
- **Worker:** a subagent assigned one exact ticket and one exact worktree.

## Required ticket contract

Each ticket must expose, in a deterministic machine-readable convention:

```md
**Blocked by:** 01, 02
**Status:** ready-for-agent
```

Settle one canonical state machine before building the skill. The originating
project currently has two conventions that must not be mixed accidentally:

- triage roles such as `ready-for-agent` and `ready-for-human`;
- wayfinding states such as `claimed` and `resolved`.

A minimal execution state machine could be:

```text
ready-for-agent -> claimed -> ready-for-human -> resolved
                         \-> failed
```

The exact states are a project decision. Whatever is selected, the scheduler
must define which state is eligible, which state counts as a satisfied blocker,
and which transitions occur before launch, after worker completion, and after
integration.

## Execution algorithm

### 1. Discover

1. Read the repository instructions and issue-tracker documentation.
2. Read every ticket in the supplied issues directory.
3. Parse ticket identity, status, and blocker identities.
4. Fail before launching workers if a blocker is missing, duplicated, cyclic,
   or unparseable.

Discovery is complete when every open ticket has a validated node and every
blocking identity resolves to exactly one node.

### 2. Select and claim the frontier

1. Treat a blocker as satisfied only in the project's chosen terminal state.
2. Select every eligible ticket, capped by configured concurrency.
3. Persist claims before launching any worker so two orchestrators cannot select
   the same ticket.
4. Assign each worker the exact ticket path; workers never select their own
   work.

Selection is complete when every launched ticket has one durable claim and one
worker assignment.

### 3. Isolate

1. Record the exact base commit containing all previously integrated work.
2. Create one named branch and Git worktree per selected ticket from that base.
3. Install or restore dependencies inside each worktree as required by the
   target project.
4. Keep secrets and unrelated untracked files out of worker worktrees unless a
   reviewed allowlist explicitly requires them.

Isolation is complete when every worker writes to a distinct directory and
branch, while all workers in the frontier share the same base commit.

### 4. Fan out

Launch all selected workers before waiting for any one worker. Each worker gets
this task packet:

```text
Ticket: <absolute or repository-relative ticket path>
Parent spec: <spec path>
Worktree: <absolute worktree path>
Base commit: <commit>
Required workflow: invoke the existing implement skill
Verification: <commands from the project>
Completion report: status, commit, verification, blockers
```

Each subagent starts with a fresh context window. It should reconstruct context
from durable repository sources: repository instructions, the assigned ticket,
the parent spec, domain and architecture documentation, the relevant code, and
the implementation skill. The orchestration must not depend on inheriting the
planning conversation.

Fan-out is complete when all selected workers are running independently.

### 5. Collect

Wait for every worker in the current frontier. Preserve successful sibling
results when another worker fails. A worker is eligible for integration only if
it:

- completed the assigned ticket and no other ticket;
- produced a commit on its assigned branch;
- reported the required verification as passing;
- left no unexplained dirty state in its worktree.

Collection is complete when every worker has a terminal result: successful,
failed, or escalated for human help.

### 6. Fan in

1. Integrate successful worker commits into the main branch one at a time.
2. Run the target project's fast verification after each integration.
3. Run the complete build and verification suite after the whole frontier is
   integrated; this combined state is the real correctness boundary.
4. Use the project's merge-conflict workflow when integration is non-trivial.
5. Transition a ticket to the chosen terminal state only after its commit is
   integrated and the required gates pass.

Fan-in is complete when the main branch is verified, ticket states match what
was actually integrated, and failures remain visibly unresolved.

### 7. Continue

Reread ticket state and recompute the frontier. Repeat only after the previous
fan-in is complete. Stop when all tickets are resolved or the remaining graph
has no executable frontier.

## Example

For this graph:

```text
01 --+--> 02 --+--> 04
     +--> 03 --+
```

the scheduler must produce these rounds:

```text
round 1: 01
round 2: 02 and 03 concurrently
round 3: 04
```

If `03` fails, the successful `02` result may be retained or integrated according
to project policy, but `04` remains blocked until `03` reaches the required
terminal state.

## Portable skill shape

Keep the shared skill host-neutral:

```text
run-ticket-graph/
├── SKILL.md
├── scripts/
│   ├── inspect-graph.mjs
│   ├── create-worktree.sh
│   └── verify-integration.sh
└── references/
    └── ticket-contract.md
```

The deterministic scripts should parse and validate the graph, create safe
worktrees, and run verification. The `SKILL.md` should instruct the host agent
to use its native subagent mechanism rather than naming a host-specific tool.

Suggested user-invoked frontmatter:

```yaml
---
name: run-ticket-graph
description: Execute a directory of implementation tickets by dependency frontier.
disable-model-invocation: true
---
```

`disable-model-invocation` is supported by the current local skill pack but is
not part of the portable core. Confirm frontmatter extensions in each host and
remove host-specific keys from the shared source when necessary.

The skill's central instruction should be:

```md
For every selected frontier ticket, create a distinct Git worktree and spawn one
subagent assigned to that exact ticket. Launch all workers before waiting. Each
worker must invoke the project's existing single-ticket implementation skill.
Collect all results, then integrate successful commits serially and verify the
combined state before releasing downstream tickets.
```

## Host installation

Both Codex and Claude Code use the Agent Skills `SKILL.md` format, but discover
project skills from different locations.

```text
Codex:       .agents/skills/run-ticket-graph/
Claude Code: .claude/skills/run-ticket-graph/
```

Keep one canonical source and install, copy, or link it into each host's
discovery location. In the originating Fondale repository, `.agents/` is
generated and ignored, so the canonical source belongs under `skills/` and the
repository's skill installation command should regenerate host registrations.

Invocation also differs:

```text
Codex:       $run-ticket-graph <issues-directory>
Claude Code: /run-ticket-graph <issues-directory>
```

The workflow language should remain neutral: “spawn one subagent per frontier
ticket” rather than naming Codex or Claude tool calls.

## Safety constraints

- Start with maximum concurrency `2`.
- Use parallel agents freely for read-heavy work; require distinct worktrees for
  write-heavy work.
- Keep the main checkout single-writer during integration.
- Resolve the exact worktree and branch paths before any cleanup operation.
- Never stage or commit unrelated changes from the user's checkout.
- Never copy an entire dirty checkout into worker worktrees.
- Treat merge and full verification as serial fan-in operations.
- Bound retries and expose exhausted work as a human-visible failure.
- Do not mark a ticket resolved merely because its worker stopped.

## Prototype acceptance cases

Prove the mechanism in a disposable repository before using it on production
work:

1. A four-ticket graph schedules `01`, then `02/03`, then `04`.
2. `02` and `03` run in distinct filesystem directories from the same base
   commit.
3. Two concurrent schedulers cannot claim the same ticket.
4. Failure of `03` leaves `04` blocked while preserving the result of `02`.
5. A worker with no commit is not treated as complete.
6. A worker with failing verification is not integrated.
7. A merge conflict stops automatic integration or invokes the project's
   explicit conflict-resolution workflow.
8. Full verification runs after the complete frontier is integrated.
9. A dry-run mode prints the rounds, assignments, branches, and commands without
   creating worktrees or starting agents.

The prototype is successful only when the observed execution order, isolation,
ticket states, and failure behavior match every case above.

## Decisions still required in the new project

Settle these before implementation:

1. What exact ticket states form the execution state machine?
2. Is integration supervised by a human or unattended?
3. May successful siblings be integrated when another frontier worker fails?
4. Which fast gate runs after each merge, and which full gate runs after fan-in?
5. How are claims made atomically for the selected issue tracker?
6. Which ignored files, if any, may be copied into worktrees?
7. What retry limit and escalation state should apply?
8. Are temporary orchestration branches permitted by the repository's Git
   policy?

For a first trial, prefer supervised integration, two workers, no automatic
conflict resolution, no copied secrets, and a dry-run preview before fan-out.

## Source context

The design came from comparing three approaches:

- Claude Code agent teams and subagents;
- Codex subagent workflows and managed worktrees;
- Sandcastle's parallel-planner pattern.

The settled conclusion is not tied to one host: use the repository's durable
ticket graph as the scheduler input, existing `implement` as the single-ticket
worker workflow, isolated worktrees for concurrent writes, and serial verified
integration as the fan-in boundary.
