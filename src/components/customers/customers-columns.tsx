"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Customer } from "@/lib/zod";
import { DataTableColumnHeader } from "../data-table-column-header";
import { CustomersTableRowActions } from "./customers-table-row-actions";

export const CustomersColumns: ColumnDef<Customer>[] = [
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
    accessorKey: "full_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => <div>{row.getValue("full_name")}</div>,
  },
  {
    accessorKey: "classroom",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aula" />
    ),
    cell: ({ row }) => <div>{row.getValue("classroom")}</div>,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "total_sales_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cuenta" />
    ),
    cell: ({ row }) => <div>${row.getValue("total_sales_amount")}</div>,
  },
  {
    accessorKey: "total_sales_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ventas" />
    ),
    cell: ({ row }) => <div>{row.getValue("total_sales_count")}</div>,
  },
  {
    accessorKey: "sales_details",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Detalles" />
    ),
    cell: ({ row }) => {
      const sales =
        (row.getValue("sales_details") as string)?.split(", ") || [];
      return (
        <div>
          {sales.map((sale, index) => (
            <div key={index}>{sale}</div>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CustomersTableRowActions row={row} />,
  },
];
