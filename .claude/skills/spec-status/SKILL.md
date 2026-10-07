---
name: spec-status
description: Show the status of every spec (requirements/design/tasks approval, task progress) and suggest the next command to run.
---

# /spec-status

1. For each `specs/NNN-*/` folder, read the front-matter `status` of requirements.md, design.md and tasks.md, and count `[x]` / `[ ]` / `[!]` tasks.
2. Compare the results with the roadmap table in `specs/README.md`. Fix the table if it has drifted, and say so.
3. Print a compact table: `| Spec | Req | Design | Tasks | Progress | Next step |`, where Next step is the exact command to run, e.g. `/spec-design 003` or "approve requirements".
4. Point out any blocked `[!]` tasks and unresolved open questions.

This command only reads, apart from fixing drift in the roadmap table.
