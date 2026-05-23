"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withRLS } from "@/lib/prisma-rls";

export type DeleteTransactionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteTransactionAction(
  transactionId: string,
): Promise<DeleteTransactionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  try {
    await withRLS(user.id, async (tx) => {
      await tx.transaction.delete({ where: { id: transactionId } });
    });
  } catch {
    return { success: false, error: "Could not delete transaction." };
  }

  revalidatePath("/");
  return { success: true };
}
