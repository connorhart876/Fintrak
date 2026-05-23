import { z } from "zod";

export const CreateTransactionSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  amount: z
    .number()
    .finite("Enter a valid amount.")
    .positive("Amount must be greater than 0."),
  date: z.string().min(1, "Date is required."),
  categoryId: z.string().min(1, "Choose a category."),
  type: z.enum(["EXPENSE", "INCOME"]),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
