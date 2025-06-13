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
import BillSend from "./bill-send";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function BillsTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const bill = BillSchema.parse(row.original);
  const [isOpen, setIsOpen] = useState(false);
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
              <BillSend bill={bill} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Button
                className="flex justify-start pl-2"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTimeout(() => setIsOpen(true), 0);
                }}
              >
                <DollarSign className="text-primary" />
                Pagar cuenta
              </Button>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pago</DialogTitle>
            <DialogDescription>
              Use tabs para navegar mas rapido entre los diferentes campos.
            </DialogDescription>
          </DialogHeader>
          <BillForm onOpenChange={setIsOpen} bill={bill} />
        </DialogContent>
      </Dialog>
    </>
  );
}
