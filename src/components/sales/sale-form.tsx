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
import { CartItem, SaleSchema } from "@/lib/zod";
import { useEffect, useState, useMemo } from "react";
import { CreateSale } from "@/lib/mutations/useSale";
import { useDispatch } from "react-redux";
import { clearCart } from "@/features/cart/cartSlice";
import { GetCustomers } from "@/lib/mutations/useCustomer";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SaleCreateFormProps {
  products: CartItem[];
  total: number;
  onOpenChange: (open: boolean) => void;
  onSurchargeChange: (surcharge: number) => void;
}

export function SaleForm({
  products,
  total,
  onOpenChange,
  onSurchargeChange,
}: SaleCreateFormProps) {
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: GetCustomers,
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<number>();

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dispatch = useDispatch();
  const { mutate, isPending } = CreateSale();

  const form = useForm<z.infer<typeof SaleSchema>>({
    resolver: zodResolver(SaleSchema),
    defaultValues: {
      payment_method: undefined,
      customer_id: undefined,
      created_at: new Date(),
    },
  });

  useEffect(() => {
    form.setValue("products", products);
  }, [products, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      const hasTransfer = value.payment_method === "transfer";
      onSurchargeChange(hasTransfer ? 5 : 0);

      if (
        value.payment_method !== "account" &&
        value.customer_id !== undefined
      ) {
        form.setValue("customer_id", undefined);
        setSelectedCustomerId(undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, onSurchargeChange]);

  useEffect(() => {
    form.setValue("total", total);
  }, [total, form]);

  function onSubmit(values: z.infer<typeof SaleSchema>) {
    mutate(values, {
      onSuccess: () => {
        toast.success("Venta registrada");
        dispatch(clearCart());
        onSurchargeChange(0);
        setSelectedCustomerId(undefined);
        form.reset({
          payment_method: undefined,
          customer_id: undefined,
          created_at: new Date(),
          products: [],
          total: 0,
        });
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Error al registrar venta";
        toast.error(message);
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
                      "pl-3 text-left font-normal hover:bg-transparent",
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
                    <SelectValue placeholder="Metodo de pago (requerido)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia (+5%)</SelectItem>
                  <SelectItem value="account">Cuenta</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("payment_method") === "account" && (
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
                        "justify-between h-9 hover:bg-background w-full",
                        !field.value &&
                          "hover:text-muted-foreground text-muted-foreground"
                      )}
                    >
                      {selectedCustomer
                        ? selectedCustomer.name
                        : "Cliente (requerido)"}
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
