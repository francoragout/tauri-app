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

import { Calendar, MoreHorizontal, SquarePen, Table2 } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CustomerSchema } from "@/lib/zod";
import { useState } from "react";
import CustomerForm from "./customer-form";
import { NavLink } from "react-router";
import CustomersMonthlySales from "./customer-monthly-sales";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function CustomersTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const customer = CustomerSchema.parse(row.original);
  const customerId = customer.id as number;
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);

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
              <Button
                className="flex justify-start pl-2"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTimeout(() => setIsSalesOpen(true), 0);
                }}
              >
                <Table2 className="text-primary" />
                Ventas
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink
                to={`/customers/${customer.id}/monthly-sales`}
                className="flex justify-start pl-2.5 text-sm h-8 w-full font-medium hover:bg-secondary hover:text-primary"
              >
                <Calendar className="text-primary" />
                Ventas
              </NavLink>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
            <DialogDescription>
              Use tabs para navegar mas rapido entre los diferentes campos.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm customer={customer} onOpenChange={setIsUpdateOpen} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSalesOpen} onOpenChange={setIsSalesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ventas mensuales de {customer.name}</DialogTitle>
            <DialogDescription>
              Ventas agrupadas por mes. Solo se muestran ventas no pagadas.
            </DialogDescription>
          </DialogHeader>
          <CustomersMonthlySales
            customerId={customerId}
            onSalesOpenChange={setIsSalesOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
