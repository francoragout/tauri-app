"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Trash, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import ExpenseCreateForm from "./expense-create-form";
import { formatDate } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { DeleteExpenses } from "@/lib/mutations/useExpense";
import { DataTableFacetedFilter } from "../data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function ExpensesTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  const [date, setDate] = useState<Date>();
  const { mutate: deleteExpenses } = DeleteExpenses();

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const expensesIds = selectedRows.map(
      (row) => (row.original as { id: number }).id
    );

    deleteExpenses(expensesIds, {
      onSuccess: () => {
        table.resetRowSelection();
        toast.success(
          `Se han eliminado ${expensesIds.length} gastos seleccionados.`
        );
      },
      onError: () => {
        toast.error("Error al eliminar gastos seleccionados.");
      },
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              size="sm"
              className={cn(
                "w-[150px] lg:w-[250px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                formatDate(date, "PPP", { locale: es })
              ) : (
                <span>Filtrar gastos...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              locale={es}
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                if (
                  selectedDate?.toISOString().split("T")[0] !==
                  date?.toISOString().split("T")[0]
                ) {
                  setDate(selectedDate);
                  table
                    .getColumn("date")
                    ?.setFilterValue(selectedDate?.toISOString().split("T")[0]);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {table.getColumn("category") && (
          <DataTableFacetedFilter
            column={table.getColumn("category")}
            title="Categoría"
            options={Array.from(
              table
                .getColumn("category")
                ?.getFacetedUniqueValues()
                ?.entries() ?? []
            ).map(([key, _]) => ({
              label: String(key),
              value: String(key),
            }))}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              setDate(undefined); // Restablecer la fecha seleccionada
            }}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar
            <X />
          </Button>
        )}
      </div>
      <div className="flex space-x-2">
        {selectedRowsCount > 1 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Trash className="h-4 w-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Estas completamente seguro?
                </AlertDialogTitle>
                <AlertDialogDescription className="flex flex-col space-y-3">
                  <span>
                    Esta acción no se puede deshacer. Esto eliminará
                    permanentemente los productos seleccionados.
                  </span>

                  <span className="flex flex-col">
                    Items seleccionados:
                    {table.getSelectedRowModel().rows.map((row) => {
                      const expense = row.original as {
                        date: string;
                        amount: number;
                        category: string;
                      };
                      return (
                        <span key={row.id} className="text-foreground">
                          {expense.date
                            ? formatDate(new Date(expense.date), "PPP", {
                                locale: es,
                              })
                            : "Fecha no disponible"}{" "}
                          ${expense.amount} {expense.category}
                        </span>
                      );
                    })}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected}>
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <ExpenseCreateForm />
      </div>
    </div>
  );
}
