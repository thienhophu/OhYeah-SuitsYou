# CLAUDE.md

Guidance for Claude Code when working in this repository. Read `README.md` for the product overview.

## Spec-driven development (read first)

All feature work follows **requirements → design → tasks → implement → verify**. The full process is in `specs/README.md`.

- **No production code without an approved spec.** If asked to build something that has no spec, suggest `/spec-new` first. Small fixes and chores are fine without one.
- Commands: `/spec-new`, `/spec-design NNN`, `/spec-tasks NNN`, `/spec-implement NNN [T#|all]`, `/spec-verify NNN`, `/spec-status`.
- **Never set `status: approved` in a spec unless the user explicitly approves it.**
- Specs win over this file on feature behaviour. This file wins on conventions and security.
- Name tests after acceptance criteria (`it('R2.3: …')`) and tag commits with `[NNN/T#]`.
- If the code needs to differ from the spec, stop and update the spec first.
- Subagents: `implementer` (builds one task), `spec-verifier` (read-only traceability audit), `security-reviewer` (RLS/storage/secrets review).

## Product in one paragraph

A mobile-first PWA for **couples**. Partner A creates a **poll** of 2–6 **outfits** (one photo each, optional caption). Partner B **swipes** right (like) or left (pass) on each outfit. Results rank outfits by likes. Either partner can create polls, and only the *other* partner votes. Polls can have an optional **deadline**. Past polls form a shared **wardrobe history**.

## Stack

Decided in the stack review (2026-10). Changing any line here needs a spec or an explicit decision from the user.

| Layer | Choice | Notes |
| --- | --- | --- |
| Runtime | Node 22 LTS, pnpm 10 | Pinned via `.nvmrc` and `packageManager` |
| UI | React 19, Vite, TypeScript (strict) | |
| Routing | React Router v7 (SPA / library mode) | |
| Server state | TanStack Query | Realtime events update or invalidate the query cache. Optimistic updates for swipes. |
| Client state | Zustand | Only for local UI/draft state (e.g. the create-poll draft). Never copy server data into it. |
| Styling / UI | Tailwind CSS v4, shadcn/ui (Radix) | Components are copied into `src/components/ui/`, and we own and edit them |
| Gestures / animation | Motion (`motion/react`) | Swipe deck drag and fling, transitions. Respect `useReducedMotion`. |
| Forms / validation | React Hook Form, Zod | Zod schemas are shared between client forms and Edge Function input parsing |
| Dates | date-fns (+ `@date-fns/tz`) | |
| PWA | `vite-plugin-pwa` (Workbox, `injectManifest`) | Custom SW in `src/sw.ts` handles `push` events |
| Backend | Supabase: Postgres + RLS, Auth (magic link only), Storage (private bucket), Realtime, Edge Functions (Deno) | |
| Scheduled jobs | `pg_cron` (+ `pg_net` to call Edge Functions) | E.g. closing expired polls every minute |
| Push | Web Push (VAPID) sent from an Edge Function | No third-party push service |
| Hosting | Netlify | SPA, deploy previews on PRs |
| Lint / format | ESLint (typescript-eslint, react-hooks, jsx-a11y), Prettier (+ Tailwind plugin) | |
| Tests | Vitest + Testing Library (unit/component), pgTAP via `supabase test db` (schema/RLS), Playwright (e2e, mobile profiles) | |
| CI | GitHub Actions | |
| Error tracking / analytics | **None for MVP** | Don't add SDKs or tracking scripts. Revisit with a spec once there are real users. |

## Commands

```bash
pnpm dev            # dev server
pnpm build          # tsc + vite build
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit
pnpm test           # vitest
pnpm test:e2e       # playwright (mobile viewports)
pnpm test:db        # supabase test db (pgTAP: schema, constraints, RLS)
pnpm db:types       # supabase gen types typescript --local > src/lib/database.types.ts
supabase start      # local stack
supabase db reset   # re-apply migrations + seed
supabase migration new <name>
```

Before considering a change done, run: `pnpm lint && pnpm typecheck && pnpm test`. If `supabase/` changed, also run `pnpm test:db`.

## Suggested project layout

```
.claude/
  settings.json   # permissions + hooks (shared, committed)
  agents/         # implementer, spec-verifier, security-reviewer
  skills/         # /spec-new, /spec-design, /spec-tasks, /spec-implement, /spec-verify, /spec-status
  hooks/          # guard-files (blocks edits to applied migrations, generated types, .env), format, session-start
docs/guide/       # developer guide: how to work with agents + SDD day to day
specs/
  README.md       # process, conventions, roadmap/status table
  _templates/     # requirements.md, design.md, tasks.md
  NNN-slug/       # requirements.md, design.md, tasks.md, verification.md
src/
  app/            # routes, layout, providers
  features/
    auth/         # magic-link sign-in, session
    couple/       # invite code, pairing
    polls/        # create poll, poll list, results
    vote/         # swipe deck
    history/      # wardrobe gallery
    push/         # subscribe/unsubscribe, permission UX
  components/     # shared UI primitives (ui/ = shadcn components)
  lib/            # supabase client, database.types.ts, image utils
  sw.ts           # custom service worker (precache + push + notificationclick)
supabase/
  migrations/     # SQL migrations (source of truth for schema + RLS)
  functions/      # edge functions (send-push, close-expired-polls)
  tests/          # pgTAP tests (*.test.sql), one per table/policy group
  seed.sql
e2e/              # playwright specs
```

Organize by feature. Keep Supabase queries in feature-level hooks/modules, not inside components.

## Domain model (draft)

| Table | Key columns | Notes |
| --- | --- | --- |
| `profiles` | `id` (= auth.users.id), `display_name`, `avatar_path` | |
| `couples` | `id`, `created_at` | |
| `couple_members` | `couple_id`, `user_id` (unique) | Max 2 per couple; a user belongs to at most one couple |
| `couple_invites` | `code` (6 chars), `couple_id`, `created_by`, `expires_at`, `used_at` | Single-use, expires (e.g. 48h) |
| `polls` | `id`, `couple_id`, `author_id`, `title`, `deadline_at` null, `status` (`open`/`closed`), `created_at`, `closed_at` | |
| `outfits` | `id`, `poll_id`, `position`, `photo_path`, `caption` | 2–6 per poll (enforce in DB) |
| `votes` | `outfit_id`, `voter_id`, `liked` bool, `created_at` | PK `(outfit_id, voter_id)` |
| `push_subscriptions` | `id`, `user_id`, `endpoint` unique, `p256dh`, `auth`, `user_agent` | Multiple devices per user |

Rules:
- The poll author **cannot vote** on their own poll. Enforce in RLS/trigger, not just UI.
- A poll is **complete** when the voter has swiped every outfit, or when `deadline_at` passes. Closing triggers a "results are in" push.
- Ranking: likes desc, then `position`. With one voter, ties are expected. Show all liked outfits as "liked" and highlight the first one as the top pick. (Open question: a tie-break "pick one" step.)
- Expired polls are closed by a `pg_cron` job (every minute), which calls the push Edge Function via `pg_net`. The UI should also treat `deadline_at < now()` as closed.

## Security and privacy (non-negotiable)

- **RLS on every table.** Access is scoped via `couple_members`: a user may only read and write rows belonging to their own couple. Write a pgTAP test for each policy, impersonating a member, the partner and an outsider.
- The Storage bucket `outfits` is **private**. Path convention: `{couple_id}/{poll_id}/{outfit_id}.webp`. Storage policies check couple membership from the first path segment. Display images with signed URLs (short TTL).
- Never ship the service role key or VAPID private key to the client. Those keys belong only in Edge Function secrets.
- Strip EXIF/GPS on the client before upload (re-encoding through a canvas does this).

## Image pipeline

On the client, before upload: decode, apply EXIF orientation, resize the longest edge to **1600px**, encode **WebP** (quality ~0.8, JPEG fallback), and upload. Target under 400 KB per photo. Use `createImageBitmap` and `OffscreenCanvas` where available. Keep this in `src/lib/image.ts` with unit tests.

## PWA and mobile guidelines

- Design for a **375×667** viewport first, then scale up. Use touch targets of at least 44px and safe-area insets (`env(safe-area-inset-*)`).
- Use `100dvh`, not `100vh`.
- The swipe deck supports touch drag with a velocity threshold, and also **buttons** (like/pass) and keyboard arrows for accessibility. Respect `prefers-reduced-motion`.
- Camera capture: `<input type="file" accept="image/*" capture="environment">` with a gallery fallback (`multiple`).
- Manifest: `display: standalone`, portrait orientation, maskable icons, theme color.
- Service worker: precache the app shell; **never cache** Supabase API or signed image URLs with long TTLs.
- **iOS push** works only when the app is installed to the Home Screen (iOS 16.4+). Detect this and show an "Add to Home Screen" hint instead of a broken permission prompt.
- Ask for push permission only after a user gesture (e.g. after pairing), never on first load.

## Realtime

Subscribe to `polls`/`votes` changes for the current couple so the author sees votes arrive live while the app is open. Push covers the case where the app is closed.

## Conventions

- TypeScript strict. No `any`. Use generated `database.types.ts` for Supabase types and never edit it by hand.
- Every schema change is a new migration in `supabase/migrations/`. Never edit an applied migration.
- Use function components and hooks. Server state goes through TanStack Query, never ad-hoc `useEffect` fetching. Zustand is only for client-only state.
- Tailwind for styling. No CSS-in-JS. Start from shadcn/ui components before building new primitives.
- Tests: unit-test pure logic (ranking, image resize, deadline handling). Component-test the swipe deck. Cover the main flow end to end in Playwright with a mobile device profile: sign in → pair → create poll → vote → results.
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:` …), with `[NNN/T#]` appended for spec tasks.
- Local overrides go in `.claude/settings.local.json` (git-ignored), not in the shared `settings.json`.

## Out of scope for MVP (don't build unless asked)

Comments on outfits, an offline upload queue, dark mode, i18n (EN/VI), groups beyond couples, OAuth providers, and native app wrappers.

## Open questions

- Tie-break flow when multiple outfits are liked
- Can a couple "unpair"? What happens to shared history (delete vs. keep for each user)?
- Poll editing after creation (probably not once voting has started)
- Retention policy for old photos
