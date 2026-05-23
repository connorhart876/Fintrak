import { withRLS } from "@/lib/prisma-rls";

export async function getDefaultCategories(userId: string) {
  return withRLS(userId, async (tx) =>
    tx.category.findMany({
      where: { isDefault: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  );
}
