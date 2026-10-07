---
name: spec-new
description: Start a new feature spec. Interviews the user, then writes specs/NNN-slug/requirements.md with user stories and EARS acceptance criteria. Use when the user wants to add or plan a new feature.
argument-hint: <feature idea or roadmap number>
---

# /spec-new: write requirements

Input: `$ARGUMENTS` is a feature idea, or a roadmap number from `specs/README.md`.

## Steps

1. Read `CLAUDE.md`, `specs/README.md` and `specs/_templates/requirements.md`. Skim existing `specs/*/requirements.md` to avoid overlap.
2. Choose the spec folder. Use the roadmap number if one matches. Otherwise use the next free `NNN` and a short kebab-case slug.
3. **Interview the user before writing.** Use AskUserQuestion with 2–4 focused questions per round about behaviour, edge cases, empty and error states, and what is out of scope. Offer a recommended option first. Skip questions that CLAUDE.md already answers. Do as many rounds as it takes, but usually no more than 3.
4. Write `specs/NNN-slug/requirements.md` from the template:
   - Every criterion uses EARS syntax and is **testable**. Avoid vague words ("fast", "nice").
   - Cover the unhappy paths: unauthenticated user, wrong couple, limits (2–6 outfits), network failure, a closed poll.
   - Include the relevant non-negotiables from CLAUDE.md (RLS, private storage, mobile-first).
   - List anything you assumed under **Open questions**.
   - `status: draft`, `updated:` today.
5. Update the roadmap row in `specs/README.md` to `requirements: draft`.
6. Summarize the requirements for the user (IDs and one line each) and ask them to approve or request changes.

## Approval

Set `status: approved` **only** when the user explicitly approves in their own words. Then update the roadmap row to `requirements: approved` and suggest `/spec-design NNN`.

Do not write a design, tasks or code in this step.
