import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

import { CreateProduct, UpdateProduct } from "@/lib/mutations/useProduct";
import { Product, ProductSchema } from "@/lib/zod";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { clearCart } from "@/features/cart/cartSlice";
import { useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { GetOwners } from "@/lib/mutations/useOwner";

type ProductFormProps = {
  product?: Product;
  onOpenChange: (open: boolean) => void;
};

export default function ProductForm({
  product,
  onOpenChange,
}: ProductFormProps) {
  const isEditMode = Boolean(product);
  const dispatch = useDispatch();
  const [openOwner, setOpenOwner] = useState(false);

  const { data: owners = [] } = useQuery({
    queryKey: ["owners"],
    queryFn: GetOwners,
  });

  const { mutate: createProduct, isPending: isCreating } = CreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = UpdateProduct();

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      category: product?.category ?? "",
      price: product?.price ?? undefined,
      stock: product?.stock ?? undefined,
      low_stock_threshold: product?.low_stock_threshold ?? undefined,
      owners:
        product?.owners?.map((owner) => ({
          id: owner.id,
          name: owner.name,
          percentage: owner.percentage ?? 0, // Asegura que el porcentaje esté definido
        })) ?? [],
    },
  });

  // Si solo hay un propietario, su porcentaje será 100
  useEffect(() => {
    const owners = form.watch("owners");
    if (owners.length === 1 && owners[0].percentage !== 100) {
      form.setValue("owners", [{ ...owners[0], percentage: 100 }], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [form.watch("owners")]);

  function onSubmit(values: z.infer<typeof ProductSchema>) {
    if (isEditMode && product?.id) {
      updateProduct(
        { id: product.id, ...values },
        {
          onSuccess: () => {
            onOpenChange(false);
            dispatch(clearCart());
            toast.success("Producto actualizado");
          },
          onError: (error: unknown) => {
            const message =
              error instanceof Error
                ? error.message
                : "Error al actualizar producto";
            toast.error(message);
          },
        }
      );
    } else {
      createProduct(values, {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Producto registrado");
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "Error al registrar producto";
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Nombre (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Categoría (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
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
                  placeholder="Precio (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Stock (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="low_stock_threshold"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Umbral de bajo stock (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="owners"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <PopoverDialog open={openOwner} onOpenChange={setOpenOwner}>
                <PopoverDialogTrigger>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      disabled={isPending}
                      className={cn(
                        "justify-between h-9 hover:bg-background font-normal w-full",
                        !field.value?.length &&
                          "hover:text-muted-foreground font-normal text-muted-foreground"
                      )}
                    >
                      {field.value?.length
                        ? `${field.value.length} propietario(s) seleccionado(s)`
                        : "Propietario(s) (requerido)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverDialogTrigger>
                <PopoverDialogContent className="w-[462px]">
                  <Command>
                    <CommandInput placeholder="Buscar propietario..." />
                    <CommandList>
                      <CommandEmpty>Sin resultados.</CommandEmpty>
                      <CommandGroup>
                        {owners.map((owner) => (
                          <CommandItem
                            value={owner.name}
                            key={owner.id}
                            onSelect={() => {
                              // Evita duplicados y asegura que owner.id existe
                              if (
                                owner.id !== undefined &&
                                !field.value?.some(
                                  (o: any) => o.id === owner.id
                                )
                              ) {
                                form.setValue(
                                  "owners",
                                  [
                                    ...(field.value || []),
                                    { ...owner, percentage: 0 } as {
                                      id: number;
                                      name: string;
                                      percentage: number;
                                    },
                                  ],
                                  {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: true,
                                  }
                                );
                              }
                              setOpenOwner(false);
                            }}
                          >
                            {owner.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                field.value?.some((o: any) => o.id === owner.id)
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

        {form.watch("owners")?.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Porcentaje</TableHead>
                <TableHead className="text-right">Eliminar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {form.watch("owners").map((owner: any, idx: number) => (
                <TableRow key={owner.id}>
                  <TableCell>{owner.name}</TableCell>
                  <TableCell className="py-1">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      disabled={isPending}
                      value={owner.percentage}
                      onChange={(e) => {
                        const newOwners = [...form.watch("owners")];
                        newOwners[idx] = {
                          ...owner,
                          percentage: Number(e.target.value),
                        };
                        form.setValue("owners", newOwners, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell className="py-1 text-right">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => {
                        const newOwners = form
                          .watch("owners")
                          .filter((_: any, i: number) => i !== idx);
                        form.setValue("owners", newOwners, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

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
