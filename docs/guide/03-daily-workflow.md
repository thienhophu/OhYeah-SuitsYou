# 3. Daily workflow

## A typical day

```
 ☀️ Start          🧭 Decide               🔨 Build                 🌙 Wrap up
 pull + status ──▶ write/review specs ──▶ implement + review ──▶ verify, push, PR
```

### ☀️ 1. Start of day: get your bearings (5 min)

```bash
git checkout main && git pull
claude
```

```text
/spec-status
```

Example output:

```
| Spec | Req      | Design   | Tasks    | Progress | Next step                    |
| 002  | approved | approved | approved | 5/5      | /spec-verify 002             |
| 003  | approved | draft    | –        | –        | review design, then approve  |
| 004  | draft    | –        | –        | –        | answer 2 open questions      |
```

Pick **one** spec to move forward. Finishing things beats starting things.

### 🧭 2. Decision work: specs (mornings are best)

This is the *thinking* part, so give it your attention. Depending on the stage:

| Stage | You run | Your job |
| --- | --- | --- |
| New idea | `/spec-new "…"` | Answer the interview questions. Then read the draft against the [requirements checklist](04-writing-good-specs.md#before-approving-requirements). |
| Requirements approved | `/spec-design NNN` | Read the design. Check the RLS table and the test plan especially. |
| Design approved | `/spec-tasks NNN` | Check that the tasks are small, ordered, and that every `R` ID is covered. |

To approve, just say it:

```text
approve requirements for 003
```

To request changes, be specific:

```text
R3.2 is wrong: invite codes should expire after 24h, not 48h. Also add a criterion
for what happens if the person who created the invite is already paired.
```

### 🔨 3. Build: implementation

Work on a branch per spec:

```bash
git checkout -b spec/003-couple-pairing
```

Then either go **step by step** (recommended while you're learning):

```text
/spec-implement 003          # does the next ready task, then stops
```

or **run the whole list** once you trust the spec:

```text
/spec-implement 003 all      # loops task by task; stops on any blocked task
```

For each task, Claude:

1. hands the task to the `implementer` subagent, which writes the tests first and then the code;
2. checks the diff itself and runs `lint`, `typecheck` and `test`;
3. runs `security-reviewer` if the task touched Supabase, auth or push;
4. commits it as `feat(couple): … [003/T2]` and ticks `- [x] T2 (abc1234)` in `tasks.md`.

**Your job between tasks:** skim the commit (`git show`). You don't need to read every line, but look for:

- files outside the task's **Files** list,
- tests whose names don't carry criterion IDs,
- anything that touches security (policies, `security definer`, env variables).

If something's off, tell Claude now. A correction after T2 is far cheaper than after T9.

### 🌙 4. Wrap up

When all tasks are `[x]`:

```text
/spec-verify 003
```

This writes `specs/003-couple-pairing/verification.md` with a table like:

```
| Criterion | Status | Code                                  | Test(s)                        |
| R1.1      | ✅     | supabase/migrations/…_couples.sql     | supabase/tests/couples.test.sql |
| R2.3      | ⚠️     | src/features/couple/useJoinCouple.ts  | only the happy path is tested   |
```

Fix ⚠️ and ❌ rows (Claude proposes follow-up tasks), then push and open a PR:

```text
push this branch and open a PR for spec 003
```

Not finished at the end of the day? Nothing is lost. `tasks.md` records exactly where you stopped. Tomorrow, `/spec-status` tells you the next command.

---

## Worked example: spec 003, couple pairing

An abbreviated transcript of a full cycle. **(Illustrative: real output will differ.)**

**1. Start the spec**

```text
you    /spec-new couple pairing
claude I read CLAUDE.md and the roadmap (003). A few questions:
       1. How long should an invite stay valid?  [48h (Recommended) / 24h / 7 days]
       2. If the invited person is already in a couple?  [Show error (Recommended) / Allow switching]
       3. Can a couple unpair in this spec?  [Not in this spec (Recommended) / Yes]
you    48h, show error, not in this spec
claude Draft written: specs/003-couple-pairing/requirements.md
       R1 Create invite (R1.1–R1.3) · R2 Join with code/link (R2.1–R2.5) ·
       R3 One couple per user (R3.1–R3.2) · R4 Privacy (R4.1–R4.2)
       Open question: show partner's display name before joining?
```

**2. Review and approve.** Open the file, apply the [checklist](04-writing-good-specs.md#before-approving-requirements), and answer the open question.

```text
you    yes, show their name. approve requirements for 003
```

**3. Design**

```text
you    /spec-design 003
claude Design written. Key decisions:
       • couple_invites table, code = 6 chars from an unambiguous alphabet (no 0/O/1/I)
       • join via RPC join_couple(code), security definer, search_path pinned
       • RLS: invites readable only by creator; couples/members by members
       • Rejected: client-side join (can't enforce single-couple rule atomically)
       Test plan: 9 db tests, 4 unit, 3 component, 1 e2e
you    approve design for 003
```

**4. Tasks**

```text
you    /spec-tasks 003
claude T1 migration: couples, couple_members, couple_invites + RLS + policy tests
       T2 RPC create_invite + tests (R1.*)
       T3 RPC join_couple + tests (R2.*, R3.*)
       T4 useCreateInvite / useJoinCouple hooks (parallel with T5)
       T5 /join/:code route + JoinScreen
       T6 Invite screen with share sheet
       T7 e2e: A invites → B joins → both see "paired"
       All 14 criteria covered.
you    approve tasks for 003
```

**5. Implement, review, verify**

```text
you    /spec-implement 003
claude T1 done. 3 tables, 9 policy tests passing. Security review: no blocking findings.
       Committed 4f2a9c1 "feat(couple): couples schema and RLS [003/T1]"
you    (git show 4f2a9c1, looks good)  /spec-implement 003 all
…
you    /spec-verify 003
claude 14/14 criteria ✅ · checks green · no security findings. Roadmap → done ✅
```

**Next:** [Writing and reviewing specs →](04-writing-good-specs.md)
