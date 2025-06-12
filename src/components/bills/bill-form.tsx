import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Bill, BillSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { NumericFormat } from "react-number-format";
import { PayBill } from "@/lib/mutations/useBill";
import { useEffect } from "react";

type BillFormProps = {
  bill: Bill;
  onOpenChange: (open: boolean) => void;
};

export default function BillForm({ onOpenChange, bill }: BillFormProps) {
  const form = useForm<z.infer<typeof BillSchema>>({
    resolver: zodResolver(BillSchema),
    defaultValues: {
      customer_id: bill.customer_id,
      customer_name: bill.customer_name,
      year_month: bill.year_month,
      payment_method: "cash", // Default to cash payment method
      surcharge: 0, // Default surcharge to 0%
      total_debt: bill.total_debt,
      sales_summary: bill.sales_summary.map((sale) => ({
        date: sale.date,
        sale_id: sale.sale_id,
        total: sale.total,
      })),
    },
  });

  const { mutate, isPending } = PayBill();

  // Observar el método de pago y el recargo
  const paymentMethod = form.watch("payment_method");
  const surcharge = form.watch("surcharge");

  // Actualizar total_debt solo si el método de pago es transferencia
  useEffect(() => {
    let nuevoTotal = bill.total_debt;
    if (paymentMethod === "transfer") {
      nuevoTotal = bill.total_debt * (1 + (surcharge ?? 0) / 100);
    }
    form.setValue("total_debt", Number(nuevoTotal.toFixed(2)));
  }, [paymentMethod, surcharge, bill.total_debt, form]);

  function onSubmit(values: z.infer<typeof BillSchema>) {
    mutate(values, {
      onSuccess: () => {
        toast.success("Pago registrado");
        onOpenChange(false);
      },
      onError: () => {
        toast.error(`Error al registrar pago`);
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customer_name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} readOnly disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year_month"
          render={({ field }) => {
            const rawDate = field.value as string;
            const parsed = parse(rawDate, "yyyy-MM", new Date());
            let displayValue = "-";
            if (isValid(parsed)) {
              const formatted = format(parsed, "MMMM yyyy", { locale: es });
              displayValue =
                formatted.charAt(0).toUpperCase() + formatted.slice(1);
            }
            return (
              <FormItem>
                <FormControl>
                  <Input
                    value={displayValue}
                    readOnly
                    tabIndex={-1}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full" disabled={isPending}>
                    <SelectValue placeholder="Metodo de pago (requerido)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {paymentMethod === "transfer" && (
          <FormField
            control={form.control}
            name="surcharge"
            render={({ field }) => (
              <FormItem>
                <Select
                  value={field.value?.toString() ?? "0"}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger
                    className="bg-background w-full"
                    disabled={isPending}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="total_debt"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NumericFormat
                  value={field.value}
                  onValueChange={(values) => {
                    field.onChange(values.floatValue ?? null);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  allowNegative={false}
                  customInput={Input}
                  disabled={isPending}
                  readOnly
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
          <Button type="submit" size="sm" disabled={isPending}>
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
}
