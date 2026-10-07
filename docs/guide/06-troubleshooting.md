# 6. Troubleshooting and FAQ

## Common situations

### "Requirements for NNN are not approved"

That's the gate doing its job. Review the document and say `approve requirements for NNN`, or edit `status: approved` yourself if you've reviewed it outside Claude.

### A task is marked `[!]` blocked

`/spec-implement` stops after 2 failed attempts and writes the reason next to the task. Read it, then pick one:

| Cause | Fix |
| --- | --- |
| The task is too big | Ask: *"split T5 of 004 into smaller tasks"*, review, re-approve tasks.md |
| The design is wrong or incomplete | Update design.md (it goes back to `draft`), re-approve, adjust the tasks |
| An environment problem (Supabase not running, missing env variable) | Fix it (`supabase start`, `.env.local`), then `/spec-implement NNN T5` |
| A genuinely flaky test | Make the test deterministic. Never skip or delete it to get green. |

### I want to change a requirement mid-implementation

1. Stop implementing.
2. Edit `requirements.md` (or ask Claude to). It goes back to `draft`. Re-approve it.
3. `/spec-design NNN`: Claude updates the affected parts. Re-approve.
4. `/spec-tasks NNN`: Claude adds or changes tasks. Tasks already done stay `[x]` unless they need rework. Re-approve.
5. Continue `/spec-implement`.

It feels slow the first time. It's much faster than discovering three weeks later that the code and spec disagree.

### The agent edited files outside the task

Say so right away: *"T3 changed src/app/router.tsx, which isn't in its file list. Revert that part or explain why it's needed."* The orchestrator is supposed to catch this, but you're the last line of defence.

### `/spec-verify` shows ⚠️ partial

Usually a test only covers the happy path. Accept the follow-up tasks Claude proposes and run `/spec-implement NNN` again.

### The hook blocked my migration edit, but the migration was never deployed

The guard treats any migration **committed to git** as applied, because a teammate may already have run it. Write a new migration. If you're certain nobody has it (e.g. your own unpushed commit), you can make the edit yourself outside Claude.

## FAQ

**Do I need a spec for a typo or a dependency bump?**
No. Specs are for behaviour changes. Bug fixes that change no requirement, chores, and refactors can go straight in, with a Conventional Commit.

**A bug shows the spec was wrong. Now what?**
Fix the spec first (add or adjust the criterion), then fix the code with a test named after that criterion. The bug can't come back silently.

**How do we work as a team?**
- One spec per branch: `spec/NNN-slug`.
- Optionally, open a PR with **just the spec docs** first so teammates can review requirements and design before any code exists. Merging it is the approval: the approver sets `status: approved`.
- Number new specs in the roadmap table on `main` first, to avoid two people claiming `005`.
- Keep `.claude/settings.json` changes in their own reviewed PRs, since they affect everyone.

**Can Claude run the whole thing unattended?**
Not yet, by design. An autonomous loop for the **implement** stage is planned once the flow has proven itself. See "Later: autonomous loop" in [`specs/README.md`](../../specs/README.md). Approvals will always stay human.

**Which Claude Code surface should I use?**
Any. CLI, IDE extension, desktop and web all read the same `CLAUDE.md`, skills, agents and hooks.

**Where do I learn more about Claude Code itself?**
https://code.claude.com/docs covers skills, subagents, hooks and settings.

---

← [Back to the guide index](README.md)
