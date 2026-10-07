---
name: spec-tasks
description: Break an approved design into small, ordered, verifiable tasks (tasks.md) linked to acceptance criteria.
argument-hint: <spec number, e.g. 003>
---

# /spec-tasks: plan the work

Input: `$ARGUMENTS` is a spec number or folder.

## Gate

`requirements.md` and `design.md` must both be `approved`. Otherwise stop and say which one isn't.

## Steps

1. Read the requirements, the design and `specs/_templates/tasks.md`.
2. Write `specs/NNN-*/tasks.md`:
   - Each task fits in one commit (roughly fewer than 300 changed lines) and leaves `main` green.
   - Order: migrations and RLS (with policy tests) first, then server logic, data hooks, UI, and finally e2e.
   - Each task lists **Covers** (criterion IDs), **Files**, **Done when** and **Verify** (an exact command).
   - Every criterion ID in the requirements is covered by at least one task. Check this, and list any uncovered IDs. There must be none.
   - Mark tasks that can run in parallel (no shared files, no dependency) with `(parallel)`.
3. Update the roadmap row in `specs/README.md` to `tasks: draft`. Show the task list and ask for approval.

## Approval

Set `status: approved` only on the user's explicit approval. Update the roadmap row to `ready to implement` and suggest `/spec-implement NNN`.
