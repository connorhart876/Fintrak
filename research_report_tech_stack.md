# Tech Stack Research Report — Personal Finance Tracker

**Date:** 2026-05-19
**Scope:** Multi-user web app (desktop-first). Real backend + database. Features span auth, transactions, budgets, CSV import/export, PDF reports, savings goals, investment portfolio with live price data, and charts.

---

## Evaluation Criteria

Each category is rated across three axes:

- **Quality** — reliability, ecosystem maturity, long-term support, feature depth
- **Cost** — free tier generosity, paid tier pricing, self-hostability
- **Ease of Use** — DX, documentation, onboarding time, TypeScript support

Scale: ★ (poor) → ★★★★★ (excellent)

---

## 1. Frontend Framework

| Option | Quality | Cost | Ease of Use | Notes |
|--------|---------|------|-------------|-------|
| **Next.js 15 (React)** | ★★★★★ | Free | ★★★★☆ | Full-stack capable via API routes/Server Actions. File-based routing. React ecosystem. |
| React + Vite | ★★★★☆ | Free | ★★★★★ | Pure SPA, no SSR. Requires separate backend. Fastest dev server. |
| SvelteKit | ★★★★☆ | Free | ★★★★☆ | Excellent DX, smaller bundle sizes. Much smaller ecosystem than React. |
| Vue 3 + Vite (Nuxt) | ★★★★☆ | Free | ★★★★☆ | Great DX. Smaller job market and library ecosystem than React. |

**Winner: Next.js.** Full-stack in one repo, massive ecosystem, TypeScript-first, and Vercel deploys it in seconds. The learning curve over plain React is minimal and pays off immediately.

---

## 2. Backend Approach

| Option | Quality | Cost | Ease of Use | Notes |
|--------|---------|------|-------------|-------|
| **Next.js API Routes / Server Actions** | ★★★★☆ | Free | ★★★★★ | Co-located with frontend. No CORS setup. Handles REST well. Limited for heavy background jobs. |
| Express.js (Node) | ★★★★☆ | Free | ★★★★☆ | Battle-tested. Requires separate repo/process. More boilerplate. |
| Fastify (Node) | ★★★★★ | Free | ★★★★☆ | Faster than Express, great TypeScript support. Less ecosystem familiarity. |
| FastAPI (Python) | ★★★★★ | Free | ★★★☆☆ | Best choice if using Python. Requires context-switching if frontend is JS/TS. |
| Django (Python) | ★★★★☆ | Free | ★★★☆☆ | Batteries-included but heavier. ORM is built in but less flexible than Prisma. |

**Winner: Next.js API Routes.** For this app's scope — REST endpoints for CRUD, auth, and CSV/PDF handling — API routes are sufficient and eliminate the overhead of a separate backend service. If the app grows to need background job queues or complex data pipelines, a separate Fastify service can be extracted later.

---

## 3. Database

| Option | Quality | Cost | Ease of Use | Notes |
|--------|---------|------|-------------|-------|
| **PostgreSQL** | ★★★★★ | Free (self-host) / ~$5–25/mo hosted | ★★★★☆ | Best relational DB. Handles financial data, JSON columns, complex queries, and indexes extremely well. |
| MySQL | ★★★★☆ | Free / ~$5–20/mo hosted | ★★★★☆ | Solid. Slightly weaker JSON and window function support than Postgres. |
| SQLite | ★★★☆☆ | Free | ★★★★★ | Too limited for multi-user concurrent writes. Not a real option here. |
| MongoDB | ★★★☆☆ | Free tier / $57+/mo for production | ★★★★☆ | NoSQL is a poor fit for structured financial data with relational queries (user → accounts → transactions → categories). |
| Supabase (hosted Postgres) | ★★★★★ | Free tier generous / $25/mo Pro | ★★★★★ | Managed Postgres + realtime + storage + built-in auth. Removes infra burden. |

**Winner: PostgreSQL via Supabase.** Financial data is inherently relational. Supabase gives you a managed Postgres instance, a visual table editor, built-in Row Level Security (perfect for per-user data isolation), and an SDK that simplifies queries. Free tier is sufficient for development and early use.

---

## 4. ORM

| Option | Quality | Cost | Ease of Use | Notes |
|--------|---------|------|-------------|-------|
| **Prisma** | ★★★★★ | Free (open source) | ★★★★★ | Best-in-class DX. Schema-first, auto-generates TypeScript types. Excellent migrations. |
| Drizzle ORM | ★★★★☆ | Free | ★★★★☆ | Lighter than Prisma, SQL-first. Great TypeScript inference. Migrations less mature. |
| TypeORM | ★★★☆☆ | Free | ★★★☆☆ | Older, more complex. Decorator-heavy. Worse DX than Prisma. |
| Kysely | ★★★★☆ | Free | ★★★☆☆ | Type-safe query builder (not ORM). Great for raw SQL lovers. More verbose. |

**Winner: Prisma.** The schema file is self-documenting, migrations are painless, and the generated TypeScript client eliminates an entire class of runtime errors. Perfect fit for a financial app where schema correctness matters.

---

## 5. Authentication

| Option | Quality | Cost | Ease of Use | Notes |
|--------|---------|------|-------------|-------|
| **Auth.js v5 (NextAuth)** | ★★★★☆ | Free | ★★★★☆ | First-party Next.js integration. Email+password via credentials provider. Session/JWT handling built in. |
| Clerk | ★★★★★ | Free up to 10k MAU / $25/mo after | ★★★★★ | Prebuilt UI components, MFA, device sessions. Fastest to set up but vendor lock-in. |
| Supabase Auth | ★★★★★ | Included with Supabase | ★★★★★ | Tightly integrated if using Supabase DB. Row Level Security pairs perfectly with it. |
| Auth0 | ★★★★★ | Free up to 7,500 MAU / expensive after | ★★★★☆ | Enterprise-grade. Overkill for this app; expensive at scale. |
| Lucia Auth | ★★★★☆ | Free | ★★★☆☆ | Lightweight, fully custom. More setup than others. Good for full control. |

**Winner: Supabase Auth.** Since we're already on Supabase for the database, using Supabase Auth is the natural choice. It integrates directly with Row Level Security policies — meaning user data isolation is enforced at the database level, not just the application layer. Email+password is supported out of the box.

---

## 6. UI Component Library

| Option | Quality | Cost | Ease of Use | Notes |
|--------|---------|------|-------------|-------|
| **Tailwind CSS + shadcn/ui** | ★★★★★ | Free | ★★★★★ | shadcn/ui copies components into your repo (no version lock). Built on Radix UI primitives (fully accessible). Highly customizable. |
| Mantine | ★★★★★ | Free | ★★★★★ | Feature-rich, great defaults, hooks library included. Less design flexibility than Tailwind. |
| MUI (Material UI) | ★★★★☆ | Free / Pro $180/yr | ★★★★☆ | Comprehensive. Heavy Material Design aesthetic is hard to override. |
| Chakra UI | ★★★★☆ | Free | ★★★★★ | Simple, accessible. Less active development recently. |
| Ant Design | ★★★★☆ | Free | ★★★☆☆ | Enterprise-focused. Very opinionated design system. |

**Winner: Tailwind CSS + shadcn/ui.** The combination gives you a fully accessible, highly composable component set with total design freedom. The finance dashboard aesthetic (metric cards, tables, progress bars, date pickers) is well-covered by shadcn/ui components. No version lock-in since components live in your repo.

---

## 7. Data Visualization (Charts)

| Option | Quality | Cost | Ease of Use | Notes |
|--------|---------|------|-------------|-------|
| **Recharts** | ★★★★☆ | Free | ★★★★★ | React-native, declarative, good defaults. Covers bar, line, pie, area charts. |
| Tremor | ★★★★☆ | Free | ★★★★★ | Pre-styled dashboard components (metric cards + charts). Tailwind-based. Opinionated. |
| Chart.js + react-chartjs-2 | ★★★★☆ | Free | ★★★★☆ | Mature, flexible. Canvas-based (not SVG). |
| Victory | ★★★★☆ | Free | ★★★★☆ | React-native charts. Less popular than Recharts. |
| Nivo | ★★★★★ | Free | ★★★☆☆ | Beautiful defaults. More complex API. Larger bundle. |

**Winner: Recharts** (with Tremor considered for metric cards). Recharts covers every chart type needed (bar for categories, line for trends, pie for allocation). It's the most popular React chart library and pairs naturally with shadcn/ui. Tremor's pre-built metric card components are worth adopting alongside it for the dashboard.

---

## 8. Financial Data APIs (Investment Portfolio — Later milestone)

| Option | Quality | Cost | Ease of Use | Notes |
|--------|---------|------|-------------|-------|
| **Polygon.io** | ★★★★★ | Free tier (unlimited but delayed) / $29/mo real-time | ★★★★☆ | Stocks, ETFs, options, crypto. Reliable, well-documented REST + WebSocket. |
| Alpha Vantage | ★★★★☆ | Free (25 req/day) / $50/mo premium | ★★★★★ | Easy to start. Free tier too restrictive for production use. |
| Finnhub | ★★★★☆ | Free (60 req/min) / $99/mo premium | ★★★★☆ | Stocks + crypto. Good free tier. Solid documentation. |
| CoinGecko | ★★★★★ | Free (10–30 req/min) / $129/mo Pro | ★★★★★ | Best-in-class for crypto pricing. Free tier works well. |
| Yahoo Finance (unofficial) | ★★☆☆☆ | Free | ★★★☆☆ | No official API. Frequently breaks. Not suitable for production. |

**Winner: Polygon.io (stocks/ETFs) + CoinGecko (crypto).** Using two specialized APIs covers all asset classes described in the scope. Polygon's free delayed tier is sufficient for a portfolio tracker (not a trading tool). CoinGecko's free tier handles crypto pricing generously. Both have clean REST APIs that are easy to call from Next.js API routes.

---

## 9. PDF Generation (v2 — in-app report)

| Option | Quality | Cost | Ease of Use | Notes |
|--------|---------|------|-------------|-------|
| **React-PDF** (`@react-pdf/renderer`) | ★★★★☆ | Free | ★★★★☆ | Define PDFs as React components. Great for report layouts. Runs server-side in Next.js. |
| Puppeteer / Playwright | ★★★★★ | Free | ★★★☆☆ | Renders a real browser page to PDF. Perfect fidelity but heavy (~130MB binary). Cold-start latency on serverless. |
| PDFKit | ★★★★☆ | Free | ★★★☆☆ | Low-level PDF construction in Node. Precise control but verbose. |
| jsPDF | ★★★☆☆ | Free | ★★★★☆ | Client-side only. Limited layout capabilities. |

**Winner: React-PDF.** Defining the monthly report as a React component is the most maintainable approach. It runs server-side (no browser binary needed), produces consistently formatted output, and integrates naturally into a Next.js API route that streams the PDF to the client.

---

## 10. Hosting & Deployment

| Option | Quality | Cost | Ease of Use | Notes |
|--------|---------|------|-------------|-------|
| **Vercel** | ★★★★★ | Free hobby / $20/mo Pro | ★★★★★ | First-party Next.js support. Zero-config deploys from Git. Edge functions. Excellent preview deployments. |
| Railway | ★★★★☆ | ~$5–20/mo | ★★★★☆ | Great for full-stack with a database. Better for standalone Node servers. |
| Render | ★★★★☆ | Free tier (spins down) / $7/mo | ★★★★☆ | Solid. Free tier cold starts are a pain. Good for Node backends. |
| Fly.io | ★★★★★ | ~$3–15/mo | ★★★☆☆ | Excellent value. More DevOps configuration required. |

**Winner: Vercel + Supabase.** Vercel is the canonical Next.js host and deploys instantly from a GitHub push. Supabase hosts the database. Together they cover all infrastructure needs with near-zero configuration.

---

## Recommended Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 15** | Full-stack, TypeScript, file-based routing, React ecosystem |
| UI Components | **Tailwind CSS + shadcn/ui** | Accessible, composable, no version lock-in |
| Database | **PostgreSQL via Supabase** | Relational, managed, Row Level Security for user isolation |
| ORM | **Prisma** | Schema-first, TypeScript types auto-generated, great migrations |
| Auth | **Supabase Auth** | Integrated with DB, RLS enforces per-user data isolation at DB level |
| Charts | **Recharts + Tremor** | Covers all chart types; Tremor for metric card components |
| Stock/ETF Prices | **Polygon.io** | Reliable, free delayed tier sufficient for a portfolio tracker |
| Crypto Prices | **CoinGecko** | Best-in-class crypto API, generous free tier |
| PDF Reports | **React-PDF** | Server-side, defined as React components, no binary dependencies |
| Hosting | **Vercel** | Zero-config Next.js deploys, preview URLs per PR |

### Why this stack wins

- **Single language end-to-end** (TypeScript): no context-switching between frontend and backend.
- **Supabase as the data layer**: one platform handles the database, auth, and Row Level Security — which is the cleanest way to enforce the "every user's data is completely private" requirement.
- **Minimal infrastructure**: Vercel + Supabase means no servers to manage. Both have free tiers sufficient to develop and launch the MVP through v1.
- **Scales with the milestones**: the stack handles every feature from MVP through Later without requiring architectural changes. The investment portfolio page just adds new Prisma models and two API integrations.

### Cost at each milestone (estimated)

| Phase | Monthly Cost |
|-------|-------------|
| Development / MVP | $0 (Vercel free + Supabase free) |
| v1 / v2 (small user base) | $0–25 (Supabase Pro if DB size grows) |
| Later (live price APIs) | $0–29 (Polygon.io free delayed tier likely sufficient) |
