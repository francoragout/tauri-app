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
  PopoverDialog,
  PopoverDialogContent,
  PopoverDialogTrigger,
} from "../ui/popover-dialog";

import { Purchase, PurchaseSchema } from "@/lib/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { CreatePurchase, UpdatePurchase } from "@/lib/mutations/usePurchase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NumericFormat } from "react-number-format";
import { GetProducts } from "@/lib/mutations/useProduct";
import { useQuery } from "@tanstack/react-query";
import { GetSuppliers } from "@/lib/mutations/useSupplier";

interface PurchaseFormProps {
  purchase?: Purchase;
  onOpenChange: (open: boolean) => void;
}

export default function PurchaseForm({
  purchase,
  onOpenChange,
}: PurchaseFormProps) {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: GetProducts,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: GetSuppliers,
  });

  const isEditMode = Boolean(purchase);

  const [openProduct, setOpenProduct] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);

  const { mutate: createPurchase, isPending: isCreating } = CreatePurchase();
  const { mutate: updatePurchase, isPending: isUpdating } = UpdatePurchase();

  const form = useForm<z.infer<typeof PurchaseSchema>>({
    resolver: zodResolver(PurchaseSchema),
    defaultValues: {
      product_id: purchase?.product_id ?? undefined,
      supplier_id: purchase?.supplier_id ?? undefined,
      payment_method: purchase?.payment_method ?? undefined,
      total: purchase?.total ?? undefined,
      quantity: purchase?.quantity ?? undefined,
    },
  });

  function onSubmit(values: z.infer<typeof PurchaseSchema>) {
    if (isEditMode && purchase?.id) {
      updatePurchase(
        { id: purchase.id, ...values },
        {
          onSuccess: () => {
            onOpenChange(false);
            toast.success("Compra actualizada");
          },
          onError: (error: unknown) => {
            const message =
              error instanceof Error
                ? error.message
                : "Error al registrar compra";
            toast.error(message);
          },
        }
      );
    } else {
      createPurchase(values, {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Compra registrada");
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "Error al registrar compra";
          toast.error(message);
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
          name="product_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <PopoverDialog open={openProduct} onOpenChange={setOpenProduct}>
                <PopoverDialogTrigger>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      disabled={isPending}
                      className={cn(
                        "justify-between h-9 hover:bg-background font-normal w-full",
                        !field.value &&
                          "hover:text-muted-foreground font-normal text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? products.find((product) => product.id === field.value)
                            ?.name
                        : "Producto (requerido)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverDialogTrigger>
                <PopoverDialogContent className="w-[462px]">
                  <Command>
                    <CommandInput placeholder="Buscar producto..." />
                    <CommandList>
                      <CommandEmpty>Sin resultados.</CommandEmpty>
                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            value={product.name}
                            key={product.id}
                            onSelect={() => {
                              if (typeof product.id === "number") {
                                form.setValue("product_id", product.id, {
                                  shouldDirty: true,
                                  shouldTouch: true, // <-- agrega esto
                                  shouldValidate: true, // <-- y esto
                                });
                              }
                              setOpenProduct(false);
                            }}
                          >
                            {product.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                product.id === field.value
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
          name="supplier_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <PopoverDialog open={openSupplier} onOpenChange={setOpenSupplier}>
                <PopoverDialogTrigger>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      disabled={isPending}
                      className={cn(
                        "justify-between h-9 hover:bg-background font-normal w-full",
                        !field.value &&
                          "hover:text-muted-foreground font-normal text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? suppliers.find(
                            (supplier) => supplier.id === field.value
                          )?.name
                        : "Proveedor (opcional)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverDialogTrigger>
                <PopoverDialogContent className="w-[462px]">
                  <Command>
                    <CommandInput placeholder="Buscar proveedor..." />
                    <CommandList>
                      <CommandEmpty>Sin resultados.</CommandEmpty>
                      <CommandGroup>
                        {suppliers.map((supplier) => (
                          <CommandItem
                            value={supplier.name}
                            key={supplier.id}
                            onSelect={() => {
                              if (typeof supplier.id === "number") {
                                form.setValue("supplier_id", supplier.id, {
                                  shouldDirty: true,
                                });
                              }
                              setOpenSupplier(false);
                            }}
                          >
                            {supplier.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                supplier.id === field.value
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
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Cantidad (requerido)"
                  type="number"
                />
              </FormControl>
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
                    field.onChange(values.floatValue ?? null);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  allowNegative={false}
                  customInput={Input}
                  disabled={isPending}
                  placeholder="Total (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
