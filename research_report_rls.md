# Research Report — Supabase RLS with Prisma + Next.js Server Actions

**Date:** 2026-05-21  
**Scope:** Correct implementation of Row Level Security for a multi-user Next.js 15 / Prisma 7 / Supabase Auth app (this project).

---

## 1. How `auth.uid()` Works

`auth.uid()` is a Supabase-provided PostgreSQL helper function. Internally it runs:

```sql
SELECT nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'::uuid
```

It reads the `sub` (subject) claim from the `request.jwt.claims` PostgreSQL session variable. That variable must be set explicitly — it is **not** set automatically by Prisma. When it is unset, `auth.uid()` returns `NULL`, and any `USING (user_id = auth.uid())` policy matches zero rows.

**Key implication:** Supabase's own JS client (`supabase-js`) sets this variable automatically when it runs queries. Prisma does not — making this the central challenge of the Prisma + RLS combination.

---

## 2. The Critical Prisma + RLS Gotcha

Prisma connects to PostgreSQL using the `postgres` superuser (from `DATABASE_URL`). The `postgres` role has `BYPASSRLS` — meaning **all RLS policies are silently skipped** unless you explicitly set `request.jwt.claims` before each query.

This means: enabling RLS and defining policies alone is not enough. Without the JWT claims set, Prisma returns all rows from all users regardless of policies.

---

## 3. The Solution — `set_config()` Before Queries

The correct fix is to run `set_config('request.jwt.claims', <claims_json>, false)` inside the same database transaction as the Prisma query. The third argument `false` means "transaction-scoped, not session-scoped" — required for compatibility with pgBouncer transaction-mode pooling.

**Critical pgBouncer rule:** Do NOT use `SET LOCAL` or `set_config(..., true)` with the transaction-mode pooler (port 6543). Session state is lost when connections are recycled. Use `set_config(..., false)` exclusively.

### Recommended Pattern — Prisma Helper Function

The cleanest approach for Next.js Server Actions is a wrapper function that opens a Prisma transaction, sets the claims, then runs the caller's queries in that same transaction:

```typescript
// lib/prisma-rls.ts
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/lib/generated/prisma/client";

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function withRLS<T>(
  userId: string,
  fn: (tx: TxClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT set_config(
        'request.jwt.claims',
        ${JSON.stringify({ sub: userId, aud: "authenticated", role: "authenticated" })},
        false
      )
    `;
    return fn(tx);
  });
}
```

Usage in a Server Action:

```typescript
// app/actions/transactions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { withRLS } from "@/lib/prisma-rls";

export async function getUserTransactions() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return withRLS(user.id, (tx) =>
    tx.transaction.findMany({
      orderBy: { date: "desc" },
    })
  );
}
```

This guarantees `set_config` and the query run in the same PostgreSQL transaction. The claims cannot "leak" between requests.

### Alternative — `prisma-extension-supabase-rls`

There is a maintained open-source Prisma client extension specifically for this: [`prisma-extension-supabase-rls`](https://github.com/dthyresson/prisma-extension-supabase-rls). It wraps every query automatically. Suitable if you want global enforcement without per-action wrappers. The `withRLS` helper above is preferred for this project because it gives explicit control per Server Action and avoids magic global behavior.

---

## 4. RLS Policy SQL

Enable RLS on both tables before creating policies:

```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

### `categories` Table

System-default rows have `user_id = NULL`. Authenticated users may read all defaults plus their own custom categories; they may only write rows they own.

```sql
-- SELECT: system defaults + own custom categories
CREATE POLICY "categories_select"
  ON categories FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

-- INSERT: only own categories (user_id must match caller)
CREATE POLICY "categories_insert"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: only own categories; cannot reassign to another user
CREATE POLICY "categories_update"
  ON categories FOR UPDATE
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: only own categories
CREATE POLICY "categories_delete"
  ON categories FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
```

### `transactions` Table

Strict isolation — a user can only see and modify their own transactions.

```sql
-- SELECT
CREATE POLICY "transactions_select"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT
CREATE POLICY "transactions_insert"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE
CREATE POLICY "transactions_update"
  ON transactions FOR UPDATE
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE
CREATE POLICY "transactions_delete"
  ON transactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
```

**USING vs WITH CHECK:**
- `USING` — filters which existing rows are visible / targetable (SELECT, UPDATE, DELETE)
- `WITH CHECK` — validates the data being written (INSERT, UPDATE)
- UPDATE needs both: `USING` to select the row, `WITH CHECK` to validate the new values

---

## 5. Nullable `user_id` for System Default Categories

Rows where `user_id IS NULL` represent fixed system defaults (seeded at setup time). The `categories_select` policy above handles this correctly: `user_id IS NULL OR user_id = auth.uid()` returns both types to authenticated users.

Anon/unauthenticated requests see nothing (policies are `TO authenticated`).

No INSERT/UPDATE/DELETE policy covers `user_id IS NULL` rows — only the `postgres` superuser (used for seeding/migrations) can touch them. This is intentional: system defaults are immutable from the application layer.

---

## 6. pgBouncer / Supavisor Gotchas

| Scenario | Safe? | Notes |
|---|---|---|
| `set_config(..., false)` | Yes | Transaction-scoped; correct for transaction-mode pooler |
| `set_config(..., true)` | No | Session-scoped; persists across pooled connections |
| `SET LOCAL request.jwt.claims = ...` | No | Lost when connection is recycled |
| Setting claims outside a transaction then querying separately | No | Two separate pool checkouts; claims are lost |
| `?pgbouncer=true` in `DATABASE_URL` | Required | Disables prepared statements; mandatory for Prisma + pgBouncer |
| Migrations via `DIRECT_URL` (port 5432) | Yes | Bypass pooler for CLI operations |

**Always wrap `set_config` + the query together in a single `$transaction` call.** Never set claims in one await, then query in a separate await — those may be different pooler connections.

---

## 7. Local Testing

Test policies in Supabase SQL Editor or psql before deploying:

```sql
-- Simulate an authenticated user
SELECT set_config('request.jwt.claims', '{"sub":"<test-uuid>","role":"authenticated"}', false);

-- Should return system defaults + rows owned by <test-uuid>
SELECT * FROM categories;

-- Should return only rows owned by <test-uuid>
SELECT * FROM transactions;
```

To verify a policy blocks unauthorized access:

```sql
-- Reset to no user
SELECT set_config('request.jwt.claims', '', false);

-- Should return empty (or error if RLS is working correctly)
SELECT * FROM transactions;
```

---

## 8. Implementation Order for This Project

1. Apply `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` for `categories` and `transactions` (can be done via a Prisma migration or raw SQL in Supabase dashboard).
2. Create the policies above in a migration SQL file (not managed by Prisma schema — use a raw SQL migration).
3. Add `withRLS` helper to `lib/prisma-rls.ts`.
4. Wrap all Server Actions that read/write `categories` or `transactions` with `withRLS(user.id, ...)`.
5. Seed system default categories using a direct connection (superuser bypasses RLS, which is correct for seeding).

---

## Sources

- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Prisma Integration Guide](https://supabase.com/docs/guides/database/prisma)
- [Prisma Docs: Supabase](https://www.prisma.io/docs/orm/v6/overview/databases/supabase)
- [prisma-extension-supabase-rls (GitHub)](https://github.com/dthyresson/prisma-extension-supabase-rls)
- [Supavisor FAQ](https://supabase.com/docs/guides/troubleshooting/supavisor-faq-YyP5tI)
- [set_config with Supabase RLS (DEV Community)](https://dev.to/moofoo/nestjspostgresprisma-multi-tenancy-using-nestjs-prisma-nestjs-cls-and-prisma-client-extensions-ok7)
