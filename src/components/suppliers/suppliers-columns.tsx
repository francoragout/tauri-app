"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Supplier } from "@/lib/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SuppliersTableRowActions } from "./suppliers-table-row-actions";

export const SuppliersColumns: ColumnDef<Supplier>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dirección" />
    ),
    cell: ({ row }) => <div>{row.getValue("address")}</div>,
  },
  //   {
  //     accessorKey: "sales_summary",
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="Resumen compras" />
  //     ),
  //     cell: ({ row }) => {
  //       const saleSummary = row.getValue("sales_summary") as string | null;

  //       // If there are no sales, return null
  //       if (!saleSummary) {
  //         return null;
  //       }

  //       if (saleSummary) {
  //         const sales = saleSummary.split(", ").map((sale) => {
  //           const lastSpaceIndex = sale.lastIndexOf(" ");
  //           const rawDateTime = sale.slice(0, lastSpaceIndex);
  //           const rawAmount = sale.slice(lastSpaceIndex + 1);

  //           const utcDate = new Date(rawDateTime.replace(" ", "T") + "Z");
  //           const localDate = format(utcDate, "P", { locale: es });

  //           const formattedAmount = Number(rawAmount).toLocaleString("es-AR", {
  //             minimumFractionDigits: 2,
  //             maximumFractionDigits: 2,
  //           });

  //           return `${localDate} - ${formattedAmount}`;
  //         });

  //         return (
  //           <div className="space-y-1">
  //             {sales.map((entry, index) => (
  //               <div key={index}>{entry}</div>
  //             ))}
  //           </div>
  //         );
  //       }
  //     },
  //     enableSorting: false,
  //   },

  {
    id: "actions",
    cell: ({ row }) => <SuppliersTableRowActions row={row} />,
  },
];
