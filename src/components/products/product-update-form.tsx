import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Product, ProductSchema } from "@/lib/zod";
import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UpdateProduct } from "@/lib/mutations/useProduct";
import { clearCart } from "@/features/cart/cartSlice";
import { useDispatch } from "react-redux";

interface ProductUpdateFormProps {
  product: Product;
  onOpenChange: (open: boolean) => void;
}

export default function ProductUpdateForm({
  product,
  onOpenChange,
}: ProductUpdateFormProps) {
  const { mutate, isPending } = UpdateProduct();
  const dispatch = useDispatch();

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
    },
  });

  useEffect(() => {
    if (!onOpenChange) {
      form.reset({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
      });
    }
  }, [product, form, onOpenChange]);

  function onSubmit(values: z.infer<typeof ProductSchema>) {
    values.id = product.id;
    mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        dispatch(clearCart());
        toast.success("Producto actualizado");
      },
      onError: () => {
        toast.error("Error al actualizar producto");
      },
    });
  }

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
                <Input
                  {...field}
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
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !form.formState.isDirty}
          >
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
}
