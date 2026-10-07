# 2. Setup

## Prerequisites

- Node.js 22 LTS and pnpm 10
- Supabase CLI (and Docker, for the local stack)
- Git, with access to this repository
- [Claude Code](https://code.claude.com/docs). Use whichever surface you like: the terminal CLI (`claude`), the VS Code or JetBrains extension, the desktop app, or claude.ai/code in the browser. The workflow is the same on all of them.

## What loads automatically

When you start Claude Code in the repo root, it picks up everything from the repository. There's nothing to configure per developer:

| File / folder | What it gives you |
| --- | --- |
| `CLAUDE.md` | Project rules: stack, conventions, security, the SDD rules. Loaded into every session. |
| `.claude/skills/*/SKILL.md` | The `/spec-*` slash commands |
| `.claude/agents/*.md` | The `implementer`, `spec-verifier` and `security-reviewer` subagents |
| `.claude/settings.json` | Shared permissions and hooks |
| `.claude/hooks/` | Scripts the hooks run (guarding files, formatting, session start) |

> Skills, agents and settings are read **when a session starts**. If you pull changes to `.claude/`, start a new session.

### Personal settings

Don't edit `.claude/settings.json` for personal preferences. That file is shared. Use `.claude/settings.local.json` instead (git-ignored), for example to allow an extra command:

```json
{ "permissions": { "allow": ["Bash(docker ps:*)"] } }
```

## Smoke test (2 minutes)

```bash
git pull
claude            # or open Claude Code in your IDE / browser
```

Then type:

```text
/spec-status
```

You should get a table of specs with a **Next step** column. If `/spec-status` isn't recognized, you're not in the repo root, or the session started before you pulled. Restart it.

Also try asking: *"What are the security rules in this project?"* Claude should answer from `CLAUDE.md` (RLS on every table, private bucket, no secrets on the client…). If it does, the setup works.

## Cloud sessions

In a cloud session (claude.ai/code), the `session-start` hook runs `pnpm install` automatically once `package.json` exists. Commits stay in the cloud container until pushed. Ask Claude to push your branch before you close the session.

**Next:** [Daily workflow →](03-daily-workflow.md)
