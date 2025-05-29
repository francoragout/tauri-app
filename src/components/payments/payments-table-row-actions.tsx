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
import { PaymentSchema } from "@/lib/zod";
import { useState } from "react";
import PaymentForm from "./payment-form";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function PaymentsTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const payment = PaymentSchema.parse(row.original);
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
          <DialogTitle>Editar pago</DialogTitle>
          <DialogDescription>
            Use tabs para navegar mas rapido entre los diferentes campos.
          </DialogDescription>
        </DialogHeader>
        <PaymentForm payment={payment} onOpenChange={setIsUpdateOpen} />
      </DialogContent>
    </Dialog>
  );
}
