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
import { Button } from "../ui/button";
import { SquarePen } from "lucide-react";
import { SaleSchema } from "@/lib/zod";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function SalesTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const sale = SaleSchema.parse(row.original);
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
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>
            Use tabs para navegar mas rapido entre los diferentes campos.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
