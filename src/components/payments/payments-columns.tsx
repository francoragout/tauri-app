"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Payment } from "@/lib/zod";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { PaymentsTableRowActions } from "./payments-table-row-actions";

export const PaymentsColumns: ColumnDef<Payment>[] = [
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
    enableSorting: false,
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      const customerName = row.getValue("customer_name") as string | null;
      return <div>{customerName || "-"}</div>;
    },
  },
  {
    accessorKey: "period",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Período" />
    ),
    cell: ({ row }) => {
      const period = row.getValue("period") as string | null;
      if (!period) return <div>-</div>;

      const parsedPeriod = parse(period, "yyyy-MM", new Date());
      if (!isValid(parsedPeriod)) return <div>{period}</div>;

      const formatted = format(parsedPeriod, "LLLL yyyy", { locale: es });
      // Capitaliza la primera letra del mes
      const capitalized =
        formatted.charAt(0).toUpperCase() + formatted.slice(1);

      return <div>{capitalized}</div>;
    },
  },
  {
    accessorKey: "method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Método de pago" />
    ),
    cell: ({ row }) => {
      const paymentMethod = row.getValue("method") as string | null;

      const translatedPaymentMethod = {
        credit: "Crédito",
        debit: "Débito",
        cash: "Efectivo",
        transfer: "Transferencia",
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
    accessorKey: "surcharge",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Recargo" />
    ),
    cell: ({ row }) => <div>{row.getValue("surcharge")}%</div>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto" />
    ),
    cell: ({ row }) => {
      const monto = row.getValue("amount") as number;

      const formattedAmount = Number(monto).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return <div>$ {formattedAmount}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <PaymentsTableRowActions row={row} />,
  },
];
