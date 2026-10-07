---
name: spec-implement
description: Implement tasks from an approved tasks.md by delegating each task to the implementer subagent, verifying and committing one task at a time.
argument-hint: <spec number> [T# | all]
---

# /spec-implement: build it

Input: `$ARGUMENTS` is a spec number, optionally followed by a task ID (`T3`) or `all`. The default is the next unchecked task.

## Gate

`requirements.md`, `design.md` and `tasks.md` must all be `approved`. Otherwise stop.

## Loop (one task at a time)

1. Pick the task: the requested one, or the first `[ ]` task whose dependencies are all `[x]`.
2. Delegate to the **`implementer`** subagent with a self-contained prompt that includes:
   - the spec folder path and the task ID
   - the task's full text (Covers / Files / Done when / Verify)
   - the instruction to read CLAUDE.md, requirements.md and design.md first
3. When it returns, **check its work yourself. Do not trust the report alone.**
   - Look at `git diff`. Are the changes in scope, with no unrelated edits?
   - Run the task's Verify command plus `pnpm lint && pnpm typecheck && pnpm test` (whatever exists so far).
   - Do the tests carry the covered criterion IDs in their names?
4. If a check fails, send the failure back to the implementer (SendMessage) or fix it. After 2 failed rounds, mark the task `[!]` with the reason and stop to ask the user.
5. If it touches `supabase/` (migrations, RLS, storage, Edge Functions) or auth, run the **`security-reviewer`** subagent on the diff and fix any blocking findings.
6. Commit with a Conventional Commit message that references the spec and task, e.g. `feat(polls): enforce 2–6 outfits per poll [003/T2]`. Tick the task as `[x] (abc1234)` in tasks.md, in the same or a follow-up commit.
7. With `all`, continue to the next task. Otherwise report and stop.

Tasks marked `(parallel)` may be given to separate implementer subagents with `isolation: "worktree"`. Merge them back one at a time, verifying after each.

## Rules

- Don't change requirements or the design from here. If a task turns out to be wrong or impossible, stop and tell the user, then go back to `/spec-design`.
- Don't push or open PRs unless the user asks.
- When every task is `[x]`, set the roadmap row to `implemented` and suggest `/spec-verify NNN`.
