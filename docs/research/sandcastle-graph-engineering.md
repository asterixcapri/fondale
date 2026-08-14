# Sandcastle and dependency-graph execution

Date: 2026-08-14

## Question

Can Fondale use `@ai-hero/sandcastle` to implement dependency-linked tickets
concurrently, and how does that relate to the current “graph engineering”
discussion?

This note evaluates the installed Sandcastle 0.12.0 package, Fondale's current
runner, and Sandcastle's first-party documentation and source at the matching
release.

## Short answer

Yes, but not with Fondale's current runner configuration.

Sandcastle supplies the execution primitives needed for a dependency graph:
separate named branches and worktrees, concurrent `run()` calls, commit
collection, and reusable sandboxes. Its official `parallel-planner` template
implements a round-based frontier scheduler: plan the currently unblocked
issues, run one worker per issue with `Promise.allSettled`, then serialize
integration through one merge agent before planning the next frontier.
[Sandcastle describes the parallel templates explicitly](https://github.com/mattpocock/sandcastle/blob/v0.12.0/README.md#templates),
and the [0.12.0 template is the executable reference](https://github.com/mattpocock/sandcastle/blob/v0.12.0/src/templates/parallel-planner/main.mts).

Fondale currently makes one awaited `run()` call with `maxIterations: 100`,
`noSandbox()`, and `branchStrategy: { type: "head" }`. Those iterations are
serial. Each one asks an agent to discover the first implementable ticket and
work on exactly that ticket. There is no harness-owned dependency parser,
claim operation, fan-out, or merge phase in the current runner.

## What “graph engineering” means here

The term is informal rather than a Sandcastle API or a new graph algorithm. In
this coding-agent context, the useful interpretation is to make the workflow an
executable graph:

- nodes are bounded agent jobs or deterministic verification/integration jobs;
- dependency edges decide when a job becomes eligible;
- all eligible nodes form the **frontier** and may fan out concurrently;
- fan-in waits for the frontier, verifies its outputs, and integrates them;
- success, failure, retry, and human escalation are explicit state transitions.

Sandcastle's planner prompt uses the same model: it asks an agent to build a
dependency graph and return only unblocked issues. It also treats overlapping
files or an API shape established by another issue as blocking edges, not only
explicit product dependencies. That is an important safety property for coding
work, where two logically independent tickets may still contend on the same
code.
[See the first-party planner prompt](https://github.com/mattpocock/sandcastle/blob/v0.12.0/src/templates/parallel-planner/plan-prompt.md).

The graph is therefore more than “run several agents.” It is the combination
of scheduling, isolation, durable state, verification, and controlled
integration around those agents.

## Sandcastle 0.12.0 behaviour

### Concurrency and dependencies

- A single `run({ maxIterations: N })` is a sequential loop; it does not create
  `N` concurrent agents.
- Concurrency is authored by the caller. The official parallel template maps
  the selected issues to separate `run()` calls and awaits them with
  `Promise.allSettled`.
- Sandcastle itself does not understand Fondale's Markdown `Blocked by` fields.
  The stock template delegates graph construction to a planner agent over the
  issue listing supplied by the configured tracker. A Fondale runner should
  parse the explicit local edges deterministically instead of asking a model to
  infer edges already recorded in the tickets.
- `Promise.allSettled` keeps sibling workers running when one fails. Only
  fulfilled workers that produced commits enter the stock merge phase.
- The outer round loop replans after integration, which is how newly unblocked
  tickets become eligible.

### Branches, worktrees, and merges

Sandcastle offers three branch strategies:

- `head`: write directly into the host working directory; no worktree;
- `branch`: use an explicitly named branch in its own worktree and leave the
  commits there;
- `merge-to-head`: use a temporary branch/worktree and automatically merge it
  back into the host's current branch.

The first-party documentation describes these semantics and recommends
`merge-to-head` as an automation default for a single run.
[See “How it works”](https://github.com/mattpocock/sandcastle/blob/v0.12.0/README.md#how-it-works).

For concurrent workers, only distinct named branches are safe. Sandcastle's
own ADR states that `head` shares a working directory and concurrent
`merge-to-head` calls race on the same Git index and HEAD. Even session
forking does not isolate branches or worktrees; the caller must give every
concurrent child a distinct branch.
[Sandcastle ADR 0018](https://github.com/mattpocock/sandcastle/blob/v0.12.0/docs/adr/0018-fork-is-session-only.md).

Named worker branches are not automatically merged. The stock parallel
template runs one merger agent on the host after all workers settle. Its prompt
merges branches one at a time, resolves conflicts, and runs verification. This
is agent-managed conflict resolution, not a transactional or deterministic
merge service. If the merger stops midway, the host can be left in an
in-progress merge and needs deliberate recovery.

### Progress, failures, and retries

- Sandcastle reports per-run iterations, commits, branch, output, and captured
  session identifiers. It does not own ticket state or enforce a ticket state
  machine.
- The official templates rely on tracker commands and prompts to list, claim or
  close work. Fondale's local Markdown tracker has no atomic claim primitive,
  so two generic “pick the first ticket” workers can select the same file.
- `maxIterations` is repeated execution of a prompt, not automatic retry of a
  failed agent process.
- In the stock parallel template, a rejected worker is logged and omitted from
  merge; successful siblings remain usable. A later planning round can select
  unfinished work again, but the template does not encode a retry limit or
  escalation policy.
- Sandcastle has targeted retry support for malformed structured output by
  resuming the same agent session, but the stock planner at 0.12.0 does not set
  `maxRetries`; malformed planner output aborts that orchestration run.
- On failures or aborts, Sandcastle preserves worktrees where applicable so a
  human or later run can inspect them. Dirty successful worktrees are also
  preserved rather than silently discarded.
[See the run and worktree lifecycle documentation](https://github.com/mattpocock/sandcastle/blob/v0.12.0/README.md#api).

### `noSandbox` and `head` safety

`noSandbox()` executes the agent process on the host with no container
boundary. In Sandcastle 0.12.0 it does not automatically pass Claude Code's
`--dangerously-skip-permissions`, but any permissions granted by the host agent
configuration still apply to the host. It is process placement, not an
authorization or filesystem boundary.
[See the no-sandbox provider source](https://github.com/mattpocock/sandcastle/blob/v0.12.0/src/sandboxes/no-sandbox.ts).

Combining it with `head` means the agent writes directly into the user's active
working directory. For Fondale this is currently especially risky because the
working tree contains unrelated modified, deleted, and untracked art assets,
including a root-level API-key file. A worker could read host files, overwrite
another worker's edits, or accidentally include unrelated changes in a commit.
Running two such workers concurrently would add filesystem and Git races on top
of that existing contamination.

## Recommendation for Fondale's four-ticket DAG

The accepted graph is:

```text
01 ──┬──> 02 ──┬──> 04
     └──> 03 ──┘
```

The correct execution plan is:

1. Run ticket 01 alone and integrate it into `main`.
2. From the exact integrated commit, run tickets 02 and 03 concurrently in two
   distinct named branches/worktrees.
3. Wait for both, verify each branch, then integrate them serially into `main`.
   After the second merge, run the full build and browser verification because
   the combined result is the real fan-in boundary.
4. Run ticket 04 only after both 02 and 03 are integrated and verified.

Do not adapt the current `head` runner by merely wrapping multiple calls in
`Promise.all`. Build a small deterministic scheduler around the recorded local
ticket edges:

- the harness, not a worker, resolves the frontier;
- it assigns an exact ticket path and unique branch to every worker;
- it records a claim before launch and a terminal result after completion;
- workers never choose their own ticket;
- fan-out uses distinct named branches and worktrees;
- integration is single-writer and serialized;
- deterministic verification gates status changes and downstream release;
- failed work has bounded retries, then becomes a human-visible failure rather
  than being selected forever.

Use Docker or Podman for unattended implementation workers unless there is a
specific reason they need host access. A named worktree with `noSandbox` avoids
the shared-tree race but still exposes the host, so it is weaker isolation.

There is one policy decision before implementation: Fondale's current
`AGENTS.md` says all alpha work must be committed and pushed directly to `main`
without feature branches. Safe concurrent writers require temporary named
branches/worktrees. Either explicitly permit orchestration-only temporary
branches that are merged serially and never published as review branches, or
retain serial implementation on `main`. Without that exception, parallel
implementation would violate the repository workflow even if Sandcastle can
technically perform it.

For this small graph, the likely time saving is limited to the 02/03 frontier.
The value of the mechanism is therefore reliability and reuse for future DAGs,
not dramatic acceleration of these four tickets alone.
