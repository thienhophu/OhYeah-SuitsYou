---
name: spec-verify
description: Verify an implemented spec. Builds a traceability report from acceptance criteria to code and tests, runs all checks, and runs a security review.
argument-hint: <spec number>
---

# /spec-verify: prove it's done

Input: `$ARGUMENTS` is a spec number.

## Steps

1. Run `pnpm lint && pnpm typecheck && pnpm test`, and `pnpm test:e2e` if the spec has e2e rows in its test plan. Record the results.
2. Launch in parallel:
   - the **`spec-verifier`** subagent, given the spec folder path, to build the traceability matrix
   - the **`security-reviewer`** subagent, given the spec's commits (`git log --grep "\[NNN/"`), if the spec touches data, storage, auth or push
3. Write `specs/NNN-*/verification.md` containing:
   - the check results
   - the traceability table: `| Criterion | Status (✅ covered / ⚠️ partial / ❌ missing) | Code | Test(s) |`
   - security findings and their resolution
   - any drift between spec and code
4. If anything is ❌ or a security finding is blocking, propose follow-up tasks. Append them to tasks.md as `draft` and ask the user. Don't mark the spec done.
5. If everything is ✅ and checks are green, set the roadmap row to `done ✅` and tell the user.
