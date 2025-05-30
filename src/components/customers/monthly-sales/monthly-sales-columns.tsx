"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { MonthlySales } from "@/lib/zod";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { MonthlySalesTableRowActions } from "./monthly-sales-table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export const MonthlySalesColumns: ColumnDef<MonthlySales>[] = [
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
    accessorKey: "year",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Año" />
    ),
    cell: ({ row }) => <div>{row.getValue("year")}</div>,
  },
  {
    accessorKey: "month",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mes" />
    ),
    cell: ({ row }) => {
      const monthNumber = row.getValue("month") as number;
      const monthName = MONTHS_ES[(monthNumber ?? 1) - 1] ?? "-";
      return (
        <div>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</div>
      );
    },
  },
  {
    accessorKey: "sales_summary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Resumen de ventas" />
    ),
    cell: ({ row }) => {
      const sales_summary = row.getValue("sales_summary") as {
        date: string;
        total: number;
      }[];

      if (!sales_summary || sales_summary.length === 0) return <div>-</div>;

      return (
        <div className="space-y-1">
          {sales_summary.map((sale) => {
            const parsedDate = parse(
              sale.date,
              "yyyy-MM-dd HH:mm:ss",
              new Date()
            );
            if (!isValid(parsedDate))
              return <div key={sale.date}>Fecha inválida</div>;

            const formattedDate = format(parsedDate, "P", { locale: es });
            const formattedTotal = sale.total.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            return (
              <div key={sale.date}>
                {formattedDate} - $ {formattedTotal}
              </div>
            );
          })}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "debt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deuda" />
    ),
    cell: ({ row }) => {
      const debt = row.getValue("debt") as number;

      const formattedDebt = debt.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return <div>$ {formattedDebt}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <MonthlySalesTableRowActions row={row} />,
  },
];
