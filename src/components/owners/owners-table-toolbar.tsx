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
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { DeleteOwners } from "@/lib/mutations/useOwner";
import OwnerForm from "./owner-form";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function OwnersTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  const { mutate, isPending } = DeleteOwners();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ownersIds = selectedRows.map(
      (row) => (row.original as { id: number }).id
    );

    mutate(ownersIds, {
      onSuccess: () => {
        table.resetRowSelection();
        toast.success(
          `Se ${
            ownersIds.length > 1
              ? `han eliminado ${ownersIds.length} propietarios seleccionados`
              : "ha eliminado el propietario seleccionado"
          }`
        );
      },
      onError: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Error al eliminar";
        toast.error(message);
      },
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder="Filtrar propietarios..."
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
                      ? `los ${selectedRowsCount} propietarios seleccionados`
                      : "el propietario seleccionado"}
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
              <DialogTitle>Registrar propietario</DialogTitle>
              <DialogDescription>
                Use tabs para navegar mas rapido entre los diferentes campos.
              </DialogDescription>
            </DialogHeader>
            <OwnerForm onOpenChange={setIsCreateOpen} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
