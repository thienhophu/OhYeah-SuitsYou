---
spec: NNN-slug
doc: design
status: draft
updated: YYYY-MM-DD
requirements: approved   # design may only be written against approved requirements
---

# NNN: Feature name, design

## Overview

How the feature works end to end, in a few sentences. Include a sequence or flow diagram (mermaid) if it helps.

## Data model and migrations

New or changed tables, columns, constraints, indexes and triggers. Give the migration file name(s).

```sql
-- sketch, not final
```

## Security (RLS / Storage / secrets)

| Table / bucket | Operation | Policy | Covers |
| --- | --- | --- | --- |
| | select | member of couple | R1.2 |

## API / server logic

RPCs, Edge Functions and Realtime channels, with their inputs, outputs and errors.

## Frontend

- **Routes:**
- **Components** (`src/features/<feature>/…`):
- **State / queries:** TanStack Query keys, mutations, invalidation
- **States to handle:** loading, empty, error, offline

## Requirement mapping

| Requirement | Design element(s) |
| --- | --- |
| R1.1 | |

## Test plan

| Criterion | Level (unit / component / db / e2e) | Test file |
| --- | --- | --- |
| R1.1 | unit | `src/features/…/x.test.ts` |

## Risks and alternatives considered

-
