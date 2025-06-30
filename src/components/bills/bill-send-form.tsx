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

import { Check, ChevronsUpDown } from "lucide-react";
import { format, parse } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { GetOwners } from "@/lib/mutations/useOwner";
import { es } from "date-fns/locale";
import { Bill } from "@/lib/types";

const FormSchema = z.object({
  owner: z
    .string({
      required_error: "Seleccione un propietario",
    })
    .nonempty("Seleccione un propietario"),
});

interface BillSendFormProps {
  bill: Bill;
  onOpenChange: (open: boolean) => void;
}

export function BillSendForm({ bill, onOpenChange }: BillSendFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      owner: "",
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    if (!bill.customer_phone) {
      toast.error("El cliente no tiene número de teléfono");
      return;
    }

    const billSummary = bill.sales_summary
      .map(
        (sale) =>
          `${format(parse(sale.date, "yyyy-MM-dd", new Date()), "P", {
            locale: es,
          })} - $${sale.total.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
      )
      .join("\n");

    const totalFormatted = bill.total_debt.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const totalWithSurcharge = (bill.total_debt * (1 + 5 / 100)).toLocaleString(
      "es-AR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

    const yearMonth = format(
      parse(bill.year_month, "yyyy-MM", new Date()),
      "MMMM yyyy",
      { locale: es }
    );

    const message = `¡Hola! ¿Cómo estás?\nTe comparto el resumen de compras de *${bill.customer_name}* correspondiente a *${yearMonth}*:\n\n${billSummary}\n\nTotal: *$${totalFormatted}*\n\n*Formas de pago disponibles:*\n- Efectivo: *$${totalFormatted}* (sin recargo)\n- Transferencia o tarjeta: *$${totalWithSurcharge}* (5% de recargo)\n\nPor favor avisar el medio de pago una vez definido.\n\n*Datos para transferencia:*\nALIAS: \`${values.owner}\`\n\nAnte cualquier duda o consulta, quedo a disposición.`;

    const url = `https://wa.me/549${
      bill.customer_phone
    }?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    form.reset();
  }

  const { data: owners = [] } = useQuery({
    queryKey: ["owners"],
    queryFn: GetOwners,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="owner"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <PopoverDialog>
                <PopoverDialogTrigger>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? (() => {
                            const owner = owners.find(
                              (owner) => owner.alias === field.value // Buscar por alias
                            );
                            return owner
                              ? owner.alias
                                ? `${owner.name} (${owner.alias})`
                                : owner.name
                              : "Seleccione un propietario";
                          })()
                        : "Seleccione un propietario"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverDialogTrigger>
                <PopoverDialogContent className="p-0 w-[462px]">
                  <Command>
                    <CommandInput
                      placeholder="Buscar propietario con alias..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>Sin resultados.</CommandEmpty>
                      <CommandGroup>
                        {owners
                          .filter((owner) => owner.alias)
                          .map((owner) => {
                            const displayName = owner.alias
                              ? `${owner.name} (${owner.alias})`
                              : owner.name;
                            return (
                              <CommandItem
                                value={owner.name}
                                key={owner.id}
                                onSelect={() => {
                                  form.setValue("owner", owner.alias ?? "", {
                                    shouldValidate: true,
                                  });
                                }}
                              >
                                {displayName}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    owner.alias === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            );
                          })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverDialogContent>
              </PopoverDialog>
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
          >
            Cancelar
          </Button>
          <Button type="submit" size="sm">
            Enviar
          </Button>
        </div>
      </form>
    </Form>
  );
}
