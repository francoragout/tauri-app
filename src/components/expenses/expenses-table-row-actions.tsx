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
import { ExpenseSchema } from "@/lib/zod";
import { Button } from "../ui/button";
import { SquarePen } from "lucide-react";
import ExpenseForm from "./expense-form";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function ExpensesTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const expense = ExpenseSchema.parse(row.original);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  return (
    <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            setIsUpdateOpen(true);
          }}
        >
          <SquarePen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar expensa</DialogTitle>
          <DialogDescription>
            Use tabs para navegar mas rapido entre los diferentes campos.
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm expense={expense} onOpenChange={setIsUpdateOpen} />
      </DialogContent>
    </Dialog>
  );
}
