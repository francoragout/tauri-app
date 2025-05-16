import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { Customer, PaymentSchema } from "@/lib/zod";
import { Input } from "../ui/input";
import { useEffect } from "react";
import { PaySales } from "@/lib/mutations/useSale";
import { toast } from "sonner";

interface CustomerPaymentFormProps {
  customer: Customer;
  onOpenChange: (open: boolean) => void;
}

export default function CustomerPaymentForm({
  customer,
  onOpenChange,
}: CustomerPaymentFormProps) {
  const form = useForm<z.infer<typeof PaymentSchema>>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      customer_id: customer.id,
      total: customer.debt as number,
      surcharge_percent: 0,
    },
  });

  // Nuevo efecto para actualizar el total con el recargo
  useEffect(() => {
    const surcharge = form.watch("surcharge_percent") || 0;
    const baseTotal = customer.debt as number;
    const newTotal = baseTotal + (baseTotal * surcharge) / 100;
    form.setValue("total", Number(newTotal.toFixed(2)));
  }, [form.watch("surcharge_percent"), customer.debt]);

  const { mutate, isPending } = PaySales();

  function onSubmit(values: z.infer<typeof PaymentSchema>) {
    mutate(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
        toast.success("Deuda pagada");
      },
      onError: () => {
        toast.error("Error al registrar el pago");
      },
    });

    onOpenChange(false);
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
                    <SelectValue placeholder="Metodo de pago (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash" className="hover:bg-accent">
                    Efectivo
                  </SelectItem>
                  <SelectItem value="transfer" className="hover:bg-accent">
                    Transferencia
                  </SelectItem>
                  <SelectItem value="debit" className="hover:bg-accent">
                    Débito
                  </SelectItem>
                  <SelectItem value="credit" className="hover:bg-accent">
                    Crédito
                  </SelectItem>
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
                <Input placeholder="shadcn" readOnly {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
