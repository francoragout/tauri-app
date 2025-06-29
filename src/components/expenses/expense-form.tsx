import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2Icon,
  X,
} from "lucide-react";
import { Expense, ExpenseSchema, OwnerWithPercentage } from "@/lib/zod";
import { CreateExpense, UpdateExpense } from "@/lib/mutations/useExpense";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { GetOwners } from "@/lib/mutations/useOwner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../ui/calendar";

type ExpenseFormProps = {
  expense?: Expense;
  onOpenChange: (open: boolean) => void;
};

export default function ExpenseForm({
  expense,
  onOpenChange,
}: ExpenseFormProps) {
  const isEditMode = Boolean(expense);
  const [openOwner, setOpenOwner] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: owners = [] } = useQuery({
    queryKey: ["owners"],
    queryFn: GetOwners,
  });

  const { mutate: createExpense, isPending: isCreating } = CreateExpense();
  const { mutate: updateExpense, isPending: isUpdating } = UpdateExpense();

  const form = useForm<z.infer<typeof ExpenseSchema>>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      description: expense?.description ?? "",
      amount: expense?.amount ?? undefined,
      payment_method: expense?.payment_method ?? undefined,
      created_at: expense?.local_date
        ? new Date(expense.local_date)
        : new Date(),
      owners:
        expense?.owners
          ?.filter((o) => typeof o.id === "number" && o.id !== null)
          .map((owner) => ({
            id: owner.id,
            name: owner.name,
            percentage: owner.percentage ?? 0,
          })) ?? [],
    },
  });

  const ownersFromForm = useWatch({
    control: form.control,
    name: "owners",
    defaultValue: [],
  });

  useEffect(() => {
    if (ownersFromForm.length === 1 && ownersFromForm[0].percentage !== 100) {
      form.setValue("owners", [{ ...ownersFromForm[0], percentage: 100 }], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [ownersFromForm, form]);

  function onSubmit(values: z.infer<typeof ExpenseSchema>) {
    if (isEditMode && expense?.id) {
      updateExpense(
        { id: expense.id, ...values },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
            toast.success("Gasto actualizado");
          },
          onError: (error: unknown) => {
            const message =
              error instanceof Error
                ? error.message
                : "Error al actualizar gasto";
            toast.error(message);
          },
        }
      );
    } else {
      createExpense(values, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          toast.success("Gasto registrado");
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Error al registrar gasto";
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
          name="created_at"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal hover:bg-transparent",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PP", { locale: es })
                    ) : (
                      <span>Fecha (requerido)</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={es}
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Descripción (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NumericFormat
                  value={field.value}
                  onValueChange={(values) => {
                    field.onChange(values.floatValue ?? null);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  allowNegative={false}
                  customInput={Input}
                  disabled={isPending}
                  placeholder="Monto (requerido)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full" disabled={isPending}>
                    <SelectValue placeholder="Metodo de pago (requerido)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="owners"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <PopoverDialog open={openOwner} onOpenChange={setOpenOwner}>
                <PopoverDialogTrigger>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      disabled={isPending}
                      className={cn(
                        "justify-between h-9 hover:bg-background w-full",
                        !field.value?.length &&
                          "hover:text-muted-foreground text-muted-foreground"
                      )}
                    >
                      {field.value?.length
                        ? `${field.value.length} propietario(s) seleccionado(s)`
                        : "Propietario(s) (requerido)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverDialogTrigger>
                <PopoverDialogContent className="w-[462px]">
                  <Command>
                    <CommandInput placeholder="Buscar propietario..." />
                    <CommandList>
                      <CommandEmpty>Sin resultados.</CommandEmpty>
                      <CommandGroup>
                        {owners.map((owner) => (
                          <CommandItem
                            value={owner.name}
                            key={owner.id}
                            onSelect={() => {
                              // Evita duplicados y asegura que owner.id existe
                              if (
                                owner.id !== undefined &&
                                !field.value?.some(
                                  (o: OwnerWithPercentage) => o.id === owner.id
                                )
                              ) {
                                form.setValue(
                                  "owners",
                                  [
                                    ...(field.value || []),
                                    { ...owner, percentage: 0 } as {
                                      id: number;
                                      name: string;
                                      percentage: number;
                                    },
                                  ],
                                  {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: true,
                                  }
                                );
                              }
                              setOpenOwner(false);
                            }}
                          >
                            {owner.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                field.value?.some(
                                  (o: OwnerWithPercentage) => o.id === owner.id
                                )
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

        {form.watch("owners")?.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Porcentaje</TableHead>
                <TableHead className="text-right">Eliminar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {form
                .watch("owners")
                .map((owner: OwnerWithPercentage, idx: number) => (
                  <TableRow key={owner.id}>
                    <TableCell>{owner.name}</TableCell>
                    <TableCell className="py-1">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        disabled={isPending}
                        value={owner.percentage}
                        onChange={(e) => {
                          const newOwners = [...form.watch("owners")];
                          newOwners[idx] = {
                            ...owner,
                            percentage: Number(e.target.value),
                          };
                          form.setValue("owners", newOwners, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }}
                        className="h-8 w-20"
                      />
                    </TableCell>
                    <TableCell className="py-1 text-right">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => {
                          const newOwners = form
                            .watch("owners")
                            .filter(
                              (_: OwnerWithPercentage, i: number) => i !== idx
                            );
                          form.setValue("owners", newOwners, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              form.reset();
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
