# 4. Writing and reviewing specs

Claude drafts the specs, but **the quality of the spec is your responsibility**. An agent will faithfully build a bad spec. This chapter is about spotting a bad spec before you approve it.

## Good vs. bad acceptance criteria

| ❌ Bad | Why | ✅ Better |
| --- | --- | --- |
| The swipe should feel smooth. | Not testable | WHEN the voter drags a card more than 30% of its width and releases THE SYSTEM SHALL complete the swipe in that direction. |
| Users can upload photos. | Which users? How many? What fails? | WHEN the author adds photos THE SYSTEM SHALL accept 2 to 6 images. IF the author tries to add a 7th THEN THE SYSTEM SHALL disable the add button and show "Max 6 outfits". |
| Votes are secure. | Vague | IF a user who is not a member of the poll's couple submits a vote THEN THE SYSTEM SHALL reject it with a permission error. |
| Handle errors. | Which errors? | IF the photo upload fails THEN THE SYSTEM SHALL keep the poll draft and show a "Retry" action. |
| The system uses a `votes` table with RLS. | That's design, not a requirement | THE SYSTEM SHALL only show votes to the two members of the couple. |

Rules of thumb:

- **One behaviour per criterion.** If you write "and", consider splitting it.
- **Observable outcomes.** Something a test can assert: a screen, a stored row, a rejected request.
- **Requirements say *what*, the design says *how*.** No table names in requirements.

## Unhappy paths to always consider

For this app specifically, go through this list for every feature:

- [ ] Not signed in / session expired
- [ ] Signed in but **not paired** yet
- [ ] Acting on the **other couple's** data (must be impossible)
- [ ] The **author** doing something only the **voter** should do, or the reverse
- [ ] Limits: 2–6 outfits, deadline in the past, closed poll
- [ ] Slow or absent network, or an upload that fails halfway
- [ ] iOS Safari quirks: push only when installed, camera input, `100dvh`
- [ ] The empty state (first-time user, no polls yet)

## Review checklists

### Before approving requirements

- [ ] Every user story has at least one requirement.
- [ ] Every criterion uses an EARS pattern and is testable.
- [ ] The relevant unhappy paths above are covered.
- [ ] Privacy is explicit: who can see or change this data?
- [ ] **Out of scope** is listed. It's what keeps the agent from gold-plating.
- [ ] Open questions are answered or explicitly deferred.

### Before approving the design

- [ ] Every requirement ID appears in the **requirement mapping** table.
- [ ] The **security table** lists every table and bucket touched, for every operation (select/insert/update/delete).
- [ ] Business rules (author can't vote, 2–6 outfits, one couple per user) are enforced **in the database**, not just in the UI.
- [ ] Schema changes are a *new* migration.
- [ ] The test plan uses the cheapest level that proves the behaviour (unit < db < component < e2e).
- [ ] Rejected alternatives make sense. If you'd have picked one of them, say so now.

### Before approving tasks

- [ ] Each task is small (about one commit, under 300 lines) and leaves `main` green.
- [ ] The order is migrations and RLS, then server, then hooks, then UI, then e2e.
- [ ] Each task has a concrete **Verify** command.
- [ ] Every criterion ID is covered by at least one task.

## Prompts that help

```text
What edge cases are missing from 004's requirements? Don't edit yet, just list them.
Challenge the design for 005: what would break under two devices voting at once?
Which criteria in 003 would be hardest to test? Suggest rewrites.
Compare 006's design against 005's. Any inconsistencies?
```

**Next:** [Agents, skills and hooks →](05-agents-and-hooks.md)
