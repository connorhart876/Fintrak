"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CreateTransactionSchema,
  type CreateTransactionInput,
} from "@/lib/validators/transaction";
import { createTransactionAction } from "@/app/(app)/actions";

type Category = { id: string; name: string };

interface AddTransactionFormProps {
  categories: Category[];
}

export function AddTransactionForm({ categories }: AddTransactionFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      title: "",
      date: "",
      categoryId: "",
    },
  });

  async function onSubmit(values: CreateTransactionInput) {
    setFormError(null);
    const result = await createTransactionAction(values);
    if (!result.success) {
      if (result.fieldErrors) {
        for (const [key, message] of Object.entries(result.fieldErrors)) {
          setError(key as keyof CreateTransactionInput, { message });
        }
      } else {
        setFormError(result.error);
      }
      return;
    }
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label>Type</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={0}
              value={field.value ?? ""}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="w-full"
            >
              <ToggleGroupItem value="EXPENSE" className="flex-1">
                Expense
              </ToggleGroupItem>
              <ToggleGroupItem value="INCOME" className="flex-1">
                Income
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        />
        {errors.type && (
          <p className="text-xs text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. Coffee"
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          className="font-mono"
          aria-invalid={!!errors.amount}
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          className="font-mono"
          aria-invalid={!!errors.date}
          {...register("date")}
        />
        {errors.date && (
          <p className="text-xs text-destructive">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field, fieldState }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                className="w-full"
                aria-invalid={!!fieldState.error}
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-xs text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding…" : "Add transaction"}
      </Button>
    </form>
  );
}
