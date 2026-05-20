# Architecture — Fintrak

_Skeleton document. Populated from project_spec.md. All `[TODO]` items require decisions during implementation._

---

## System Overview

Fintrak is a single Next.js 15 monorepo deployed on Vercel. All frontend pages, API logic, and the database schema live in one repository. Supabase provides the PostgreSQL database and authentication layer. Row Level Security (RLS) policies on the database enforce per-user data isolation — no user can ever read or write another user's data, regardless of application-layer logic.

```
Browser
  └── Vercel (Next.js 15, App Router)
        ├── Server Components      → reads via Supabase client (RLS-scoped)
        ├── Server Actions         → mutations via Prisma
        ├── Route Handlers         → file streaming (CSV, PDF)
        └── Middleware             → auth guard on all (app) routes
              └── Supabase Auth    → validates JWT from cookie
                    └── Supabase PostgreSQL (hosted)
```

---

## Key Components

### Next.js App Router route groups

| Route group | Purpose | Auth required |
|-------------|---------|---------------|
| `app/(auth)/` | Login, registration pages | No |
| `app/(app)/` | All protected app pages | Yes — enforced by middleware |

### Middleware (`middleware.ts`)

- Runs on every request to `app/(app)/`
- Reads the Supabase JWT from the session cookie
- Redirects unauthenticated users to `/login`
- [TODO: decide whether to refresh the session token in middleware or rely on Supabase client auto-refresh]

### Supabase Auth

- Email + password only
- Issues a JWT stored in a secure cookie
- RLS policies use the JWT's `sub` claim (user ID) to scope all queries

### Prisma (ORM)

- Single `schema.prisma` in `/prisma/`
- Used for all mutations (create, update, delete) via Server Actions
- Connects to Supabase PostgreSQL directly
- [TODO: confirm whether to use the pooled (PgBouncer, port 6543) or direct (port 5432) connection string for Prisma runtime — migrations always use the direct URL]

### Supabase client (reads)

- Used in Server Components for data fetching where RLS can do the scoping automatically
- [TODO: decide whether to standardize on Prisma for all DB access or use Supabase client for reads and Prisma for writes]

### Server Actions

- Handle all create / update / delete operations
- Co-located with the relevant page or in `/lib/actions/`
- [TODO: decide folder structure for actions — co-located vs. centralized `/lib/actions/`]

### Route Handlers (`/api/`)

- Used only for responses that must stream a file: CSV export, PDF download
- [TODO: define route paths when implementing v2 export features]

---

## Component Interactions

```
User submits form
  → Client Component calls Server Action
    → Server Action validates input
      → Prisma writes to PostgreSQL (RLS enforces user scoping)
        → Server Action calls revalidatePath()
          → Next.js re-renders the relevant Server Component
            → Updated data appears in UI

User navigates to a page
  → Middleware checks JWT cookie
    → If invalid → redirect to /login
    → If valid → render proceeds
      → Server Component queries Supabase (RLS-scoped to user)
        → Page renders with user's data

User requests a file (CSV / PDF)
  → Client triggers GET /api/export/...
    → Route Handler authenticates user
      → Fetches data from DB
        → Generates file (CSV string or React-PDF document)
          → Streams response with correct Content-Type header
```

---

## Data Flow

### Authentication flow

1. User submits email + password on `/login`
2. Supabase Auth validates credentials and sets a JWT cookie
3. Subsequent requests include the cookie; middleware validates it on every `(app)` route
4. RLS policies on every table check `auth.uid()` against `user_id` — queries return only the current user's rows

### Transaction create flow

1. User fills the add-transaction form and submits
2. Client calls a Server Action with the form data
3. Server Action validates fields (amount > 0, date valid, type set, category exists)
4. Prisma inserts a row into `transactions` with `user_id` set to the authenticated user
5. `revalidatePath()` triggers a re-fetch of the transactions list
6. UI updates without a full page reload

### Data read flow (Server Component)

1. Server Component runs on the server during render
2. Queries Supabase (or Prisma) with the user's session in context
3. RLS restricts the result set to the authenticated user's rows
4. Data is passed as props to Client Components for interactivity

---

## External Integrations

### Supabase (MVP)

- **What:** Managed PostgreSQL + Auth
- **How connected:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side; `SUPABASE_SERVICE_ROLE_KEY` for server-side admin operations only
- **Prisma connection:** `DATABASE_URL` (pooled) + `DIRECT_URL` (direct, for migrations)
- **RLS:** Enabled on all tables — policies TBD per table during schema implementation

### Vercel (MVP)

- **What:** Hosting + CI/CD
- **How:** Connected to GitHub repo; auto-deploys `main` to production, branches to preview URLs
- **Environment variables:** Set in Vercel dashboard — mirrors `.env.example`

### Polygon.io (Later milestone)

- **What:** Live stock and ETF price data
- **How connected:** Server-side API calls from a Route Handler or Server Action using `POLYGON_API_KEY`
- **Rate limits:** Free tier is delayed data (15 min); sufficient for a portfolio tracker
- [TODO: define caching strategy for price data — cache per ticker per N minutes to avoid hammering the API]

### CoinGecko (Later milestone)

- **What:** Live cryptocurrency price data
- **How connected:** Server-side REST calls; free tier does not require a key but `COINGECKO_API_KEY` is available for paid plans
- [TODO: same caching strategy decision as Polygon.io]

---

## Technical Decisions & Rationale

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Full-stack framework | Next.js 15 (App Router) | Single TypeScript repo for frontend + backend; Server Actions eliminate a separate API service; first-class Vercel support |
| Database platform | Supabase (PostgreSQL) | Managed Postgres + Auth + RLS in one platform; free tier sufficient through v1; RLS is the cleanest way to enforce per-user isolation |
| ORM | Prisma | Schema-first, auto-generates TypeScript types, great migration tooling; correctness matters in a financial app |
| Auth | Supabase Auth | Co-located with the DB; RLS policies use the same user ID the auth system issues — no duplication of user identity |
| Mutations pattern | Server Actions (not API Routes) | No CORS configuration, no manual fetch calls, type-safe end-to-end, co-located with the page that uses them |
| UI components | shadcn/ui + Tailwind | Components are copied into the repo (no version lock-in), built on Radix UI (accessible), fully customizable with Tailwind |
| User data isolation | RLS at DB layer | Enforced below the application — a bug in app-layer filtering can't leak another user's data |
| [TODO: decide] | Prisma for all DB access vs. mixed (Supabase client for reads + Prisma for writes) | [TODO: document rationale once decided] |
| [TODO: decide] | Error boundary strategy | [TODO: document how server errors surface to the user] |
| [TODO: decide] | Optimistic UI updates | [TODO: document whether to use React optimistic state for transaction add/delete] |
