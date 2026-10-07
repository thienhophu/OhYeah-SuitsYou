# 1. Concepts

## Why spec-driven?

AI agents write code fast, and they write the *wrong* code just as fast if the goal is fuzzy. A spec fixes the goal *before* any code exists:

- **You** spend your time on decisions: what should happen, which edge cases matter, what's out of scope.
- **Agents** spend their time on execution: migrations, components, tests.
- **Everyone** can check the result against a written contract instead of a memory of a chat.

A one-line prompt like *"add couple pairing"* leaves dozens of questions open (Do invites expire? Can you re-pair? What if your partner is already paired?). The agent would answer them silently, and you'd find out in production. In SDD these questions are answered in writing, by you, up front.

## The five stages

```
 Requirements ──▶ Design ──▶ Tasks ──▶ Implement ──▶ Verify
   WHAT            HOW        STEPS      CODE          PROOF
   👤 gate         👤 gate    👤 gate    ✅ checks      ✅ all criteria covered
```

| Stage | File | Answers | Written by | Approved by |
| --- | --- | --- | --- | --- |
| Requirements | `requirements.md` | *What* should the user experience, including failures? | Claude, after interviewing you | You |
| Design | `design.md` | *How* will it work: tables, RLS, components, tests? | Claude | You |
| Tasks | `tasks.md` | In what small, safe *steps* do we build it? | Claude | You |
| Implement | code + tests | Build one task per commit | `implementer` agent | Automated checks + your review |
| Verify | `verification.md` | Is every criterion really tested? Is it secure? | `spec-verifier` + `security-reviewer` | You (done ✅) |

Each spec lives in its own folder, e.g. `specs/003-couple-pairing/`.

### Gates

Every document has front-matter:

```yaml
---
spec: 003-couple-pairing
doc: requirements
status: draft      # ← draft | approved
---
```

Each command checks the previous document's status and **refuses to run** if it isn't `approved`. That's what keeps an agent from rushing from a vague idea straight to code.

## Key building blocks

### EARS acceptance criteria

Requirements are written in **EARS** (Easy Approach to Requirements Syntax), a few fixed sentence patterns that force testable statements:

| Pattern | Template | Example |
| --- | --- | --- |
| Event | `WHEN <trigger> THE SYSTEM SHALL <response>` | WHEN the voter swipes right THE SYSTEM SHALL record a like for that outfit. |
| Unwanted | `IF <bad condition> THEN THE SYSTEM SHALL <response>` | IF the poll author tries to vote THEN THE SYSTEM SHALL reject the vote. |
| State | `WHILE <state> THE SYSTEM SHALL <response>` | WHILE a poll is closed THE SYSTEM SHALL hide the swipe deck. |
| Always | `THE SYSTEM SHALL <behaviour>` | THE SYSTEM SHALL store outfit photos in a private bucket. |

### IDs and traceability

Every criterion has an ID (`R2.3` = requirement 2, criterion 3). The ID travels through everything:

```
requirements.md   R2.3  IF a poll already has 6 outfits THEN THE SYSTEM SHALL reject another.
design.md         R2.3 → check constraint + trigger on outfits
tasks.md          T2  Covers: R2.3
test              it('R2.3: rejects a 7th outfit', …)
commit            feat(polls): enforce 2–6 outfits per poll [004/T2]
```

That's how `/spec-verify` can prove that every promise in the spec has a test that would fail if the promise broke.

### Agents

The main Claude Code session is the **orchestrator**. It talks to you, writes specs, and hands focused jobs to **subagents**, each with its own fresh context:

- `implementer` builds exactly one task.
- `spec-verifier` audits coverage (read-only).
- `security-reviewer` audits privacy and security (read-only).

More in [chapter 5](05-agents-and-hooks.md).

**Next:** [Setup →](02-setup.md)
