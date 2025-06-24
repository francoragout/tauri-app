import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Owner, OwnerSchema } from "@/lib/zod";
import { CreateOwner, UpdateOwner } from "@/lib/mutations/useOwner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

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
      alias: owner?.alias ?? "",
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
          onError: (error: unknown) => {
            const message =
              error instanceof Error
                ? error.message
                : "Error al registrar propietario";
            toast.error(message);
          },
        }
      );
    } else {
      createOwner(values, {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Propietario registrado");
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "Error al registrar propietario";
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
                  placeholder="Nombre completo (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alias"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Alias (opcional)"
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
            {isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : isEditMode ? (
              "Actualizar"
            ) : (
              "Registrar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
