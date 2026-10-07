# Specs

This project uses **spec-driven development**. No production code is written without an approved spec. A spec is the contract between you (the product owner) and the agents doing the work.

## The flow

```
 /spec-new        /spec-design       /spec-tasks        /spec-implement      /spec-verify
┌────────────┐   ┌────────────┐    ┌────────────┐     ┌────────────────┐    ┌────────────┐
│requirements│──▶│  design    │──▶ │   tasks    │──▶  │ code + tests   │──▶ │ traceability│
│   .md      │   │   .md      │    │   .md      │     │ (1 task/commit)│    │   report    │
└────────────┘   └────────────┘    └────────────┘     └────────────────┘    └────────────┘
   👤 approve       👤 approve        👤 approve           🤖 implementer        🤖 verifier
                                                                             🤖 security-reviewer
```

| Step | Command | Output | Gate |
| --- | --- | --- | --- |
| 1. Requirements | `/spec-new <idea>` | `specs/NNN-slug/requirements.md`: user stories plus EARS acceptance criteria | You approve |
| 2. Design | `/spec-design NNN` | `design.md`: schema, RLS, components, data flow, test plan | You approve |
| 3. Tasks | `/spec-tasks NNN` | `tasks.md`: small, ordered, checkbox tasks linked to criteria | You approve |
| 4. Implement | `/spec-implement NNN [T#]` | Code, tests and one commit per task (done by the `implementer` subagent) | Checks must pass |
| 5. Verify | `/spec-verify NNN` | A report mapping every criterion to code and tests, plus a security review | All criteria covered |

`/spec-status` shows where every spec stands.

### Approval gates

Each spec document has front-matter with `status: draft | approved`. Agents **never** set `approved` themselves. A document is approved only when you say so explicitly (e.g. "approve requirements for 003"), or when you edit the file yourself. Each step refuses to start until the previous document is approved.

### Changing your mind

Specs are living documents. If implementation reveals that a requirement is wrong, stop, update `requirements.md` (it goes back to `draft`), re-approve it, then update the design and tasks to match. Never let code drift silently from the spec.

## Conventions

- **Folder:** `specs/NNN-kebab-slug/` with a 3-digit, increasing number.
- **Requirement IDs:** `R1`, `R2` … Acceptance criteria are `R1.1`, `R1.2` …
- **EARS syntax** for acceptance criteria:
  - `WHEN <trigger> THE SYSTEM SHALL <response>`
  - `IF <unwanted condition> THEN THE SYSTEM SHALL <response>`
  - `WHILE <state> THE SYSTEM SHALL <response>`
  - `THE SYSTEM SHALL <always-true behaviour>`
- **Tasks:** `T1`, `T2` … Each task names the criteria it satisfies.
- **Traceability:** test names start with the criterion ID, e.g. `it('R2.3: rejects a 7th outfit', …)`. The verifier finds coverage by searching for these IDs.

## Roadmap

| # | Feature | Status |
| --- | --- | --- |
| [001](001-project-scaffold/) | Project scaffold (Vite, PWA, Tailwind, Supabase, lint/test, CI, Netlify) | requirements: approved |
| 002 | Auth: magic-link sign-in, profile | not started |
| 003 | Couple pairing: invite code/link, join, single-couple rule | not started |
| 004 | Create poll: capture or pick 2–6 photos, client image pipeline, upload | not started |
| 005 | Swipe vote: deck, like/pass, author can't vote | not started |
| 006 | Results and realtime: ranking, live vote updates | not started |
| 007 | Poll deadline: countdown, auto-close job | not started |
| 008 | Push notifications: subscribe, new-poll and results pushes, iOS install hint | not started |
| 009 | Wardrobe history: gallery of past polls and winners | not started |

Update this table when a spec changes stage (the `/spec-*` commands do this).

## Later: autonomous loop (parked)

Not built yet. Turn this on once the manual flow has proven trustworthy over a few specs. Only the **implement** step should ever loop. Requirements, design and task approval stay with a human.

- [ ] `scripts/spec-loop.sh NNN`: runs `claude -p "/spec-implement NNN" --permission-mode acceptEdits` once per task, each in a fresh context. It stops when no `[ ]` tasks remain, on a `[!]` blocked task, on a non-zero exit, or at a maximum run count. When done, it runs `/spec-verify NNN`.
- [ ] Optional Stop hook that keeps a session working while `[ ]` tasks remain. Active only with `SPEC_LOOP=1`, with an iteration cap.
- [ ] Possibly later: a cloud Routine that picks up specs marked "ready to implement", and a multi-agent Workflow for tasks marked `(parallel)`.

Signals that it's ready to try: specs pass `/spec-verify` on the first try, implementer runs rarely need correcting, and the security reviewer finds nothing blocking.
