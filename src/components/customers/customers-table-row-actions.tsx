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

import { Banknote, MoreHorizontal, SquarePen } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CustomerSchema } from "@/lib/zod";
import { useState } from "react";
import CustomerForm from "./customer-form";
import CustomerPaymentForm from "./customer-pay-form";
import CustomerSendSummary from "./customer-send-summary";
import { toast } from "sonner";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function CustomersTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const customer = CustomerSchema.parse(row.original);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);

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
                  setTimeout(() => setIsUpdateOpen(true), 0);
                }}
              >
                <SquarePen className="text-primary" />
                Editar
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <CustomerSendSummary customer={customer} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Button
                className="flex justify-start pl-2"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (customer.debt === 0) {
                    toast.error("El cliente no tiene deuda");
                    return;
                  }
                  setTimeout(() => setIsPayOpen(true), 0);
                }}
              >
                <Banknote className="text-primary" />
                Pagar deuda
              </Button>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar expensa</DialogTitle>
            <DialogDescription>
              Use tabs para navegar mas rapido entre los diferentes campos.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm customer={customer} onOpenChange={setIsUpdateOpen} />
        </DialogContent>
      </Dialog>

      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar Deuda</DialogTitle>
            <DialogDescription>
              Use tabs para navegar mas rapido entre los diferentes campos.
            </DialogDescription>
          </DialogHeader>
          <CustomerPaymentForm
            customer={customer}
            onOpenChange={setIsPayOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
