import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type JwtClaims = {
  sub: string;
  aud: "authenticated";
  role: "authenticated";
};

/**
 * Wraps a Prisma query in a transaction that sets the Supabase JWT claims so
 * RLS policies referencing `auth.uid()` evaluate against the given user.
 * See research_report_rls.md for the full rationale.
 */
export async function withRLS<T>(
  userId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const claims: JwtClaims = {
    sub: userId,
    aud: "authenticated",
    role: "authenticated",
  };
  // Set session-level JWT claims so RLS policies referencing auth.uid() evaluate
  // correctly. Using session scope (local=false) without an interactive transaction
  // because $transaction's interactive callback mode has a known issue with the
  // PrismaPg driver adapter in Next.js. With max:1 in the pool, the single
  // connection is never shared across concurrent requests.
  await prisma.$queryRaw`SELECT set_config('request.jwt.claims', ${JSON.stringify(claims)}, false)`;
  return fn(prisma as unknown as Prisma.TransactionClient);
}
