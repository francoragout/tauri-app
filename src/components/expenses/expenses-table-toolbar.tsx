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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar as CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { DeleteExpenses } from "@/lib/mutations/useExpense";
import { DataTableFacetedFilter } from "../data-table-faceted-filter";
import { format } from "date-fns";
import ExpenseForm from "./expense-form";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function ExpensesTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  const [date, setDate] = useState<Date>();
  const { mutate, isPending } = DeleteExpenses();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const expensesIds = selectedRows.map(
      (row) => (row.original as { id: number }).id
    );

    mutate(expensesIds, {
      onSuccess: () => {
        table.resetRowSelection();
        toast.success(
          `Se ${
            expensesIds.length > 1
              ? `han eliminado ${selectedRowsCount} expensas seleccionadas`
              : "ha eliminado la expensa seleccionada"
          }`
        );
      },
      onError: () => {
        toast.error("Error al eliminar expensas seleccionadas");
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
                format(date, "PP", { locale: es })
              ) : (
                <span>Filtrar expensas...</span>
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
      </div>

      <div className="flex space-x-4">
        {selectedRowsCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isPending}>
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Estas completamente seguro?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <span>
                    Esta acción no se puede deshacer. Esto eliminará
                    permanentemente{" "}
                    {selectedRowsCount > 1
                      ? `las ${selectedRowsCount} expensas seleccionadas`
                      : "la expensa seleccionada"}
                    .
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSelected}
                  disabled={isPending}
                >
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar expensa</DialogTitle>
              <DialogDescription>
                Use tabs para navegar mas rapido entre los diferentes campos.
              </DialogDescription>
            </DialogHeader>
            <ExpenseForm onOpenChange={setIsCreateOpen} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
