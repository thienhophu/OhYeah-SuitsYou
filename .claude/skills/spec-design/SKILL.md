---
name: spec-design
description: Write the technical design (design.md) for a spec whose requirements are approved. Covers schema/migrations, RLS, API, frontend, requirement mapping and test plan.
argument-hint: <spec number, e.g. 003>
---

# /spec-design: write the design

Input: `$ARGUMENTS` is a spec number or folder.

## Gate

Open `specs/NNN-*/requirements.md`. If its status is not `approved`, **stop**. Tell the user it needs approval first.

## Steps

1. Read `CLAUDE.md`, the requirements, `specs/_templates/design.md` and the designs of specs this one depends on. Read the existing code and migrations it will touch, so the design fits what actually exists.
2. For broad codebase questions, delegate to the `Explore` agent and keep only the conclusions.
3. Write `specs/NNN-*/design.md` from the template:
   - Map **every** requirement ID in the requirement mapping table. A requirement with no design element is a bug in the design.
   - Give each test-plan row a level and a planned test file. Prefer unit or db tests, and use e2e only for the main flows.
   - For security: list every table or bucket the feature touches and its RLS/Storage policy for each operation.
   - Record the alternatives you rejected and why, in one line each.
4. If designing reveals a gap in the requirements, do not fill it in silently. Ask the user, update `requirements.md` (which goes back to `draft`) and get it re-approved.
5. Update the roadmap row in `specs/README.md` to `design: draft`. Summarize the key decisions and ask for approval.

## Approval

Set `status: approved` only on the user's explicit approval. Then update the roadmap row and suggest `/spec-tasks NNN`.
