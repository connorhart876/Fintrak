# Changelog

All notable changes to Fintrak will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- Added `lib/supabase/client.ts` — browser client for Client Components (`createBrowserClient` from `@supabase/ssr`)
- Added `lib/supabase/server.ts` — async server client for Server Components, Server Actions, and Route Handlers (async `cookies()`, `getAll`/`setAll` API)
- Added `lib/supabase/middleware.ts` — session refresh helper + whitelist-public protected-route gate; unauthenticated requests redirect to `/login?next=<path>`
- Added root `proxy.ts` — wires the session helper into Next.js 16 proxy (renamed from `middleware.ts` per Next.js 16 convention; public paths: `/login`, `/register`, `/auth/callback`)
- Added `app/(auth)/layout.tsx` — centered auth shell (`max-w-sm`) shared by all auth pages
- Added `app/(auth)/register/page.tsx` — registration page (Client Component) with react-hook-form + zod; inline field errors and form-level error display; redirects to `/login` on success
- Added `app/(auth)/register/actions.ts` — `registerAction` Server Action wrapping `supabase.auth.signUp`; handles Supabase's duplicate-email silent-success pattern (empty `identities` array)
- Scaffolded 18 GitHub issues covering the full MVP milestone in dependency order
- Installed MVP npm dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `@prisma/client`, `prisma`, `zod`, `react-hook-form`, `@hookform/resolvers`
- Added `prisma:seed` npm script and `prisma.seed` config block to `package.json`
- Added Claude Code custom commands: `changelog`, `end-session`, `test-frontend`
- Locked Claude Code MCP permission for `claude mcp` commands in project settings
- Locked app to dark mode only: `<html class="dark">` set in `app/layout.tsx`; `@custom-variant dark (&:where(.dark, .dark *))` registered in Tailwind v4
- Added Notion-style dark color tokens: `--background #0a0a0a`, `--foreground #ededed`, `--muted #1a1a1a`, `--muted-foreground #a1a1aa`, `--border #262626`, `--ring #3f3f46`
- Fixed body `font-family` from hardcoded Arial to `var(--font-geist-sans)` (Geist Sans)
- Updated site metadata title to "Fintrak"
- Initialized shadcn/ui (`shadcn@4.7.0`) with Radix library + Nova preset (style: `radix-nova`, baseColor: `neutral`, Tailwind v4 mode)
- Added `lib/utils.ts` with `cn()` helper (`clsx` + `tailwind-merge`)
- Installed shadcn/ui components: `button`, `input`, `label`, `select`, `separator`, `card`, `toggle-group`, `toggle`
- Added `tw-animate-css` as Tailwind v4 animation utility
- Initialized Prisma 7.8.0 with `prisma-client` generator outputting to `lib/generated/prisma/`
- Added `prisma/schema.prisma` with PostgreSQL datasource (Prisma 7: no URL in schema)
- Added `prisma.config.ts` for CLI operations using `DIRECT_URL` (port 5432, bypasses pgBouncer for migrations)
- Added `lib/prisma.ts` singleton using `@prisma/adapter-pg` + `pg` Pool (`max: 1`) with `globalForPrisma` hot-reload guard
- Added `postinstall: prisma generate` script to regenerate client on deploy
- Added `lib/generated/prisma` to `.gitignore`
- Appended `?pgbouncer=true&connection_limit=1` to `DATABASE_URL` in `.env` for Supabase Transaction-mode pooler compatibility
- Added runtime dependencies: `pg`, `@prisma/adapter-pg`, `dotenv`; dev dependency: `@types/pg`

### Changed
- `app/globals.css` rewritten: removed `prefers-color-scheme` media query; expanded `@theme inline` to expose all color tokens; `--font-sans` circular reference fixed to `var(--font-geist-sans)`
- shadcn init reconciled: `@custom-variant dark` form preserved; 6 Notion dark tokens overridden from shadcn's OKLCH defaults to hex values; font-family retained

### Deprecated

### Removed

### Fixed

### Security

---

## [0.1.0] — 2026-05-20

### Added
- Initial project planning: brainstorm, product spec, tech stack research, architecture skeleton

[Unreleased]: https://github.com/connorhart876/Fintrak/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/connorhart876/Fintrak/releases/tag/v0.1.0
