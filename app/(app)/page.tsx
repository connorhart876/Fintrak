import { TransactionList } from "@/components/transaction-list";
import { MonthlyTotals } from "@/components/monthly-totals";
import { AddTransactionForm } from "@/components/transactions/add-transaction-form";
import { createClient } from "@/lib/supabase/server";
import { getDefaultCategories } from "@/lib/categories";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // middleware guarantees user is authenticated; null check satisfies TypeScript
  if (!user) return null;

  const categories = await getDefaultCategories(user.id);

  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)_24rem]">
      {/* Left: scrollable transaction list */}
      <section className="flex min-h-0 flex-col overflow-y-auto border-r border-border/60 px-6 py-6">
        <header className="mb-4 flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Transactions
          </h1>
        </header>
        <MonthlyTotals />
        <TransactionList />
      </section>

      {/* Right: persistent add-transaction form panel */}
      <aside className="flex min-h-0 flex-col overflow-y-auto px-6 py-6">
        <header className="mb-4">
          <h2 className="text-base font-semibold tracking-tight">
            Add transaction
          </h2>
        </header>
        <AddTransactionForm categories={categories} />
      </aside>
    </div>
  );
}
