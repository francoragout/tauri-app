"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";
import { CustomersTableRowActions } from "./customers-table-row-actions";
import { Customer } from "@/lib/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
      <DataTableColumnHeader column={column} title="Deuda" />
    ),
    cell: ({ row }) => {
      const debt = row.getValue("debt") as number | null;
      if (debt) {
        const formattedDebt = Number(debt).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return <div>$ {formattedDebt}</div>;
      }
    },
  },
  {
    accessorKey: "sales_summary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Resumen ventas" />
    ),
    cell: ({ row }) => {
      const saleSummary = row.getValue("sales_summary") as string | null;

      if (saleSummary) {
        const sales = saleSummary.split(", ").map((sale) => {
          const lastSpaceIndex = sale.lastIndexOf(" ");
          const rawDateTime = sale.slice(0, lastSpaceIndex);
          const rawAmount = sale.slice(lastSpaceIndex + 1);

          const utcDate = new Date(rawDateTime.replace(" ", "T") + "Z");
          const localDate = format(utcDate, "P", { locale: es });

          const formattedAmount = Number(rawAmount).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          return `${localDate} - ${formattedAmount}`;
        });

        return (
          <div className="space-y-1">
            {sales.map((entry, index) => (
              <div key={index}>{entry}</div>
            ))}
          </div>
        );
      }
    },
    enableSorting: false,
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
