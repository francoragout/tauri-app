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

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { DeleteCustomers } from "@/lib/mutations/useCustomer";
import { toast } from "sonner";
import { useState } from "react";
import SupplierForm from "./supplier-form";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function SuppliersTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  const { mutate, isPending } = DeleteCustomers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const suppliersIds = selectedRows.map(
      (row) => (row.original as { id: number }).id
    );

    mutate(suppliersIds, {
      onSuccess: () => {
        table.resetRowSelection();
        toast.success(
          `Se ${
            selectedRowsCount > 1
              ? `han eliminado ${selectedRowsCount} proveedores seleccionados`
              : "ha eliminado el proveedor seleccionado"
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
        <Input
          placeholder="Filtrar proveedores..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
      <div className="flex space-x-4">
        {selectedRowsCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={selectedRowsCount === 0}
              >
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
                      ? `los ${selectedRowsCount} proveedores seleccionados`
                      : "el proveedor seleccionado"}
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
              <DialogTitle>Registrar cliente</DialogTitle>
              <DialogDescription>
                Use tabs para navegar mas rapido entre los diferentes campos.
              </DialogDescription>
            </DialogHeader>
            <SupplierForm onOpenChange={setIsCreateOpen} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
