---
spec: 001-project-scaffold
doc: requirements
status: draft
updated: 2026-10-07
---

# 001: Project scaffold

## Summary

Set up the empty repository so that every later feature spec can be built, tested and deployed the same way: a mobile-first, installable React PWA connected to a local Supabase stack, with lint, typecheck, unit, component and e2e tests, CI, and Netlify deploys. There are no product features yet. The app shell just shows a placeholder home screen.

## User stories

- **US1:** As a developer (human or agent), I want one command to install and run the app locally so that I can start on a feature immediately.
- **US2:** As a developer, I want automated checks locally and in CI so that broken code never reaches `main`.
- **US3:** As a user on a phone, I want to install the app to my Home Screen and have it open full-screen.
- **US4:** As the product owner, I want every PR to get a preview URL so that I can try changes on my phone.

## Requirements

### R1: Toolchain and local development

**Story:** US1

| ID | Acceptance criterion (EARS) |
| --- | --- |
| R1.1 | THE SYSTEM SHALL use pnpm, Node 20+ (pinned via `.nvmrc` and `packageManager`), React, Vite and TypeScript in `strict` mode. |
| R1.2 | WHEN a developer runs `pnpm install && pnpm dev` THE SYSTEM SHALL serve the app at `http://localhost:5173`. |
| R1.3 | THE SYSTEM SHALL provide the scripts `dev`, `build`, `preview`, `lint`, `format`, `typecheck`, `test`, `test:e2e` and `db:types` listed in CLAUDE.md. |
| R1.4 | THE SYSTEM SHALL use the folder layout in CLAUDE.md (`src/app`, `src/features`, `src/components`, `src/lib`, `src/sw.ts`, `supabase/`, `e2e/`). |
| R1.5 | THE SYSTEM SHALL provide `.env.example` listing every variable in the README, and `.env*` files other than the example SHALL be git-ignored. |

### R2: Supabase

**Story:** US1

| ID | Acceptance criterion (EARS) |
| --- | --- |
| R2.1 | THE SYSTEM SHALL include a `supabase/` project (`config.toml`, `migrations/`, `seed.sql`, `functions/`) that starts with `supabase start`. |
| R2.2 | THE SYSTEM SHALL expose a single typed Supabase client in `src/lib/supabase.ts`, built from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |
| R2.3 | IF either Supabase env variable is missing THEN THE SYSTEM SHALL fail at startup with a clear error message naming the variable. |

### R3: PWA shell

**Story:** US3

| ID | Acceptance criterion (EARS) |
| --- | --- |
| R3.1 | THE SYSTEM SHALL serve a web manifest with name, short name, `display: standalone`, portrait orientation, theme and background colours, and 192px, 512px and maskable icons. |
| R3.2 | THE SYSTEM SHALL register a custom service worker (`src/sw.ts`, `injectManifest`) that precaches the app shell. |
| R3.3 | WHILE offline THE SYSTEM SHALL still load the app shell after a first successful visit. |
| R3.4 | THE SYSTEM SHALL NOT cache Supabase API responses in the service worker. |
| R3.5 | WHEN a new service worker version is available THE SYSTEM SHALL show a non-blocking "Update available" prompt that reloads on tap. |
| R3.6 | THE SYSTEM SHALL render a placeholder home screen that fits a 375×667 viewport without horizontal scroll, uses `100dvh` and respects safe-area insets. |

### R4: Quality checks

**Story:** US2

| ID | Acceptance criterion (EARS) |
| --- | --- |
| R4.1 | THE SYSTEM SHALL configure ESLint (TypeScript, React hooks, jsx-a11y) and Prettier, and `pnpm lint` SHALL pass on the scaffold. |
| R4.2 | THE SYSTEM SHALL configure Vitest with jsdom and Testing Library, with at least one passing component test for the home screen. |
| R4.3 | THE SYSTEM SHALL configure Playwright with an iPhone-sized and a Pixel-sized device profile, with at least one passing e2e test that loads the home screen. |
| R4.4 | WHEN a PR is opened or updated THE SYSTEM SHALL run lint, typecheck, unit tests, build and e2e in GitHub Actions. |
| R4.5 | IF any CI step fails THEN THE SYSTEM SHALL report the workflow as failed. |

### R5: Deployment

**Story:** US4

| ID | Acceptance criterion (EARS) |
| --- | --- |
| R5.1 | THE SYSTEM SHALL include `netlify.toml` with build command `pnpm build`, publish dir `dist` and an SPA fallback to `index.html`. |
| R5.2 | THE SYSTEM SHALL serve `sw.js` with `Cache-Control: no-cache` so that updates are picked up. |
| R5.3 | WHEN a PR is opened THE SYSTEM SHALL produce a Netlify deploy preview (Netlify's Git integration, configured by the owner). |

## Non-functional requirements

- **Performance:** the production build of the shell is under 200 KB of gzipped JS.
- **Accessibility:** the home screen has no axe violations in the Playwright test.
- **Security:** no secrets are committed. Only `VITE_*` public values are used on the client.

## Out of scope

Auth, pairing, polls, push notifications (later specs). Tailwind design tokens beyond a basic theme colour. Custom domain.

## Open questions

- [ ] App display name and short name for the manifest: "OhYeah-SuitsYou" / "SuitsYou"?
- [ ] Brand / theme colour (placeholder: `#E11D48` rose)?
- [ ] Should CI run e2e on every PR (slower) or only on `main`? (Assumed: every PR.)
- [ ] Router choice: React Router (assumed) or TanStack Router?
