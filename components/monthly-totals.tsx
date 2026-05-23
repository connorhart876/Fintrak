import { createClient } from "@/lib/supabase/server";
import { withRLS } from "@/lib/prisma-rls";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export async function MonthlyTotals() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  const grouped = await withRLS(user.id, async (tx) =>
    tx.transaction.groupBy({
      by: ["type"],
      _sum: { amount: true },
      where: { date: { gte: start, lt: end } },
    }),
  );

  const income = Number(
    grouped.find((g) => g.type === "INCOME")?._sum.amount ?? 0,
  );
  const expenses = Number(
    grouped.find((g) => g.type === "EXPENSE")?._sum.amount ?? 0,
  );
  const net = income - expenses;

  return (
    <div className="mb-4 flex items-baseline gap-6 border-b border-border/40 pb-4">
      <div className="space-y-0.5">
        <div className="text-xs text-muted-foreground">Income</div>
        <div className="font-mono text-sm font-medium text-emerald-400">
          +{currency.format(income)}
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="text-xs text-muted-foreground">Expenses</div>
        <div className="font-mono text-sm font-medium text-red-400">
          &minus;{currency.format(expenses)}
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="text-xs text-muted-foreground">Net</div>
        <div
          className={`font-mono text-sm font-medium ${net < 0 ? "text-red-400" : "text-muted-foreground"}`}
        >
          {net < 0 ? <>&minus;</> : null}
          {currency.format(Math.abs(net))}
        </div>
      </div>
    </div>
  );
}
