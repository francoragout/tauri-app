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

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function SalesTableRowActions<
  TData
>({}: DataTableRowActionsProps<TData>) {
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
