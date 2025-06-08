import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Customer, CustomerSchema } from "@/lib/zod";
import { CreateCustomer, UpdateCustomer } from "@/lib/mutations/useCustomer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type CustomerFormProps = {
  customer?: Customer;
  onOpenChange: (open: boolean) => void;
};

export default function CustomerForm({
  customer,
  onOpenChange,
}: CustomerFormProps) {
  const isEditMode = Boolean(customer);

  const { mutate: createCustomer, isPending: isCreating } = CreateCustomer();
  const { mutate: updateCustomer, isPending: isUpdating } = UpdateCustomer();

  const form = useForm<z.infer<typeof CustomerSchema>>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      reference: customer?.reference ?? "",
      phone: customer?.phone ?? "",
    },
  });

  function onSubmit(values: z.infer<typeof CustomerSchema>) {
    if (isEditMode && customer?.id) {
      updateCustomer(
        { id: customer.id, ...values },
        {
          onSuccess: () => {
            onOpenChange(false);
            toast.success("Cliente actualizado");
          },
          onError: () => {
            toast.error("Error al actualizar cliente");
          },
        }
      );
    } else {
      createCustomer(values, {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Cliente registrado");
        },
        onError: () => {
          toast.error("Error al registrar cliente");
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
                  placeholder="Nombre completo (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Referencia (opcional)"
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
