import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DollarSign, MoreHorizontal } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { BillSchema } from "@/lib/zod";
import { useState } from "react";
import BillForm from "./bill-form";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { BillSendForm } from "./bill-send-form";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function BillsTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const bill = BillSchema.parse(row.original);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);

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
                  setTimeout(() => setIsPaymentOpen(true), 0);
                }}
              >
                <DollarSign className="text-primary" />
                Pagar cuenta
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Button
                className="flex justify-start pl-2"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTimeout(() => setIsSendOpen(true), 0);
                }}
              >
                <IconBrandWhatsapp className="text-primary" />
                Enviar cuenta
              </Button>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isSendOpen} onOpenChange={setIsSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar cuenta de {bill.customer_name}</DialogTitle>
            <DialogDescription>
              Seleccione el alias del propietario para enviar la cuenta por
              WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <BillSendForm bill={bill} onOpenChange={setIsSendOpen}/>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pago</DialogTitle>
            <DialogDescription>
              Use tabs para navegar mas rapido entre los diferentes campos.
            </DialogDescription>
          </DialogHeader>
          <BillForm onOpenChange={setIsPaymentOpen} bill={bill} />
        </DialogContent>
      </Dialog>
    </>
  );
}
