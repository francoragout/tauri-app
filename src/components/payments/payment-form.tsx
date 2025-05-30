import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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

import {
  PopoverDialog,
  PopoverDialogContent,
  PopoverDialogTrigger,
} from "../ui/popover-dialog";

import { Payment, PaymentSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreatePayment, UpdatePayment } from "@/lib/mutations/usePayment";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { GetCustomers } from "@/lib/mutations/useCustomer";
import { Check, ChevronsUpDown } from "lucide-react";
import { NumericFormat } from "react-number-format";

type PaymentFormProps = {
  payment?: Payment;
  onOpenChange: (open: boolean) => void;
};

export default function PaymentForm({
  payment,
  onOpenChange,
}: PaymentFormProps) {
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: GetCustomers,
  });

  const isEditMode = Boolean(payment);
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: createPayment, isPending: isCreating } = CreatePayment();
  const { mutate: updatePayment, isPending: isUpdating } = UpdatePayment();

  const form = useForm<z.infer<typeof PaymentSchema>>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      customer_id: payment?.customer_id ?? undefined,
      type: payment?.type ?? undefined,
      method: payment?.method ?? undefined,
      surcharge: payment?.surcharge ?? 0,
      amount: payment?.amount ?? undefined,
    },
  });

  function onSubmit(values: z.infer<typeof PaymentSchema>) {
    if (isEditMode && payment?.id) {
      updatePayment(
        { id: payment.id, ...values },
        {
          onSuccess: () => {
            onOpenChange(false);
            toast.success("Pago actualizado");
          },
          onError: () => {
            toast.error("Error al actualizar pago");
          },
        }
      );
    } else {
      createPayment(values, {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Pago registrado");
        },
        onError: () => {
          toast.error("Error al registrar Pago");
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
          name="customer_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <PopoverDialog open={isOpen} onOpenChange={setIsOpen}>
                <PopoverDialogTrigger>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between h-9 hover:bg-background font-normal w-full",
                        !field.value &&
                          "hover:text-muted-foreground font-normal text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? (() => {
                            const customer = customers.find(
                              (customer) => customer.id === field.value
                            );
                            return customer
                              ? `${customer.full_name}${
                                  customer.reference
                                    ? ` (${customer.reference})`
                                    : ""
                                }`
                              : "";
                          })()
                        : "Cliente (requerido)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverDialogTrigger>
                <PopoverDialogContent className="w-[462px]">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>Sin resultados.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer) => (
                          <CommandItem
                            value={customer.full_name}
                            key={customer.id}
                            onSelect={() => {
                              if (typeof customer.id === "number") {
                                form.setValue("customer_id", customer.id, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                });
                              }
                              setIsOpen(false);
                            }}
                          >
                            {customer.full_name}{" "}
                            {customer.reference && `(${customer.reference})`}
                            <Check
                              className={cn(
                                "ml-auto",
                                customer.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverDialogContent>
              </PopoverDialog>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo de pago (requerido)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="full">Total</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
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

        <FormField
          control={form.control}
          name="surcharge"
          render={() => (
            <FormItem>
              <Select
                value={form.watch("surcharge").toString()}
                onValueChange={(value) =>
                  form.setValue("surcharge", Number(value), {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
                disabled={isPending}
              >
                <SelectTrigger className="bg-background w-full">
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

        <FormField
          control={form.control}
          name="amount"
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
                  placeholder="Monto (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Total con recargo
          </label>
          <Input
            readOnly
            value={
              (() => {
                const amount = form.watch("amount") ?? 0;
                const surcharge = form.watch("surcharge") ?? 0;
                const total = amount + (amount * surcharge) / 100;
                // Formatear a dos decimales y con separador de miles
                return total
                  .toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
              })()
            }
            className="bg-muted"
          />
        </div>

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
