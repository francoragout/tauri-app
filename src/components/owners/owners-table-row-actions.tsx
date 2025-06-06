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
import { OwnerSchema } from "@/lib/zod";
import { Button } from "../ui/button";
import { SquarePen } from "lucide-react";
import OwnerForm from "./owner-form";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function OwnersTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const owner = OwnerSchema.parse(row.original);
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
          <DialogTitle>Editar propietario</DialogTitle>
          <DialogDescription>
            Use tabs para navegar mas rapido entre los diferentes campos.
          </DialogDescription>
        </DialogHeader>
        <OwnerForm owner={owner} onOpenChange={setIsUpdateOpen} />
      </DialogContent>
    </Dialog>
  );
}
