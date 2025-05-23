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
import { ProductSchema } from "@/lib/zod";
import { Button } from "../ui/button";
import { SquarePen } from "lucide-react";
import ProductForm from "./product-form";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function ProductsTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const product = ProductSchema.parse(row.original);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  return (
    <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
      <DialogTrigger asChild >
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
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>
            Use tabs para navegar mas rapido entre los diferentes campos.
          </DialogDescription>
        </DialogHeader>
        <ProductForm product={product} onOpenChange={setIsUpdateOpen} />
      </DialogContent>
    </Dialog>
  );
}
