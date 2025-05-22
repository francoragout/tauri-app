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

import { PaySales } from "@/lib/mutations/useSale";
import { Customer, PaymentSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type CustomerPayFormProps = {
  customer: Customer;
  onOpenChange: (open: boolean) => void;
};

export default function CustomerPaymentForm({
  customer,
  onOpenChange,
}: CustomerPayFormProps) {
  const { mutate, isPending } = PaySales();

  const form = useForm<z.infer<typeof PaymentSchema>>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      customer_id: customer.id,
      surcharge_percent: 0,
      total: customer.debt,
    },
  });

  function onSubmit(values: z.infer<typeof PaymentSchema>) {
    mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success("Pago registrado");
      },
      onError: () => {
        toast.error("Error al registrar pago");
      },
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full" disabled={isPending}>
                    <SelectValue placeholder="Metodo de pago (requerido)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="surcharge_percent"
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
                  {[0, 1, 2, 3, 4, 5, 6].map((value) => (
                    <SelectItem
                      key={value}
                      value={value.toString()}
                      className="hover:bg-accent"
                    >
                      {value}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total"
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
            disabled={isPending || !form.formState.isDirty}
          >
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
}
