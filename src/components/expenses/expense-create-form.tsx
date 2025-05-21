import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { PlusCircle } from "lucide-react";
import { ExpenseSchema } from "@/lib/zod";
import { useState } from "react";
import { CreateExpense } from "@/lib/mutations/useExpense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ExpenseCreateForm() {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isPending } = CreateExpense();
  const form = useForm<z.infer<typeof ExpenseSchema>>({
    resolver: zodResolver(ExpenseSchema),
  });

  function onSubmit(values: z.infer<typeof ExpenseSchema>) {
    mutate(values, {
      onSuccess: () => {
        form.reset();
        toast.success("Gasto registrado");
        setIsOpen(false);
      },
      onError: () => {
        toast.error("Error al registrar gasto");
      },
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PlusCircle className="h-4 w-4" />
          Agregar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar gasto</DialogTitle>
          <DialogDescription>
            Use tabs para navegar mas rapido entre los diferentes campos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                Guardar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
