"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "../data-table-faceted-filter";
import { Button } from "../ui/button";
import { Trash, X } from "lucide-react";
import ProductCreateForm from "./product-create-form";
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
import { DeleteProducts } from "@/lib/mutations/useProduct";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { clearCart } from "@/features/cart/cartSlice";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function ProductsTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  const dispatch = useDispatch();
  const { mutate: deleteProducts } = DeleteProducts();

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const productsIds = selectedRows.map(
      (row) => (row.original as { id: number }).id
    );

    deleteProducts(productsIds, {
      onSuccess: () => {
        table.resetRowSelection();
        dispatch(clearCart());

        toast.success(
          `Se han eliminado ${productsIds.length} productos seleccionados`
        );
      },
      onError: () => {
        toast.error("Error al eliminar los productos seleccionados");
      },
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder="Filtrar productos..."
          value={
            (table.getColumn("name")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("name")
              ?.setFilterValue(event.target.value)
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

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
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
              <Button
                size="sm"
                variant="outline"
                disabled={selectedRowsCount === 0}
              >
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
                    permanentemente los productos seleccionados aunque no
                    afectará a las ventas asociadas con los mismos.
                  </span>

                  <span className="flex flex-col">
                    Items seleccionados:
                    {table.getSelectedRowModel().rows.map((row) => (
                      <span key={row.id} className="text-foreground">
                        {
                          (
                            row.original as {
                              brand: string;
                            }
                          ).brand
                        }{" "}
                        {
                          (
                            row.original as {
                              variant: string;
                            }
                          ).variant
                        }{" "}
                        {
                          (
                            row.original as {
                              weight: string;
                            }
                          ).weight
                        }
                      </span>
                    ))}
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
        <ProductCreateForm />
      </div>
    </div>
  );
}
