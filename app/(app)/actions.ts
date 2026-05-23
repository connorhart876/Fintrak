"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withRLS } from "@/lib/prisma-rls";
import {
  CreateTransactionSchema,
  type CreateTransactionInput,
} from "@/lib/validators/transaction";

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

export type CreateTransactionResult =
  | { success: true }
  | {
      success: false;
      error: string;
      fieldErrors?: Partial<Record<keyof CreateTransactionInput, string>>;
    };

export async function createTransactionAction(
  input: CreateTransactionInput,
): Promise<CreateTransactionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const parsed = CreateTransactionSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof CreateTransactionInput, string>> =
      {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof CreateTransactionInput;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: "Please fix the errors above.", fieldErrors };
  }

  const { title, amount, date, type, categoryId } = parsed.data;

  try {
    await withRLS(user.id, async (tx) => {
      await tx.transaction.create({
        data: {
          userId: user.id,
          title,
          amount,
          date: new Date(date),
          type,
          categoryId,
        },
      });
    });
  } catch {
    return { success: false, error: "Could not create transaction." };
  }

  revalidatePath("/");
  return { success: true };
}
