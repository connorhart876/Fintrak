"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteTransactionAction } from "@/app/(app)/actions";

export function DeleteTransactionButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Delete transaction"
      disabled={isPending}
      className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      onClick={() =>
        startTransition(async () => {
          await deleteTransactionAction(id);
        })
      }
    >
      <Trash2 className="h-4 w-4 text-muted-foreground" />
    </Button>
  );
}
