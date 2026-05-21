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
  return prisma.$transaction(async (tx) => {
    const claims: JwtClaims = {
      sub: userId,
      aud: "authenticated",
      role: "authenticated",
    };
    await tx.$executeRaw`SELECT set_config('request.jwt.claims', ${JSON.stringify(claims)}, false)`;
    return fn(tx);
  });
}
