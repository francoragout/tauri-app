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

import { PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { DeletePurchases } from "@/lib/mutations/usePurchase";
import PurchaseForm from "./purchase-form";
import { DateRange } from "react-day-picker";
import { DataTableDateFilter } from "../data-table-date-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function PurchasesTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  const [rangeDate, setRangeDate] = useState<DateRange | undefined>(undefined);
  const { mutate } = DeletePurchases();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
    const purchasesIds = selectedRows.map(
      (row) => (row.original as { id: number }).id
    );

    mutate(purchasesIds, {
      onSuccess: () => {
        table.resetRowSelection();
        toast.success(
          `Se ${
            purchasesIds.length > 1
              ? `han eliminado ${purchasesIds.length} compras seleccionadas`
              : "ha eliminado la compra seleccionada"
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
        <DataTableDateFilter date={rangeDate} setDate={setRangeDate} />
      </div>
      <div className="flex space-x-4">
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
                      ? `las ${selectedRowsCount} compras seleccionadas`
                      : "la compra seleccionada"}
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

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar compra</DialogTitle>
              <DialogDescription>
                Use tabs para navegar mas rapido entre los diferentes campos.
              </DialogDescription>
            </DialogHeader>
            <PurchaseForm onOpenChange={setIsCreateOpen} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
