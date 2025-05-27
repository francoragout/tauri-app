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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar as CalendarIcon } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { DeleteSales } from "@/lib/mutations/useSale";
import { format } from "date-fns";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function SalesTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  const [date, setDate] = useState<Date>();
  const { mutate } = DeleteSales();

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const salesIds = selectedRows.map(
      (row) => (row.original as { id: number }).id
    );

    mutate(salesIds, {
      onSuccess: () => {
        table.resetRowSelection();
        toast.success(
          `Se ${
            salesIds.length > 1
              ? `han eliminado ${selectedRowsCount} ventas seleccionadas`
              : "ha eliminado la venta seleccionada"
          }`
        );
      },
      onError: () => {
        toast.error("Error al eliminar");
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
                <span>Filtrar gastos...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              locale={es}
              mode="single"
              selected={date}
              onSelect={
                (selectedDate) => {
                  setDate(selectedDate);
                  if (selectedDate) {
                    table.setColumnFilters([
                      {
                        id: "local_date",
                        value: format(selectedDate, "yyyy-MM-dd"),
                      },
                    ]);
                  } else {
                    table.setColumnFilters([]);
                  }
                }
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex space-x-2">
        {selectedRowsCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">
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
                      ? `las ${selectedRowsCount} ventas seleccionadas`
                      : "la venta seleccionada"}
                    .
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
      </div>
    </div>
  );
}
