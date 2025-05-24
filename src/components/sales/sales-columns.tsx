"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { SaleItems } from "@/lib/zod";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
// import { SalesTableRowActions } from "./sales-table-row-actions";

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
    accessorKey: "local_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue("local_date") as string;
      const parsed = parse(rawDate, "yyyy-MM-dd HH:mm:ss", new Date());

      if (!isValid(parsed)) return <div>-</div>;

      const formatted = format(parsed, "PP", { locale: es });
      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "local_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora" />
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue("local_date") as string;
      const parsed = parse(rawDate, "yyyy-MM-dd HH:mm:ss", new Date());

      if (!isValid(parsed)) return <div>-</div>;

      const formatted = format(parsed, "HH:mm", { locale: es });
      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "products",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Productos" />
    ),
    cell: ({ row }) => {
      const productsSummary = row.getValue("products") as string;
      if (!productsSummary) return <div>-</div>;
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
      const paymentMethod = row.getValue("payment_method") as string | null;

      const translatedPaymentMethod = {
        cash: "Efectivo",
        transfer: "Transferencia",
        debit: "Débito",
        credit: "Crédito",
      };

      return (
        <div>
          {
            translatedPaymentMethod[
              paymentMethod as keyof typeof translatedPaymentMethod
            ]
          }
        </div>
      );
    },
  },
  {
    accessorKey: "surcharge_percent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Recargo" />
    ),
    cell: ({ row }) => <div>{row.getValue("surcharge_percent")}%</div>,
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const total = row.getValue("total") as number;

      const formattedTotal = Number(total).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return <div>$ {formattedTotal}</div>;
    },
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      const customerName = row.getValue("customer_name") as string | null;
      return <div>{customerName}</div>;
    },
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => <SalesTableRowActions row={row} />,
  // },
];
