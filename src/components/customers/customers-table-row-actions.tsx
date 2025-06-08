import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { SquarePen } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CustomerSchema } from "@/lib/zod";
import { useState } from "react";
import CustomerForm from "./customer-form";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function CustomersTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const customer = CustomerSchema.parse(row.original);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  return (
    <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(event) => {
            setIsUpdateOpen(true);
            event.stopPropagation();
          }}
        >
          <SquarePen />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(event) => event.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            Use tabs para navegar mas rapido entre los diferentes campos.
          </DialogDescription>
        </DialogHeader>
        <CustomerForm customer={customer} onOpenChange={setIsUpdateOpen} />
      </DialogContent>
    </Dialog>
  );
}
