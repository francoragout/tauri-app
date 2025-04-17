"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { SalessTableRowActions } from "./sales-table-row-actions";
import { SaleItems } from "@/lib/zod";

export const SalesColumns: ColumnDef<SaleItems>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "sale_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Venta" />
    ),
    cell: ({ row }) => <div>{row.getValue("sale_id")}</div>,
  },
  {
    accessorKey: "sale_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => <div>{row.getValue("sale_date")}</div>,
  },
  {
    accessorKey: "sale_total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => <div>${row.getValue("sale_total")}</div>,
  },
  {
    accessorKey: "products_summary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="productos" />
    ),
    cell: ({ row }) => <div>{row.getValue("products_summary")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <SalessTableRowActions row={row} />,
  },
];
