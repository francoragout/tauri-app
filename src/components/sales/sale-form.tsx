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
  surcharge: number;
  total: number;
  onOpenChange: (open: boolean) => void;
  onSurchargeChange: (surcharge: number) => void;
}

export function SaleForm({
  products,
  surcharge,
  total,
  onOpenChange,
  onSurchargeChange,
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
      payment_method: "cash",
      customer_id: undefined,
      total: total,
      surcharge: surcharge,
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
  }, [products]);

  const paymentMethod = form.watch("payment_method");

  useEffect(() => {
    switch (paymentMethod) {
      case "cash":
        onSurchargeChange(0);
        setSelectedCustomerId(undefined);
        form.setValue("customer_id", undefined);
        form.setValue("total", total);
        form.setValue("surcharge", 0);
        form.setValue("is_paid", 1);
        break;

      case "account":
        onSurchargeChange(0);
        form.setValue("total", 0);
        form.setValue("surcharge", 0);
        form.setValue("is_paid", 0);
        break;

      default:
        onSurchargeChange(surcharge);
        form.setValue("surcharge", surcharge);
        form.setValue("total", total);
        setSelectedCustomerId(undefined);
        form.setValue("customer_id", undefined);
        form.setValue("is_paid", 1);
        break;
    }
  }, [paymentMethod, surcharge, total]);

  function onSubmit(values: z.infer<typeof SaleSchema>) {
    mutate(values, {
      onSuccess: () => {
        toast.success("Venta registrada");
        dispatch(clearCart());
        onSurchargeChange(0);
        setSelectedCustomerId(undefined);
        onOpenChange(false);
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
                disabled={isPending}
                defaultValue="cash"
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Metodo de pago (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="account">Cuenta</SelectItem>
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
            render={() => (
              <FormItem>
                <Select
                  value={surcharge.toString()}
                  onValueChange={(value) => onSurchargeChange(Number(value))}
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
        )}

        {paymentMethod === "account" && (
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
                        ? (() => {
                            const customer = customers.find(
                              (customer) => customer.id === selectedCustomerId
                            );
                            if (!customer) return null;
                            return customer.reference
                              ? `${customer.name} (${customer.reference})`
                              : customer.name;
                          })()
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
                              value={`${customer.name} ${customer.reference}`}
                              onSelect={() => {
                                setSelectedCustomerId(customer.id);
                                form.setValue("customer_id", customer.id, {
                                  shouldValidate: true,
                                });
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
                              {`${customer.name}${
                                customer.reference
                                  ? ` (${customer.reference})`
                                  : ""
                              }`}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
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
