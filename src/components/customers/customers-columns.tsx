"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";
import { CustomersTableRowActions } from "./customers-table-row-actions";
import { Badge } from "../ui/badge";
import { Customer } from "@/lib/zod";

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
    accessorKey: "reference",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Referencia" />
    ),
    cell: ({ row }) => {
      const reference = row.getValue("reference") as string;
      return <div>{reference}</div>;
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return <div>{phone}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "debt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cuenta" />
    ),
    cell: ({ row }) => {
      const current_debt = row.getValue("debt") as number;
      if (current_debt === 0) {
        return <Badge variant="secondary">Sin deudas</Badge>;
      }
      return <div>${current_debt}</div>;
    },
  },
  {
    accessorKey: "combined_filter",
    accessorFn: (row) => `${row.full_name} ${row.reference}`,
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId) as string;
      return value.toLowerCase().includes(filterValue.toLowerCase());
    },
    enableHiding: true,
    header: undefined,
    cell: undefined,
  },
  {
    id: "actions",
    cell: ({ row }) => <CustomersTableRowActions row={row} />,
  },
];
