# Project Status — Fintrak

_Update this file manually as work progresses. Not auto-generated._

**Last updated:** 2026-05-21

---

## Project Milestones

| Milestone | Status |
|-----------|--------|
| MVP | In Progress |
| v1 | Not Started |
| v2 | Not Started |
| Later | Not Started |

---

## Current Focus

Building the MVP auth surface (issues #9–#12): registration, login, logout, and protected app shell.

---

## Recently Completed

- **#8 — Supabase client utilities + auth middleware** (PR #26): `lib/supabase/` clients, `proxy.ts` with whitelist-public session gate
- **#9 — Registration page** (PR #27): `app/(auth)/register/` with react-hook-form + zod, inline errors, Server Action calling `supabase.auth.signUp`
- **#7 — Seed default categories** (PR #25): idempotent seed for 7 default categories (Bills, Entertainment, Food, Health, Other, Shopping, Transport)
- **#6 — Enable Row Level Security** (PR #24): RLS + 8 policies on `categories` and `transactions`; `lib/prisma-rls.ts` `withRLS()` helper
- **#5 — MVP schema + first migration** (PR #23): `Category` and `Transaction` models, Prisma 7 config, `lib/prisma.ts` singleton

---

## Known Blockers

None currently.

---

## Next Up

- **#10 — Login page**: `app/(auth)/login/page.tsx` with email + password signin, Server Action calling `supabase.auth.signInWithPassword`
- **#11 — Logout action**: Server Action calling `supabase.auth.signOut`, redirect to `/login`
- **#12 — Protected app shell layout**: `app/(app)/layout.tsx` that reads the session and renders the nav shell
