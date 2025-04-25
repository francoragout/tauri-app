import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Expense, ExpenseSchema } from "@/lib/zod";
import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UpdateExpense } from "@/lib/mutations/useExpense";

interface ExpenseUpdateFormProps {
  expense: Expense;
  onOpenChange: (open: boolean) => void;
}

export default function ExpenseUpdateForm({
  expense,
  onOpenChange,
}: ExpenseUpdateFormProps) {
  const { mutate, isPending } = UpdateExpense();

  const form = useForm<z.infer<typeof ExpenseSchema>>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
    },
  });

  useEffect(() => {
    if (!onOpenChange) {
      form.reset({
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
      });
    }
  }, [expense, form, onOpenChange]);

  function onSubmit(values: z.infer<typeof ExpenseSchema>) {
    values.id = expense.id;
    mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success("Gasto actualizado");
      },
      onError: () => {
        toast.error("Error al actualizar gasto");
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Monto (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Categoría (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Descripción (opcional)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !form.formState.isDirty}
          >
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
}
