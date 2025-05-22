import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Expense, ExpenseSchema } from "@/lib/zod";
import { CreateExpense, UpdateExpense } from "@/lib/mutations/useExpense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";

type ExpenseFormProps = {
  expense?: Expense;
  onOpenChange: (open: boolean) => void;
};

export default function ExpenseForm({
  expense,
  onOpenChange,
}: ExpenseFormProps) {
  const isEditMode = Boolean(expense);

  const { mutate: createExpense, isPending: isCreating } = CreateExpense();
  const { mutate: updateExpense, isPending: isUpdating } = UpdateExpense();

  const form = useForm<z.infer<typeof ExpenseSchema>>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      category: expense?.category ?? "",
      description: expense?.description ?? "",
      amount: expense?.amount ?? undefined,
    },
  });

  function onSubmit(values: z.infer<typeof ExpenseSchema>) {
    if (isEditMode && expense?.id) {
      updateExpense(
        { id: expense.id, ...values },
        {
          onSuccess: () => {
            onOpenChange(false);
            toast.success("Expensa actualizada");
          },
          onError: () => {
            toast.error("Error al actualizar expensa");
          },
        }
      );
    } else {
      createExpense(values, {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Expensa registrada");
        },
        onError: () => {
          toast.error("Error al registrar expensa");
        },
      });
    }
  }

  const isPending = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NumericFormat
                  value={field.value}
                  onValueChange={(values) => {
                    field.onChange(values.floatValue);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  allowNegative={false}
                  customInput={Input}
                  disabled={isPending}
                  placeholder="Monto (requerido)"
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
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending || (isEditMode && !form.formState.isDirty)}
          >
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
}
