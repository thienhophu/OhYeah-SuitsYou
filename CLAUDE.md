# CLAUDE.md

Guidance for Claude Code when working in this repository. Read `README.md` for the product overview.

## Product in one paragraph

A mobile-first PWA for **couples**. Partner A creates a **poll** of 2–6 **outfits** (one photo each, optional caption). Partner B **swipes** right (like) or left (pass) on each outfit. Results rank outfits by likes. Either partner can create polls, and only the *other* partner votes. Polls can have an optional **deadline**. Past polls form a shared **wardrobe history**.

## Stack

- React 18+, Vite, TypeScript (strict), Tailwind CSS
- `vite-plugin-pwa` (Workbox, `injectManifest` strategy so we can handle `push` events in a custom SW)
- Supabase: Postgres + RLS, Auth (magic link only), Storage (private bucket), Realtime, Edge Functions (Deno)
- Web Push (VAPID) sent from an Edge Function
- Netlify hosting (SPA, deploy previews on PRs)
- pnpm, ESLint, Prettier, Vitest + Testing Library, Playwright, GitHub Actions

## Commands

```bash
pnpm dev            # dev server
pnpm build          # tsc + vite build
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit
pnpm test           # vitest
pnpm test:e2e       # playwright (mobile viewports)
pnpm db:types       # supabase gen types typescript --local > src/lib/database.types.ts
supabase start      # local stack
supabase db reset   # re-apply migrations + seed
supabase migration new <name>
```

Before considering a change done, run: `pnpm lint && pnpm typecheck && pnpm test`.

## Suggested project layout

```
src/
  app/            # routes, layout, providers
  features/
    auth/         # magic-link sign-in, session
    couple/       # invite code, pairing
    polls/        # create poll, poll list, results
    vote/         # swipe deck
    history/      # wardrobe gallery
    push/         # subscribe/unsubscribe, permission UX
  components/     # shared UI primitives
  lib/            # supabase client, database.types.ts, image utils
  sw.ts           # custom service worker (precache + push + notificationclick)
supabase/
  migrations/     # SQL migrations (source of truth for schema + RLS)
  functions/      # edge functions (send-push, close-expired-polls)
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
- Expired polls are closed by a scheduled job (`pg_cron` or a scheduled Edge Function). The UI should also treat `deadline_at < now()` as closed.

## Security and privacy (non-negotiable)

- **RLS on every table.** Access is scoped via `couple_members`: a user may only read and write rows belonging to their own couple. Write a test for each policy.
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
- Use function components and hooks. Prefer TanStack Query (or a thin equivalent) for server state over ad-hoc `useEffect` fetching.
- Tailwind for styling. No CSS-in-JS.
- Tests: unit-test pure logic (ranking, image resize, deadline handling). Component-test the swipe deck. Cover the main flow end to end in Playwright with a mobile device profile: sign in → pair → create poll → vote → results.
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:` …).

## Out of scope for MVP (don't build unless asked)

Comments on outfits, an offline upload queue, dark mode, i18n (EN/VI), groups beyond couples, OAuth providers, and native app wrappers.

## Open questions

- Tie-break flow when multiple outfits are liked
- Can a couple "unpair"? What happens to shared history (delete vs. keep for each user)?
- Poll editing after creation (probably not once voting has started)
- Retention policy for old photos
