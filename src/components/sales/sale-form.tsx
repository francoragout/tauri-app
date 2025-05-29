import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

import { Check, ChevronsUpDown } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SaleSchema } from "@/lib/zod";
import { useEffect, useState } from "react";
import { CreateSale } from "@/lib/mutations/useSale";
import { useDispatch } from "react-redux";
import { clearCart } from "@/features/cart/cartSlice";
import { GetCustomers } from "@/lib/mutations/useCustomer";
import { useQuery } from "@tanstack/react-query";

interface SaleCreateFormProps {
  products: any[];
  onOpenChange: (open: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  totalPrice: number;
}

export function SaleForm({
  products,
  onOpenChange,
  paymentMethod,
  setPaymentMethod,
  totalPrice,
}: SaleCreateFormProps) {
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: GetCustomers,
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<
    number | undefined
  >(undefined);

  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { mutate, isPending } = CreateSale();

  const form = useForm<z.infer<typeof SaleSchema>>({
    resolver: zodResolver(SaleSchema),
    defaultValues: {
      payment_method: paymentMethod,
      customer_id: undefined,
      total: totalPrice,
      is_paid: 1,
      products: [],
    },
  });

  useEffect(() => {
    form.setValue(
      "products",
      products.map((product) => ({
        id: product.id,
        quantity: product.quantity,
      }))
    );
    form.setValue("total", totalPrice);
  }, [products, totalPrice]);

  useEffect(() => {
    form.setValue("payment_method", paymentMethod);
    form.setValue("is_paid", paymentMethod === "customer_account" ? 0 : 1);
    if (paymentMethod !== "customer_account") {
      form.setValue("customer_id", undefined);
      setSelectedCustomerId(undefined);
    }
  }, [paymentMethod]);

  function onSubmit(values: z.infer<typeof SaleSchema>) {
    mutate(values, {
      onSuccess: () => {
        toast.success("Venta registrada");
        dispatch(clearCart());
        setSelectedCustomerId(undefined);
        onOpenChange(false);
        setPaymentMethod("cash");
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
          render={() => (
            <FormItem>
              <Select
                value={form.watch("payment_method")}
                onValueChange={(value) => {
                  setPaymentMethod(value);
                }}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Metodo de pago (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="customer_account">
                    Cuenta Corriente
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {paymentMethod === "customer_account" && (
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      role="combobox"
                      disabled={isPending}
                      className={cn(
                        "justify-between h-9 hover:bg-background font-normal",
                        !field.value &&
                          "hover:text-muted-foreground font-normal text-muted-foreground"
                      )}
                    >
                      {selectedCustomerId
                        ? customers.find(
                            (customer) => customer.id === selectedCustomerId
                          )?.full_name
                        : "Cliente (opcional)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[446px]">
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
                                const same = selectedCustomerId === customer.id;
                                const newValue = same ? undefined : customer.id;

                                setSelectedCustomerId(newValue);
                                form.setValue("customer_id", newValue);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCustomerId === customer.id
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
        )}

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isPending}>
            Confirmar venta
          </Button>
        </div>
      </form>
    </Form>
  );
}
