"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function SalessTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
    >
      <Plus />
    </Button>
  );
}
