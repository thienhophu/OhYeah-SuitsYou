---
spec: NNN-slug
doc: tasks
status: draft
updated: YYYY-MM-DD
design: approved
---

# NNN: Feature name, tasks

Rules: each task is small (one sitting, one commit), independently verifiable and ordered by dependency. Write the tests first.
Mark a task done with `[x]` and the commit SHA. Mark it blocked with `[!]` and a reason.

- [ ] **T1: <title>**
  - Covers: R1.1, R1.2
  - Files: `supabase/migrations/…`, `src/features/…`
  - Done when: <observable outcome>
  - Verify: `pnpm test -- <pattern>`

- [ ] **T2: <title>**
  - Depends on: T1
  - Covers:
  - Files:
  - Done when:
  - Verify:
