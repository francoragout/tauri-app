import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Owner, OwnerSchema } from "@/lib/zod";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreateOwner, UpdateOwner } from "@/lib/mutations/useOwner";

type OwnerFormProps = {
  owner?: Owner;
  onOpenChange: (open: boolean) => void;
};

export default function OwnerForm({ owner, onOpenChange }: OwnerFormProps) {
  const isEditMode = Boolean(owner);

  const { mutate: createOwner, isPending: isCreating } = CreateOwner();
  const { mutate: updateOwner, isPending: isUpdating } = UpdateOwner();

  const form = useForm<z.infer<typeof OwnerSchema>>({
    resolver: zodResolver(OwnerSchema),
    defaultValues: {
      name: owner?.name ?? "",
    },
  });

  function onSubmit(values: z.infer<typeof OwnerSchema>) {
    if (isEditMode && owner?.id) {
      updateOwner(
        { id: owner.id, ...values },
        {
          onSuccess: () => {
            onOpenChange(false);
            toast.success("Propietario actualizado");
          },
          onError: () => {
            toast.error("Error al actualizar propietario");
          },
        }
      );
    } else {
      createOwner(values, {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Propietario registrado");
        },
        onError: () => {
          toast.error("Error al registrar propietario");
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
