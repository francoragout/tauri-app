import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Customer, CustomerSchema } from "@/lib/zod";
import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UpdateCustomer } from "@/lib/mutations/useCustomer";

interface CustomerUpdateFormProps {
  customer: Customer;
  onOpenChange: (open: boolean) => void;
}

export default function CustomerUpdateForm({
  customer,
  onOpenChange,
}: CustomerUpdateFormProps) {
  const { mutate, isPending } = UpdateCustomer();

  const form = useForm<z.infer<typeof CustomerSchema>>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      full_name: customer.full_name,
      reference: customer.reference,
      phone: customer.phone,
    },
  });

  useEffect(() => {
    if (!onOpenChange) {
      form.reset({
        full_name: customer.full_name,
        reference: customer.reference,
        phone: customer.phone,
      });
    }
  }, [customer, form, onOpenChange]);

  function onSubmit(values: z.infer<typeof CustomerSchema>) {
    values.id = customer.id;
    mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success("Cliente actualizado");
      },
      onError: () => {
        toast.error("Error al actualizar cliente");
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
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
