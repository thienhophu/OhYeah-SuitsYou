# OhYeah-SuitsYou 👗👔

> *"Oh yeah, that suits you."* Let your partner pick your outfit with a swipe.

OhYeah-SuitsYou is a mobile-first **Progressive Web App** for couples. One partner snaps 2–6 outfit photos, and the other swipes through them, liking or passing on each one. The outfit with the most love wins. It works both ways: either partner can ask, and either partner can vote.

## Why

- **"Which one for dinner tonight?"** Get an answer in seconds while you're still in front of the mirror.
- **"What do I pack for the wedding next week?"** Set a deadline and let your partner vote when they have time.
- **"What did I wear last time?"** Keep a shared history of past polls and winning outfits.

## Features (MVP)

| Feature | Description |
| --- | --- |
| 💑 **Couple pairing** | Sign up, then invite your partner with a link or 6-character code. Each couple is a private 1:1 space. |
| 📸 **Create a poll** | Take or pick 2–6 photos (one per outfit) and add a short caption to each. Photos are resized and stripped of location data on your phone before upload. |
| 👉 **Swipe to vote** | Your partner swipes right (like) or left (pass) on each outfit. Results rank the outfits by likes. |
| 🔔 **Push notifications** | Your partner is notified when a new poll arrives, and you are notified when the votes are in. |
| ⏰ **Poll deadline** | Optional "vote by" time with a countdown. The poll closes automatically when time runs out. |
| 🗂️ **Wardrobe history** | A gallery of past polls and their winners. |
| 📲 **Installable PWA** | Add it to your Home Screen for a full-screen, app-like experience. The app shell works offline. |

## Tech stack

- **Frontend:** React 19, Vite, TypeScript, React Router v7, TanStack Query, Zustand, Tailwind CSS v4, shadcn/ui, Motion (swipe gestures), React Hook Form + Zod, date-fns
- **PWA:** [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) (Workbox, custom service worker)
- **Backend:** [Supabase](https://supabase.com/) for Postgres + RLS, Auth (magic link), Storage, Realtime, Edge Functions and `pg_cron`
- **Notifications:** Web Push (VAPID), sent from a Supabase Edge Function
- **Hosting:** Netlify
- **Tooling:** Node 22 LTS, pnpm 10, ESLint, Prettier, Vitest, Testing Library, pgTAP, Playwright, GitHub Actions
- **Monitoring and analytics:** none for MVP (by design)

## Getting started

### Prerequisites

- Node.js 22 LTS and [pnpm](https://pnpm.io/) 10
- [Supabase CLI](https://supabase.com/docs/guides/cli) (local Supabase runs on Docker)

### Setup

```bash
pnpm install
cp .env.example .env.local      # fill in values (see below)
supabase start                  # local Postgres/Auth/Storage
supabase db reset               # apply migrations + seed
pnpm dev                        # http://localhost:5173
```

### Environment variables

| Variable | Where | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | client | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | client | Supabase anon/publishable key |
| `VITE_VAPID_PUBLIC_KEY` | client | Web Push public key |
| `VAPID_PRIVATE_KEY` | Edge Function secret | Web Push private key (never exposed to the client) |
| `VAPID_SUBJECT` | Edge Function secret | `mailto:` contact for push services |

Generate VAPID keys with `npx web-push generate-vapid-keys`.

### Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview the production build, with the service worker enabled |
| `pnpm lint` / `pnpm format` | ESLint / Prettier |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Unit and component tests (Vitest) |
| `pnpm test:e2e` | End-to-end tests (Playwright, mobile viewports) |
| `pnpm test:db` | Database tests: schema, constraints, RLS (pgTAP) |
| `pnpm db:types` | Regenerate Supabase TypeScript types |

## Testing on a phone

- **Android (Chrome):** open the deployed preview URL, then use **Install app**.
- **iOS (Safari 16.4+):** tap **Share → Add to Home Screen**. On iOS, Web Push only works for apps installed to the Home Screen.
- Local testing over LAN: `pnpm dev --host`. Service workers and push need HTTPS, so test those on a Netlify deploy preview.

## Deployment

Netlify builds on every push. Pull requests get deploy previews, and `main` deploys to production.

- Build command: `pnpm build`
- Publish directory: `dist`
- SPA fallback: `/* /index.html 200`
- Migrations and Edge Functions are deployed with the Supabase CLI (`supabase db push`, `supabase functions deploy`).

## Development workflow (spec-driven, with Claude Code)

Features are built spec-first, with Claude Code agents doing the work and you approving each stage:

```
/spec-new "couple pairing"   → requirements.md  (you approve)
/spec-design 003             → design.md        (you approve)
/spec-tasks 003              → tasks.md         (you approve)
/spec-implement 003 all      → code + tests, one commit per task
/spec-verify 003             → traceability report + security review
/spec-status                 → where every feature stands
```

New to the project? Start with the **[developer guide](docs/guide/README.md)**, a step-by-step walkthrough of using the agents in daily work. See [`specs/README.md`](specs/README.md) for the process and roadmap, and [`CLAUDE.md`](CLAUDE.md) for the rules agents follow.

## Privacy

Outfit photos are personal. They are stored in a **private** bucket, served only through short-lived signed URLs, and protected by row-level security so that only the two members of a couple can see them. Location data (EXIF/GPS) is removed before upload.

## Roadmap ideas

Comments on outfits, an offline photo queue, dark mode, Vietnamese/English i18n, groups (friends/family voting), and outfit stats.

## License

TBD
