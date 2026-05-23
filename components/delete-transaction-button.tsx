"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteTransactionAction } from "@/app/(app)/actions";

export function DeleteTransactionButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete transaction"
        disabled={isPending}
        className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        onClick={() => {
          if (!window.confirm("Delete this transaction?")) return;
          setError(null);
          startTransition(async () => {
            const result = await deleteTransactionAction(id);
            if (!result.success) setError(result.error);
          });
        }}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
