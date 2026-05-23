import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { withRLS } from "@/lib/prisma-rls";
import { DeleteTransactionButton } from "@/components/delete-transaction-button";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export async function TransactionList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = await withRLS(user.id, async (tx) =>
    tx.transaction.findMany({
      orderBy: { date: "desc" },
      include: { category: { select: { name: true } } },
    }),
  );

  if (rows.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No transactions yet. Add one on the right →
      </div>
    );
  }

  return (
    <ul className="flex-1">
      {rows.map((t) => {
        const isExpense = t.type === "EXPENSE";
        const sign = isExpense ? "−" : "+";
        const amountColor = isExpense ? "text-red-400" : "text-emerald-400";
        return (
          <li
            key={t.id}
            className="group flex items-center gap-4 border-b border-border/40 px-1 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{t.title}</div>
              <div className="font-mono text-xs text-muted-foreground">
                {t.category.name} · {dateFmt.format(t.date)}
              </div>
            </div>
            <div className={`font-mono text-sm font-medium ${amountColor}`}>
              {sign}
              {currency.format(Number(t.amount))}
            </div>
            <DeleteTransactionButton id={t.id} />
          </li>
        );
      })}
    </ul>
  );
}
