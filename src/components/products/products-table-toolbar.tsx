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

import { DataTableFacetedFilter } from "../data-table-faceted-filter";
import { PlusCircle, Trash2 } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { DeleteProducts } from "@/lib/mutations/useProduct";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { clearCart } from "@/features/cart/cartSlice";
import ProductForm from "./product-form";
import { useState } from "react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function ProductsTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  const dispatch = useDispatch();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { mutate, isPending } = DeleteProducts();

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const productsIds = selectedRows.map(
      (row) => (row.original as { id: number }).id
    );

    mutate(productsIds, {
      onSuccess: () => {
        table.resetRowSelection();
        dispatch(clearCart());

        toast.success(
          `Se ${
            productsIds.length > 1
              ? `han eliminado ${productsIds.length} productos seleccionados`
              : "ha eliminado el producto seleccionado"
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
          placeholder="Filtrar productos..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
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
                      ? `los ${selectedRowsCount} productos seleccionados`
                      : "el producto seleccionado"}
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
              <DialogTitle>Registrar producto</DialogTitle>
              <DialogDescription>
                Use tabs para navegar mas rapido entre los diferentes campos.
              </DialogDescription>
            </DialogHeader>
            <ProductForm onOpenChange={setIsCreateOpen} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
