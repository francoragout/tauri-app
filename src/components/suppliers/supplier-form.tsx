import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Supplier, SupplierSchema } from "@/lib/zod";
import { CreateSupplier, UpdateSupplier } from "@/lib/mutations/useSupplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type SupplierFormProps = {
  supplier?: Supplier;
  onOpenChange: (open: boolean) => void;
};

export default function SupplierForm({
  supplier,
  onOpenChange,
}: SupplierFormProps) {
  const isEditMode = Boolean(supplier);

  const { mutate: createSupplier, isPending: isCreating } = CreateSupplier();
  const { mutate: updateSupplier, isPending: isUpdating } = UpdateSupplier();

  const form = useForm<z.infer<typeof SupplierSchema>>({
    resolver: zodResolver(SupplierSchema),
    defaultValues: {
      name: supplier?.name ?? "",
      phone: supplier?.phone ?? "",
      address: supplier?.address ?? "",
    },
  });

  function onSubmit(values: z.infer<typeof SupplierSchema>) {
    if (isEditMode && supplier?.id) {
      updateSupplier(
        { id: supplier.id, ...values },
        {
          onSuccess: () => {
            onOpenChange(false);
            toast.success("Cliente actualizado");
          },
          onError: (error: any) => {
            const errorMessage = error?.message || "Error al registrar cliente";
            toast.error(errorMessage);
          },
        }
      );
    } else {
      createSupplier(values, {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Cliente registrado");
        },
        onError: (error: any) => {
          const errorMessage = error?.message || "Error al registrar cliente";
          toast.error(errorMessage);
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Teléfono (opcional)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Dirección (opcional)"
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
