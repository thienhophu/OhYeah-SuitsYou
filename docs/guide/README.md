# Developer guide: building OhYeah-SuitsYou with Claude Code

This guide teaches you how this project is built: **spec-driven development (SDD)**, with **Claude Code agents** doing most of the typing and **you** making the decisions.

If you've never used Claude Code before, read the chapters in order. Each takes about 5–10 minutes.

| # | Chapter | You'll learn |
| --- | --- | --- |
| 1 | [Concepts](01-concepts.md) | What SDD is, why we use it, and the five stages and their gates |
| 2 | [Setup](02-setup.md) | Installing Claude Code, what loads automatically, and a first smoke test |
| 3 | [Daily workflow](03-daily-workflow.md) | A typical day, step by step, with a full worked example |
| 4 | [Writing and reviewing specs](04-writing-good-specs.md) | EARS criteria, good vs. bad examples, and the checklist before each approval |
| 5 | [Agents, skills and hooks](05-agents-and-hooks.md) | What each agent does, when to call it directly, and what the hooks block |
| 6 | [Troubleshooting and FAQ](06-troubleshooting.md) | Blocked tasks, failing checks, changing a spec mid-flight, working as a team |

## Cheat sheet

```text
/spec-status                    What's going on? What should I do next?
/spec-new "<feature idea>"      Interview → requirements.md       (you approve)
/spec-design NNN                → design.md                       (you approve)
/spec-tasks NNN                 → tasks.md                        (you approve)
/spec-implement NNN [T#|all]    Build task(s), one commit each
/spec-verify NNN                Traceability report + security review

"approve requirements for NNN"  ← how you approve (agents never approve on their own)
```

## The three rules

1. **No feature code without an approved spec.** Small fixes and chores are fine without one.
2. **Only humans approve.** An agent writes `status: approved` only after you say so.
3. **If the code needs to differ from the spec, change the spec first.**

Reference material: [`CLAUDE.md`](../../CLAUDE.md) (rules agents follow) and [`specs/README.md`](../../specs/README.md) (process and roadmap).
