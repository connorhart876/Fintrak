import { Card } from "@/components/ui/card";

export default function TransactionsPage() {
  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)_24rem]">
      {/* Left: scrollable transaction list */}
      <section className="flex min-h-0 flex-col overflow-y-auto border-r border-border/60 px-6 py-6">
        <header className="mb-4 flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Transactions
          </h1>
        </header>
        <Card className="flex flex-1 items-center justify-center border-dashed bg-transparent text-sm text-muted-foreground">
          Transaction list lands in issue #14.
        </Card>
      </section>

      {/* Right: persistent add-transaction form panel */}
      <aside className="flex min-h-0 flex-col overflow-y-auto px-6 py-6">
        <header className="mb-4">
          <h2 className="text-base font-semibold tracking-tight">
            Add transaction
          </h2>
        </header>
        <Card className="flex flex-1 items-center justify-center border-dashed bg-transparent p-6 text-sm text-muted-foreground">
          Add-transaction form lands in issue #15.
        </Card>
      </aside>
    </div>
  );
}
