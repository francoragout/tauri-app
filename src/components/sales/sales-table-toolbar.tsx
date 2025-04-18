"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function SalesTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder="Filtrar ventas..."
          value={
            (table.getColumn("sale_date")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("sale_date")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}
