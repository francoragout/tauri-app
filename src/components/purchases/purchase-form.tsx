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

  const isEditMode = Boolean(purchase);

  const [open, setOpen] = useState(false);

  const { mutate: createPurchase, isPending: isCreating } = CreatePurchase();
  const { mutate: updatePurchase, isPending: isUpdating } = UpdatePurchase();

  const form = useForm<z.infer<typeof PurchaseSchema>>({
    resolver: zodResolver(PurchaseSchema),
    defaultValues: {
      product_id: purchase?.product_id ?? undefined,
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
          onError: () => {
            toast.error("Error al actualizar compra");
          },
        }
      );
    } else {
      createPurchase(values, {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Compra creada");
        },
        onError: () => {
          toast.error("Error al crear compra");
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
              <PopoverDialog open={open} onOpenChange={setOpen}>
                <PopoverDialogTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
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
                <PopoverDialogContent
                  className="p-0"
                  side="right"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Buscar producto..." />
                    <CommandList>
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            value={product.name}
                            key={product.id}
                            onSelect={() => {
                              if (typeof product.id === "number") {
                                form.setValue("product_id", product.id);
                              }
                              setOpen(false);
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
                  placeholder="Total (requerido)"
                />
              </FormControl>
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
            disabled={isPending || (isEditMode && !form.formState.isDirty)}
          >
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
}
