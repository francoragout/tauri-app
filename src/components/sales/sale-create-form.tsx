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
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Customer, SaleSchema } from "@/lib/zod";
import { useState } from "react";
import { CreateSale } from "@/lib/mutations/useSale";
import { useDispatch } from "react-redux";
import { clearCart } from "@/features/cart/cartSlice";

interface SaleCreateFormProps {
  customers: Customer[];
  totalPrice: number;
  items: any[];
  onOpenChange?: (open: boolean) => void;
}

export function SaleCreateForm({
  customers,
  totalPrice,
  items,
  onOpenChange = () => {},
}: SaleCreateFormProps) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const form = useForm<z.infer<typeof SaleSchema>>({
    resolver: zodResolver(SaleSchema),
    defaultValues: {
      customer_id: value ? +value : undefined,
      total: totalPrice,
      items: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
      is_paid: value ? 0 : 1,
    },
  });

  const { mutate, isPending } = CreateSale();

  function onSubmit(values: z.infer<typeof SaleSchema>) {
    mutate(values, {
      onSuccess: () => {
        onOpenChange(false);

        dispatch(clearCart());
        setValue("");
        toast.success("Venta realizada exitosamente.");
      },
      onError: (error: any) => {
        const errorMessage = error?.message || "Error al realizar la venta.";
        toast.error(errorMessage);
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-2 items-center mt-4 mb-2"
      >
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
                        ? customers.find((customer) => customer.id === +value)
                            ?.full_name
                        : "Cliente (opcional)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-120 p-0 -translate-x-[17px] rounded-t-none mt-3"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Filtrar clientes..." />
                    <CommandList>
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={customer.full_name}
                            onSelect={(currentValue) => {
                              const selectedCustomer = customers.find(
                                (c) => c.full_name === currentValue
                              );

                              if (!selectedCustomer?.id) return;

                              if (value === selectedCustomer.id.toString()) {
                                setValue("");
                                form.setValue("customer_id", undefined); // Limpia el campo en el formulario
                              } else {
                                setValue(selectedCustomer.id.toString());
                                form.setValue(
                                  "customer_id",
                                  selectedCustomer.id
                                ); // Actualiza el campo en el formulario
                              }

                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === customer.id?.toString()
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
        <Button type="submit" size="sm" disabled={isPending}>
          Confirmar venta
        </Button>
      </form>
    </Form>
  );
}
