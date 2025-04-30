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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
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
    accessorKey: "unit_price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio unitario" />
    ),
    cell: ({ row }) => {
      const unitPrice = row.getValue("unit_price") as number | null;
      return unitPrice && unitPrice > 0 ? (
        <div>${unitPrice.toFixed(0)}</div>
      ) : (
        <Badge variant="secondary">Sin precio</Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio venta" />
    ),
    cell: ({ row }) => {
      const price = row.getValue("price") as number | null;
      return price && price > 0 ? (
        <div>${price.toFixed(0)}</div>
      ) : (
        <Badge variant="secondary">Sin precio</Badge>
      );
    },
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
    id: "actions",
    cell: ({ row }) => <ProductsTableRowActions row={row} />,
  },
];
