"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Customer, SaleSchema } from "@/lib/zod";
import { useEffect, useState } from "react";
import { CreateSale } from "@/lib/mutations/useSale";
import { useDispatch } from "react-redux";
import { clearCart } from "@/features/cart/cartSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SaleCreateFormProps {
  customers: Customer[];
  products: any[];
  surcharge: number;
  onOpenChange?: (open: boolean) => void;
}

export function SaleCreateForm({
  customers,
  products,
  surcharge,
  onOpenChange = () => {},
}: SaleCreateFormProps) {
  const [value, setValue] = useState<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const form = useForm<z.infer<typeof SaleSchema>>({
    resolver: zodResolver(SaleSchema),
    defaultValues: {
      customer_id: value ? +value : undefined,
      surcharge_percent: surcharge,
      payment_method: "efectivo",
      products: products.map((product) => ({
        id: product.id,
        quantity: product.quantity,
      })),
      is_paid: value ? 0 : 1,
    },
  });

  useEffect(() => {
    form.setValue("surcharge_percent", surcharge);
  }, [surcharge, form]);

  const { mutate, isPending } = CreateSale();

  function onSubmit(values: z.infer<typeof SaleSchema>) {
    const updatedProducts = products.map((product) => ({
      id: product.id,
      quantity: product.quantity,
    }));

    const updatedValues = {
      ...values,
      products: updatedProducts,
      is_paid: value ? 0 : 1,
      surcharge_percent: values.surcharge_percent,
    };

    mutate(updatedValues, {
      onSuccess: () => {
        onOpenChange(false);

        dispatch(clearCart());
        setValue(undefined);
        toast.success("Venta registrada");
      },
      onError: (error: any) => {
        const errorMessage = error?.message || "Error al registrar venta";
        toast.error(errorMessage);
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || "efectivo"}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                  <SelectItem value="fiado">Fiado</SelectItem>
                  <SelectItem value="debito">Débito</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      size="sm"
                      role="combobox"
                      disabled={isPending}
                      className={cn(
                        "justify-between",
                        !field.value && "text-foreground"
                      )}
                    >
                      {value
                        ? customers.find((customer) => customer.id === value)
                            ?.full_name
                        : "Cliente (opcional)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[446px] p-0"
                  
                >
                  <Command>
                    <CommandInput placeholder="Filtrar clientes..." />
                    <CommandList>
                      <CommandEmpty>Sin resultados.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={`${customer.full_name} ${customer.reference}`}
                            onSelect={() => {
                              const same = value === customer.id;
                              const newValue = same ? undefined : customer.id;

                              setValue(newValue);
                              form.setValue("customer_id", newValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === customer.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {`${customer.full_name} ${customer.reference}`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isPending}>
            Confirmar venta
          </Button>
        </div>
      </form>
    </Form>
  );
}
