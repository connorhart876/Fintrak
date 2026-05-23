# Project Status — Fintrak

_Update this file manually as work progresses. Not auto-generated._

**Last updated:** 2026-05-23

---

## Project Milestones

| Milestone | Status |
|-----------|--------|
| MVP | ✅ Complete |
| v1 | In Progress |
| v2 | Not Started |
| Later | Not Started |

---

## Current Focus

Building v1: multi-page shell (Dashboard, Transactions, Budget), transaction modal (add + edit), dashboard metric cards + spending chart, and the month-selector pill nav.

---

## Recently Completed

- **#18 — Empty state + final MVP QA** (PR #36): verified all MVP success criteria; docs updated to reflect MVP complete
- **#17 — Monthly totals** (PR #35): server-rendered Income / Expenses / Net above the transaction list, scoped to current calendar month
- **#16 — Delete transaction confirmation** (PR #34): `window.confirm()` guard + inline error feedback on the delete button
- **#15 — Add-transaction form + createTransaction server action** (PR #33): full right-panel form with react-hook-form + zod; type toggle, category select, `createTransactionAction` via `withRLS`
- **#14 / #32 — Server-rendered transaction list + inline delete** (PR #32): `TransactionList` async server component, `DeleteTransactionButton` client component, `deleteTransactionAction`
- **#13 — Two-column transactions page shell** (PR #31): `app/(app)/page.tsx` two-column grid
- **#12 — Protected app shell layout** (PR #30): `app/(app)/layout.tsx` with header, wordmark, and logout button
- **#11 — Logout action** (PR #29): `logoutAction` Server Action + `LogoutButton` component
- **#10 — Login page** (PR #28): login page with `loginAction`, inline errors, `?next=` redirect
- **#9 — Registration page** (PR #27): `app/(auth)/register/` with react-hook-form + zod
- **#8 — Supabase client utilities + auth middleware** (PR #26): `lib/supabase/` clients, `proxy.ts`
- **#7 — Seed default categories** (PR #25): 7 default categories (Bills, Entertainment, Food, Health, Other, Shopping, Transport)
- **#6 — Enable Row Level Security** (PR #24): RLS + 8 policies; `withRLS()` helper
- **#5 — MVP schema + first migration** (PR #23): `Category` and `Transaction` models

---

## Known Blockers

None currently.

---

## Next Up (v1)

- **Dashboard page** — `app/(app)/dashboard/page.tsx`; 3 metric cards (Income, Expenses, Net), spending-by-category chart (Recharts/Tremor), recent transactions list
- **Transactions page upgrade** — replace right-panel form with "New Transaction" modal; add edit-on-row-click flow
- **Budget page** — `app/(app)/budget/page.tsx`; horizontal progress bars per category; user sets monthly budget limit per category
- **Month selector** — pill toggle (`← Jun | Jul | Aug →`) in page headers across Dashboard, Transactions, and Budget
- **Multi-page nav shell** — sidebar or top nav linking Dashboard / Transactions / Budget
