# Project Specification — Finance Tracker

**Version:** 0.1  
**Date:** 2026-05-19  
**Status:** Draft

---

## 1. Overview

A multi-user personal finance tracker web application. Each user logs in independently and manages their own completely private financial data — expenses, income, budgets, savings goals, accounts, and an investment portfolio. Built to production-ready standards as a public-facing product.

**Design language:** Notion aesthetics (clean, minimal, dark mode) with YNAB-style financial functionality (structured, category-driven, purposeful). Dark mode is the default and only theme.

---

## 2. Target Users

Any individual who wants to track their personal finances in one place. All user data is completely private and isolated — no sharing, no household views, no collaboration.

---

## 3. Product Requirements

Features are grouped by milestone. Each milestone builds on the previous.

### MVP

- Email + password registration and login
- Single-page app (transactions page only)
- Page layout: transaction list on the left, persistent add-transaction form panel on the right
- Add transaction via the right-side form panel
  - Fields: title, amount, date, category (fixed list), type toggle (expense / income)
  - Type toggle: grey pill, "Expense" on the left, "Income" on the right — no default; user must explicitly select one before submitting
- Transaction list: scrollable, sorted by date descending
- Fixed categories: TBD — final list to be decided during implementation (examples: Food, Transport, Bills, Entertainment, Health, Shopping, Other)
- Monthly totals displayed on the page
- Delete transaction

### v1

- Multiple pages: Dashboard, Transactions, Budget
- Adding a transaction: "New Transaction" button triggers a modal overlay form (replaces the right-side panel used in MVP)
- Edit transaction: clicking a row opens the same modal pre-populated
- Income transactions fully supported (type field already in schema from MVP)
- **Dashboard:**
  - 3 metric cards: Total Income, Total Expenses, Net
  - Spending by category chart
  - Recent transactions list
  - No accounts section yet — that appears only when accounts are built (Later)
- **Transactions page:** full scrollable table view
- **Budget page:** one horizontal progress bar per category showing spend vs. budget limit
  - User sets the budget amount per category per month
  - Each month resets independently — no rollover
- Month selector: pill toggle (← Jun | Jul | Aug →) in the page header across all views — never a dropdown

### v2

- Recurring transactions (weekly/monthly auto-log)
  - Shown with a loop icon in the transaction list
  - Managed in a dedicated "Recurring" tab: next fire date, frequency, pause toggle
- CSV import: full-screen overlay wizard — drag-and-drop zone → column mapping table → preview step → confirm
- CSV / PDF export for any date range
- In-app monthly spend report (downloadable as PDF — not emailed)
- Savings goals:
  - Fields: goal name, target amount, deadline, optional account label (e.g. "New Car — $10k — Ally Savings")
  - Deposits toward a goal are logged separately and do not affect account balances or transaction history
  - Goals page: each goal is a card with a circular progress ring, projected completion date, and a quick-add deposit button
- Full-text search across transactions
- Custom user-created categories with icons
- Trend chart: income vs. expenses over the last 12 months
- Cmd+K command palette: quick-add transaction from anywhere in the app

### Later

- Accounts page: manually track balances across account types (checking, savings, credit card, etc.)
- Dashboard gains an accounts section and account balances (added when accounts feature ships)
- Net worth tracker: aggregates account balances + investment portfolio value, shown as a trend over time
- Investment portfolio page:
  - Manually log holdings across any asset class (stocks, ETFs, crypto, etc.)
  - Live price data auto-fetched for publicly traded assets
  - Analytics: total value, P&L per holding, % gain/loss, allocation breakdown
- Savings goals formally linked to a specific account (upgrade from v2 text label)
- Auto-categorization of imported transactions
- Cash flow forecasting
- AI chat

---

## 4. User Interaction Patterns

- **MVP layout:** Single page. Transaction list on the left; persistent add-transaction form panel on the right.
- **v1+ adding a transaction:** "New Transaction" button → modal overlays the current page → fill form → submit → modal closes, list updates.
- **Editing a transaction:** Click a transaction row → same modal opens pre-populated with existing values.
- **Deleting a transaction:** TBD — inline delete button on the row, or a delete button inside the edit modal.
- **Feedback:** All feedback is passive and on-screen only. No push notifications, no emails. Form validation errors display inline. A successful submit closes the modal and updates the list.
- **Month navigation:** Pill toggle in the page header (← Jun | Jul | Aug →) — consistent across Dashboard, Transactions, and Budget pages.
- **Dark mode:** Default and only theme.

---

## 5. Technical Architecture

### 5.1 Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router, TypeScript) |
| UI Components | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth (email + password only) |
| Charts | Recharts + Tremor |
| Stock / ETF Prices | Polygon.io (Later milestone) |
| Crypto Prices | CoinGecko (Later milestone) |
| PDF Generation | React-PDF (v2 milestone) |
| Hosting | Vercel |
| Version Control | GitHub — Vercel deploys automatically on push |

### 5.2 Project Structure

Single Next.js repository. All frontend, API logic, and database schema live in one repo.

```
/
├── app/
│   ├── (auth)/           # Login and registration pages (public)
│   └── (app)/            # Protected pages: dashboard, transactions, budget, etc.
├── components/           # Shared UI components
├── lib/                  # Supabase client, Prisma client, utilities
├── prisma/               # schema.prisma + migrations
└── public/               # Static assets
```

### 5.3 API Design

- **Mutations** (create, update, delete): Next.js Server Actions — called directly from components, no manual API route needed.
- **File responses** (CSV export, PDF generation): Next.js Route Handlers (`/api/...`) — required for streaming file downloads.
- **Data reads:** Supabase client queries inside Server Components where possible.

### 5.4 Auth Flow

1. User registers with email + password via Supabase Auth.
2. Supabase issues a JWT stored in a secure cookie.
3. Next.js middleware reads the cookie and redirects unauthenticated users to the login page.
4. All database queries are scoped to the authenticated user via Row Level Security (RLS) policies enforced at the PostgreSQL level — user data isolation is guaranteed at the database layer, not just the application layer.

### 5.5 Core Data Model

```
users               managed by Supabase Auth
                    (id, email, created_at)

categories          (id, user_id nullable, name, icon, is_default)
                    Rows with user_id = null are fixed system defaults.
                    Rows with user_id set are custom categories (v2+).

transactions        (id, user_id, title, amount, date,
                    type [income | expense], category_id,
                    recurring_rule_id nullable, created_at, updated_at)

budgets             (id, user_id, category_id, month, year, amount_limit)
                    One row per user per category per month. Resets each month.

recurring_rules     (id, user_id, title, amount, type, category_id,
                    frequency [weekly | monthly], next_fire_date,
                    paused, created_at)
                    v2+

savings_goals       (id, user_id, name, target_amount, deadline,
                    account_label, created_at)
                    v2+

goal_deposits       (id, goal_id, user_id, amount, date, created_at)
                    v2+

accounts            (id, user_id, name,
                    type [checking | savings | credit | other],
                    balance, created_at, updated_at)
                    Later

holdings            (id, user_id, account_id nullable, ticker, name,
                    asset_class, quantity, avg_cost, created_at, updated_at)
                    Later
```

### 5.6 External Dependencies

| Service | Purpose | Milestone |
|---------|---------|-----------|
| Supabase | PostgreSQL database + Auth | MVP |
| Vercel | Hosting, CI/CD from GitHub | MVP |
| Polygon.io | Live stock / ETF price data | Later |
| CoinGecko | Live crypto price data | Later |

---

## 6. Non-Goals

- **Not a mobile app.** Web, desktop-first. Chrome is the primary target; all modern browsers should render correctly but are not the priority.
- **No offline support.** Always-online is assumed.
- **No notifications.** No push notifications, email alerts, or in-app banners for budget limits or goal milestones. All feedback is passive and on-screen only.
- **No real-time cross-device sync.**
- **No crypto or stock trading.** Portfolio tracking only — no trade execution, no trading suggestions.
- **No tax reports.**
- **No advanced forecasting or ML models.**
- **No integration with external accounting software** (QuickBooks, Xero, etc.).
- **No email delivery of any kind.** Reports are in-app downloadable PDFs only.
- **No household or shared budgets.** All user data is completely private and isolated.
- **No user self-service account deletion.** Account deletion is an admin-only operation for now.
- **No automated tests.** Manual QA only.

---

## 7. Success Criteria

### MVP is complete when:

1. A new user can register with an email and password.
2. The user can log in and land on the transactions page.
3. The user can fill out the add-transaction form and submit a transaction with all required fields.
4. The submitted transaction appears in the transaction list, sorted correctly by date.
5. The user can delete a transaction and it is removed from the list.
6. One user's data is never visible to another user.

### Quality bar:

- The app feels fast — no noticeable lag on form submit or list load.
- The UI matches the dark mode Notion-style aesthetic.
- Runs correctly in Chrome; no broken layouts in other modern browsers.
