"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CustomerSchema } from "@/lib/zod";
import {
  Banknote,
  MoreHorizontal,
  Pencil,
  SendHorizonal,
  Trash,
} from "lucide-react";
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
import CustomerUpdateForm from "./customer-update-form";
import { useState } from "react";
import { DeleteCustomer } from "@/lib/mutations/useCustomer";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import CustomerPayForm from "./customer-payment-form";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function CustomersTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const customer = CustomerSchema.parse(row.original);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const { mutate } = DeleteCustomer();
  const customerId = customer.id as number;

  function handleDelete() {
    mutate(customerId, {
      onSuccess: () => {
        setDeleteOpen(false);
        toast.success("Cliente eliminado");
      },
      onError: (error: any) => {
        const errorMessage = error?.message || "Error al eliminar cliente";
        toast.error(errorMessage);
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
                aria-label="Enviar mensaje por WhatsApp"
                disabled={!customer.phone || !customer.debt}
                onClick={() => {
                  let phone = customer.phone?.replace(/\D/g, "") ?? "";
                  phone = phone.replace(/^0+/, "");
                  phone = `549${phone}`;

                  if (phone.length < 13) {
                    toast.error("El número de teléfono parece incompleto.");
                    return;
                  }

                  const saleSummary = customer.sales_summary as string | null;

                  let formattedSales = "";

                  if (saleSummary) {
                    formattedSales = saleSummary
                      .split(", ")
                      .map((sale) => {
                        const lastSpaceIndex = sale.lastIndexOf(" ");
                        const rawDateTime = sale.slice(0, lastSpaceIndex);
                        const rawAmount = sale.slice(lastSpaceIndex + 1);

                        const utcDate = new Date(
                          rawDateTime.replace(" ", "T") + "Z"
                        );
                        const localDate = format(utcDate, "d/M/yyyy", {
                          locale: es,
                        });

                        const amount = Number(rawAmount);
                        const formattedAmount = isNaN(amount)
                          ? "Monto inválido"
                          : amount.toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });

                        return `${localDate} - ${formattedAmount}`;
                      })
                      .join("\n");
                  }

                  const totalFormatted = Number(customer.debt).toLocaleString(
                    "es-AR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  );

                  const message = `Hola! ¿Cómo estás?\nTe dejo el resumen de compras de ${customer.full_name}\n\n${formattedSales}\n\nTotal: $${totalFormatted}`;

                  const url = `https://wa.me/${phone}?text=${encodeURIComponent(
                    message
                  )}`;
                  window.open(url, "_blank");
                }}
              >
                <SendHorizonal className="text-primary" />
                Enviar
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Button
                className="flex justify-start pl-2"
                variant="ghost"
                size="sm"
                disabled={!customer.debt}
                onClick={() => {
                  setTimeout(() => setPayOpen(true), 0);
                }}
              >
                <Banknote className="text-primary" />
                Pagar
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Button
                className="flex justify-start pl-2"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTimeout(() => setEditOpen(true), 0);
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
                  setTimeout(() => setDeleteOpen(true), 0);
                }}
              >
                <Trash className="text-primary" />
                Eliminar
              </Button>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pago</DialogTitle>
            <DialogDescription>
              Use tabs para navegar mas rapido entre los diferentes campos.
            </DialogDescription>
          </DialogHeader>
          <CustomerPayForm customer={customer} onOpenChange={setPayOpen} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>
              Use tabs para navegar mas rapido entre los diferentes campos.
            </DialogDescription>
          </DialogHeader>
          <CustomerUpdateForm customer={customer} onOpenChange={setEditOpen} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estas completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Esto eliminará permanentemente
              el cliente{" "}
              <span className="text-foreground">
                {customer.full_name} {customer.reference}
              </span>
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
