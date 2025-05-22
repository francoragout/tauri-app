import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { PurchaseSchema } from "@/lib/zod";
import { Button } from "../ui/button";
import { SquarePen } from "lucide-react";
import PurchaseForm from "./purchase-form";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function PurchasesTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const purchase = PurchaseSchema.parse(row.original);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  return (
    <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsUpdateOpen(true);
          }}
        >
          <SquarePen />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar compra</DialogTitle>
          <DialogDescription>
            Use tabs para navegar mas rapido entre los diferentes campos.
          </DialogDescription>
        </DialogHeader>
        <PurchaseForm purchase={purchase} onOpenChange={setIsUpdateOpen} />
      </DialogContent>
    </Dialog>
  );
}
