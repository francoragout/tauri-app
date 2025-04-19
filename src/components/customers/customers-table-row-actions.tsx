"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CustomerSchema } from "@/lib/zod";
import { Pencil } from "lucide-react";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function CustomersTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const customer = CustomerSchema.parse(row.original);

  return (
    <Button variant="outline" size="icon" className="rounded-full">
      <Pencil />
    </Button>
  );
}
