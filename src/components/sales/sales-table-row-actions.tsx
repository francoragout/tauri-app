"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { SaleItemsSchema } from "@/lib/zod";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DeleteSale } from "@/lib/mutations/useSale";
import { toast } from "sonner";
import { format, formatDate } from "date-fns";
import { es } from "date-fns/locale";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function SalesTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const sale = SaleItemsSchema.parse(row.original);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { mutate } = DeleteSale();

  function handleDelete() {
    mutate(sale.sale_id, {
      onSuccess: () => {
        setIsAlertOpen(false);
        toast.success("Venta eliminada");
      },
      onError: () => {
        setIsAlertOpen(false);
        toast.error("Error al eliminar venta");
      },
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px] z-50">
          <div className="flex flex-col w-full">
            <DropdownMenuItem asChild>
              <Button
                className="flex justify-start pl-2"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTimeout(() => setIsAlertOpen(true), 0);
                }}
              >
                <Trash className="text-primary" />
                Eliminar
              </Button>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estas completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la venta del dia{" "}
              <span className="text-foreground">
                {format(new Date(sale.sale_date), "PPP", { locale: es })}
              </span>{" "}
              a las{" "}
              <span className="text-foreground">
                {format(new Date(sale.sale_date) + "z", "p", { locale: es })}
              </span>{" "}
              con el total de{" "}
              <span className="text-foreground">${sale.sale_total}</span>{" "}
              resgresando los productos vendidos al stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
