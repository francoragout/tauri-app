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

import { CalendarIcon, Check, ChevronsUpDown, Loader2Icon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SaleSchema } from "@/lib/zod";
import { useEffect, useState, useMemo } from "react";
import { CreateSale } from "@/lib/mutations/useSale";
import { useDispatch } from "react-redux";
import { CartItem, clearCart } from "@/features/cart/cartSlice";
import { GetCustomers } from "@/lib/mutations/useCustomer";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SaleCreateFormProps {
  products: CartItem[];
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

  const [selectedCustomerId, setSelectedCustomerId] = useState<number>();
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dispatch = useDispatch();
  const { mutate, isPending } = CreateSale();

  const form = useForm<z.infer<typeof SaleSchema>>({
    resolver: zodResolver(SaleSchema),
    defaultValues: {
      payment_method: "cash",
      customer_id: undefined,
      total,
      surcharge,
      is_paid: 1,
      products: [],
      created_at: new Date(),
    },
  });

  useEffect(() => {
    const formattedProducts = products.map((product) => ({
      id: product.id,
      quantity: product.quantity,
      price: product.price,
      name: product.name,
      stock: product.stock,
      low_stock_threshold: product.low_stock_threshold,
    }));
    form.setValue("products", formattedProducts);
  }, [products, form]);

  const paymentMethod = form.watch("payment_method");

  useEffect(() => {
    if (paymentMethod === "cash") {
      onSurchargeChange(0);
      setSelectedCustomerId(undefined);
      form.setValue("customer_id", undefined);
      form.setValue("total", total);
      form.setValue("surcharge", 0);
      form.setValue("is_paid", 1);
    } else if (paymentMethod === "account") {
      onSurchargeChange(0);
      form.setValue("total", 0);
      form.setValue("surcharge", 0);
      form.setValue("is_paid", 0);
    } else {
      onSurchargeChange(surcharge);
      form.setValue("surcharge", surcharge);
      form.setValue("total", total);
      setSelectedCustomerId(undefined);
      form.setValue("customer_id", undefined);
      form.setValue("is_paid", 1);
    }
  }, [paymentMethod, surcharge, total, form, onSurchargeChange]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [selectedCustomerId, customers]
  );

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
        console.error("Error al registrar venta:", error);
        toast.error(error?.message || "Error al registrar venta");
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="created_at"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PP", { locale: es })
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={es}
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <Select
                value={field.value}
                onValueChange={field.onChange}
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
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {selectedCustomer
                        ? selectedCustomer.name
                        : "Cliente (opcional)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[466px]">
                    <Command>
                      <CommandInput placeholder="Filtrar clientes..." />
                      <CommandList>
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
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
                              {customer.name}
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
            {isPending ? <Loader2Icon className="animate-spin" /> : "Registrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
