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

import { useEffect, useState } from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteSales } from "@/lib/mutations/useSale";
import { format } from "date-fns";
import { DatePickerWithRange } from "../date-picker-with-range";
import { DateRange } from "react-day-picker";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function SalesTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  // const [date, setDate] = useState<Date>();
  const [rangeDate, setRangeDate] = useState<DateRange | undefined>(undefined);
  const { mutate } = DeleteSales();

  useEffect(() => {
    if (rangeDate?.from && rangeDate?.to) {
      table.setColumnFilters([
        {
          id: "local_date",
          value: {
            from: format(rangeDate.from, "yyyy-MM-dd HH:mm:ss"),
            to: format(rangeDate.to, "yyyy-MM-dd HH:mm:ss"),
          },
        },
      ]);
    } else {
      table.setColumnFilters([]);
    }
  }, [rangeDate, table]);

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
        <DatePickerWithRange date={rangeDate} setDate={setRangeDate} />
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
