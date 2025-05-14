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
import { useEffect, useState } from "react";
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
  const [displayValue, setDisplayValue] = useState("");

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

  useEffect(() => {
    const formatted = new Intl.NumberFormat("es-AR").format(product.price);
    setDisplayValue(formatted);
  }, [product.price]);

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
                  placeholder="Precio (requerido)"
                  disabled={isPending}
                  value={displayValue}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, ""); // solo números
                    const numericValue = Number(rawValue);

                    // Actualiza el valor del formulario con el número puro
                    field.onChange(numericValue);

                    // Formatea con separadores de miles para mostrar
                    const formatted = new Intl.NumberFormat("es-AR").format(
                      numericValue
                    );
                    setDisplayValue(formatted);
                  }}
                  onBlur={field.onBlur}
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
