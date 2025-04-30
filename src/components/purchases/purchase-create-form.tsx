import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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

import { Product, PurchaseSchema } from "@/lib/zod";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { CreatePurchase } from "@/lib/mutations/usePurchase";

interface ExpenseCreateFormProps {
  products: Product[];
}

export default function PurchaseCreateForm({
  products,
}: ExpenseCreateFormProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isPending } = CreatePurchase();
  const form = useForm<z.infer<typeof PurchaseSchema>>({
    resolver: zodResolver(PurchaseSchema),
  });

  function onSubmit(values: z.infer<typeof PurchaseSchema>) {
    mutate(values, {
      onSuccess: () => {
        form.reset();
        toast.success("Compra registrada");
        setIsOpen(false);
      },
      onError: () => {
        toast.error("Error al registrar compra");
      },
    });
  }

  useEffect(() => {
    const currentValue = form.getValues("total");
    if (currentValue) {
      setDisplayValue(
        new Intl.NumberFormat("es-ES").format(Number(currentValue))
      );
    }
  }, []);

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
          <DialogTitle>Registrar compra</DialogTitle>
          <DialogDescription>
            Use tabs para navegar mas rapido entre los diferentes campos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <PopoverDialog
                    open={isPopoverOpen}
                    onOpenChange={setIsPopoverOpen}
                  >
                    <PopoverDialogTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? products.find(
                                (product) => product.id === field.value
                              )?.name
                            : "Producto (requerido)"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverDialogTrigger>
                    <PopoverDialogContent className="w-[462px] p-0">
                      <Command>
                        <CommandInput placeholder="Search language..." />
                        <CommandList>
                          <CommandEmpty>No language found.</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => (
                              <CommandItem
                                value={product.name}
                                key={product.id}
                                onSelect={() => {
                                  form.setValue(
                                    "product_id",
                                    product.id as number
                                  );
                                  setIsPopoverOpen(false);
                                }}
                              >
                                {product.name}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    product.id === field.value
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

            <FormField
              control={form.control}
              name="total"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Total (requerido)"
                      value={displayValue}
                      onChange={(e) => {
                        const input = e.target.value;

                        if (input.trim() === "") {
                          field.onChange("");
                          setDisplayValue("");
                          return;
                        }

                        const rawValue = input
                          .replace(/\./g, "")
                          .replace(",", ".");

                        if (!isNaN(Number(rawValue))) {
                          field.onChange(rawValue);
                          const formatted = new Intl.NumberFormat(
                            "es-ES"
                          ).format(Number(rawValue));
                          setDisplayValue(formatted);
                        } else {
                          setDisplayValue(input);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Cantidad (opcional)"
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
