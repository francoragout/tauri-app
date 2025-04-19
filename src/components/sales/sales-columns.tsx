"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { SaleItems } from "@/lib/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import clsx from "clsx";
import { Badge } from "../ui/badge";

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
    accessorKey: "sale_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("sale_date") + "Z");
      return <div>{format(date, "PPP", { locale: es })}</div>; // Solo la fecha
    },
  },
  {
    accessorKey: "sale_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("sale_date") + "Z");
      return <div>{format(date, "p", { locale: es })}</div>; // Solo la hora
    },
  },
  {
    accessorKey: "products_summary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Productos" />
    ),
    cell: ({ row }) => {
      const products =
        (row.getValue("products_summary") as string)?.split(", ") || [];
      return (
        <div>
          {products.map((product, index) => (
            <div key={index}>{product}</div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "sale_total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => <div>${row.getValue("sale_total")}</div>,
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pago" />
    ),
    cell: ({ row }) => {
      const customer_id = row.getValue("customer_info");
      return (
        <Badge variant="secondary">
          {customer_id === null ? "Efectivo" : "Credito"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "customer_info",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alumno" />
    ),
    cell: ({ row }) => {
      const customer_info = row.getValue("customer_info") as string;
      return <div>{customer_info === null ? "-" : customer_info}</div>;
    },
  },
  // {
  //   accessorKey: "payment_method",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Metodo de pago" />
  //   ),
  //   cell: ({ row }) => {
  //     const paymentMethod = row.getValue("payment_method");
  //     return <div>{paymentMethod === "cash" ? "Efectivo" : "Tarjeta"}</div>;
  //   },
  // }
  // {
  //   id: "actions",
  //   cell: ({ row }) => <SalessTableRowActions row={row} />,
  // },
];
