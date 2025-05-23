import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { CreateProduct, UpdateProduct } from "@/lib/mutations/useProduct";
import { Product, ProductSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { clearCart } from "@/features/cart/cartSlice";
import { useDispatch } from "react-redux";

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

  const { mutate: createProduct, isPending: isCreating } = CreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = UpdateProduct();

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      category: product?.category ?? "",
      price: product?.price ?? undefined,
      stock: product?.stock ?? undefined,
    },
  });

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
          onError: () => {
            toast.error("Error al actualizar producto");
          },
        }
      );
    } else {
      createProduct(values, {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Producto registrado");
        },
        onError: () => {
          toast.error("Error al registrar producto");
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
                    field.onChange(values.floatValue);
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
