"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { SaleItems } from "@/lib/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "../ui/badge";
import { SalesTableRowActions } from "./sales-table-row-actions";

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
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date") + "Z");
      return <div>{format(date, "PPP", { locale: es })}</div>;
    },
  },
  {
    accessorKey: "time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date") + "Z");
      return <div>{format(date, "p", { locale: es })}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "products",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Productos" />
    ),
    cell: ({ row }) => {
      const productsSummary = row.getValue("products") as string;
      const products = productsSummary.split(", ");
      return (
        <div>
          {products.map((product, index) => (
            <div key={index}>{product}</div>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Metodo de pago" />
    ),
    cell: ({ row }) => {
      const getPaymentMethodBadge = () => {
        const surcharge_percent = row.original.surcharge_percent as number;
        const customer_id = row.original.customer_id as number;

        if (customer_id) {
          return <Badge variant="outline">Fiado</Badge>;
        }

        if (surcharge_percent > 0) {
          return <Badge variant="outline">{surcharge_percent}%</Badge>;
        }

        return <Badge variant="outline">Efectivo</Badge>;
      };

      return getPaymentMethodBadge();
    },
},
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => <div>${row.getValue("total")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <SalesTableRowActions row={row} />,
  },
];
