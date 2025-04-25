"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { ProductsTableRowActions } from "./products-table-row-actions";
import { Product } from "@/lib/zod";
import { Badge } from "../ui/badge";

export const ProductsColumns: ColumnDef<Product>[] = [
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
        onClick={(event) => event.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marca" />
    ),
    cell: ({ row }) => <div>{row.getValue("brand")}</div>,
  },
  {
    accessorKey: "variant",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Variante" />
    ),
    cell: ({ row }) => <div>{row.getValue("variant")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Peso" />
    ),
    cell: ({ row }) => <div>{row.getValue("weight")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    filterFn: (row, columnId, filterValue) => {
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio" />
    ),
    cell: ({ row }) => <div>${row.getValue("price")}</div>,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return stock < 1 ? (
        <Badge variant="secondary">Sin stock</Badge>
      ) : (
        <div>{stock}</div>
      );
    },
  },
  {
    accessorKey: "times_sold",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ventas" />
    ),
    cell: ({ row }) => {
      const timesSold = row.getValue("times_sold") as number;
      return timesSold < 1 ? (
        <Badge variant="secondary">Sin ventas</Badge>
      ) : (
        <div>{timesSold}</div>
      );
    },
  },
  {
    accessorKey: "combined_filter",
    accessorFn: (row) => `${row.brand} ${row.variant}`,
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
    cell: ({ row }) => <ProductsTableRowActions row={row} />,
  },
];
