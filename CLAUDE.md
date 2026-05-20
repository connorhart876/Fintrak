# Fintrak — CLAUDE.md

## Project Overview

Multi-user personal finance tracker web app. Each user logs in independently to track their own expenses, income, budgets, savings goals, accounts, and investment portfolio. All user data is completely private and isolated. Built to production-ready standards as a public-facing product.

## Architecture Overview

Single Next.js 15 monorepo — frontend and API logic co-located. Supabase handles PostgreSQL and authentication; Row Level Security (RLS) enforces per-user data isolation at the database layer. Prisma is the ORM for type-safe queries and migrations. Deployed on Vercel with automatic CI/CD from GitHub.

→ See [docs/architecture.md](docs/architecture.md) for detail _(to be created)_.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **UI:** Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Auth:** Supabase Auth — email + password only
- **Charts:** Recharts + Tremor
- **PDF generation:** React-PDF _(v2 milestone)_
- **Stock / ETF prices:** Polygon.io _(Later milestone)_
- **Crypto prices:** CoinGecko _(Later milestone)_
- **Hosting:** Vercel — auto-deploys from GitHub `main`

## Design and UX Guide

- **Theme:** Dark mode only — default and only theme
- **Aesthetic:** Notion-style (clean, minimal, spacious) + YNAB-style functionality (category-driven, structured)
- **Components:** shadcn/ui as the base; customize with Tailwind — avoid custom CSS overrides
- **Typography:** _TBD — decide when scaffolding_
- **Month navigation:** Always a pill toggle `← Jun | Jul | Aug →` — never a dropdown, anywhere in the app
- **Transaction type toggle:** Grey pill, "Expense" left / "Income" right, no default — user must explicitly select before submitting
- **Feedback:** Passive and on-screen only — no modals for success, no toast spam; errors display inline

## Constraints and Policies

- **User data isolation:** All DB queries must be scoped to the authenticated user. RLS enforces this at the DB layer — never bypass it with the service role key in a client context.
- **No client-side secrets:** `SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` are server-only. Never import in client components.
- **Mutations via Server Actions:** Use Next.js Server Actions for create / update / delete. Use Route Handlers only for file streaming (CSV export, PDF download).
- **Auth required on all app routes:** Every route under `app/(app)/` must be protected by middleware — no exceptions.
- **No `any` in TypeScript:** Use proper types or `unknown`. Never silence the type checker with `any`.
- **No notifications:** No push, no email, no in-app banners. All feedback is passive and on-screen.
- **Always-online:** No offline support, no service workers, no offline caching.

## Repository Etiquette

- **Never commit directly to `main`** — always branch and PR
- **Branch naming:** `feature/short-description` · `fix/short-description` · `chore/short-description`
- **Commit style:** [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` — new feature
  - `fix:` — bug fix
  - `chore:` — maintenance, deps, config
  - `docs:` — documentation only
  - `refactor:` — code change, no behavior change
  - `style:` — formatting / whitespace only
- **Formatting:** Prettier + ESLint — run before committing
- **PR conventions:** _TBD_

## Frequently Used Commands

```bash
npm run dev                  # Start dev server (localhost:3000)
npm run build                # Production build
npm run start                # Run production build locally
npm run lint                 # ESLint check
npx prettier --write .       # Format all files
npx prisma migrate dev       # Apply DB migrations (dev)
npx prisma db push           # Push schema without migration file (prototyping)
npx prisma studio            # Open Prisma visual DB browser
```

## Documentation Index

- [Project Specification](project_spec.md) — full product requirements, data model, auth flow, success criteria
- [Brainstorm / Milestone Roadmap](brainstorm.md) — feature planning and milestone breakdown
- [Tech Stack Research](research_report_tech_stack.md) — rationale for every stack choice
- [Environment Variables](.env.example) — all required env vars with setup notes
- [Architecture](docs/architecture.md) — system design, key components, and technical decisions
- [Changelog](docs/changelog.md) —  running log of all changes (Keep a Changelog format)
- [Project Status](docs/project_status.md) — milestone tracking, current focus, and what's next

## Not in Scope

- Mobile app — web, desktop-first only
- Offline support — always-online assumed
- Real-time cross-device sync
- Push notifications or email alerts of any kind
- Crypto or stock trading — portfolio tracking only, no trade execution or suggestions
- Tax reports
- Advanced forecasting or ML models
- Integration with accounting software (QuickBooks, Xero, etc.)
- Email delivery of any kind — in-app downloadable PDF only
- Household or shared budgets
- User self-service account deletion — admin-only operation
- Automated tests — manual QA only
