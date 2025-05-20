"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { PurchaseSchema } from "@/lib/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
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
import { es } from "date-fns/locale";
import { toast } from "sonner";
import PurchaseUpdateForm from "./purchase-update-form";
import { DeletePurchase } from "@/lib/mutations/usePurchase";
import { format } from "date-fns";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function PurchasesTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const purchase = PurchaseSchema.parse(row.original);
  const [isOpen, setIsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { mutate } = DeletePurchase();
  const purchaseId = purchase.id as number;

  function handleDelete() {
    mutate(purchaseId, {
      onSuccess: () => {
        setIsAlertOpen(false);
        toast.success("Compra eliminada");
      },
      onError: () => {
        setIsAlertOpen(false);
        toast.error("Error al eliminar compra");
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
                  setTimeout(() => setIsOpen(true), 0);
                }}
              >
                <Pencil className="text-primary" />
                Editar
              </Button>
            </DropdownMenuItem>
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>
              Use tabs para navegar mas rapido entre los diferentes campos.
            </DialogDescription>
          </DialogHeader>
          <PurchaseUpdateForm purchase={purchase} onOpenChange={setIsOpen} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estas completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la compra del día{" "}
              {/* <span className="text-foreground">
                {format(purchase.date + "Z", "PPP", { locale: es })}
              </span>{" "}
              a las{" "}
              <span className="text-foreground">
                {formatDate(purchase.date + "Z", "p", { locale: es })}
              </span>{" "} */}
              del producto{" "}
              <span className="text-foreground">{purchase.product_name}</span>.
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
