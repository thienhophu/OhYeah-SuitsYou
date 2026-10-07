# 5. Agents, skills and hooks

## How the pieces fit

```
                      ┌──────────────────────────────┐
  you  ◀────────────▶ │ Main session (orchestrator)  │  reads CLAUDE.md
                      │ runs /spec-* skills          │
                      └──────┬───────────┬───────────┘
              delegates one  │           │  delegates audits
              task           ▼           ▼
                  ┌────────────┐  ┌───────────────┐  ┌───────────────────┐
                  │implementer │  │ spec-verifier │  │ security-reviewer │
                  │ read/write │  │  read-only    │  │    read-only      │
                  └────────────┘  └───────────────┘  └───────────────────┘
                         │
      every Edit/Write ──┴──▶ hooks: guard-files (may block) → format (Prettier)
```

- **Skills** (`.claude/skills/`) are the playbooks behind `/spec-*`. They run in your main session, so they can ask you questions.
- **Subagents** (`.claude/agents/`) each start with a fresh context, do one focused job and report back. They **can't ask you questions**, which is why the specs need to be clear.
- **Hooks** (`.claude/settings.json`) are scripts the harness runs automatically. The model can't skip them.

## The agents

### `implementer`

Builds **exactly one task** from an approved `tasks.md`: tests first, then code, then the checks. It does **not** commit; the orchestrator reviews the diff and commits.

Usually invoked through `/spec-implement`. You can also call it directly, for example to redo a task:

```text
Use the implementer agent to redo T4 of spec 003. The previous attempt put the
query inside the component; it must live in useJoinCouple.ts.
```

### `spec-verifier`

A read-only auditor. For every criterion ID it finds the tests (`git grep "R2.3:"`), reads them, and decides whether they would actually **fail** if the behaviour broke. It marks a criterion ⚠️ partial if only the happy path is tested.

```text
Use the spec-verifier agent on specs/003-couple-pairing. Only report R2.*.
```

### `security-reviewer`

A read-only reviewer focused on this app's core promise: *a couple's photos and polls are visible only to that couple.* It checks RLS, `security definer` functions, Storage policies, secrets, Edge Functions and the client (EXIF stripping, captions rendered safely).

`/spec-implement` runs it automatically on tasks that touch `supabase/` or auth. Run it by hand before any PR that touches data:

```text
Use the security-reviewer agent on git diff main...HEAD
```

Findings come back as **blocking**, **should-fix** or **nit**, each with an exploit scenario.

## Hooks: what happens automatically

| Hook | When | What it does |
| --- | --- | --- |
| `guard-files.mjs` | Before any Edit/Write | **Blocks** edits to `src/lib/database.types.ts` (generated; run `pnpm db:types`), `.env*` except `.env.example`, and migrations already committed to git (write a new migration instead) |
| `format.mjs` | After any Edit/Write | Runs Prettier on the file once it's installed. Never fails. |
| `session-start.sh` | Session start (cloud only) | Runs `pnpm install` if `package.json` exists |

When the guard blocks something, Claude sees the reason and adjusts. You'll see a message like:

```
Blocked by .claude/hooks/guard-files.mjs: supabase/migrations/2026…_couples.sql is already committed.
Never edit an applied migration; run `supabase migration new <name>`.
```

## Permissions

`.claude/settings.json` pre-approves routine commands (pnpm scripts, local Supabase, and read-only git plus `add`/`commit`), so agents don't prompt you constantly. It **denies** anything that touches production or shared state:

- `supabase db push`, `supabase functions deploy`, `supabase secrets set`
- `git push --force`
- reading `.env`, `.env.local`, `.env.production`

Anything not listed prompts you. Deploys to Supabase are done by a human, on purpose.

## Talking to agents effectively

- **Point at the spec, not your memory:** say "per R2.3 in 003…" rather than "like we discussed".
- **Correct early:** review after the first task or two of a spec, not at the end.
- **Ask for reasons:** "why did the design choose an RPC over a direct insert?" is a good question to ask before approving.
- **Keep sessions focused:** one spec per session works best. Start a fresh session for the next spec. The specs carry the context, not the chat.

**Next:** [Troubleshooting and FAQ →](06-troubleshooting.md)
