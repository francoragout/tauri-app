import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Bill } from "@/lib/zod";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { BillsTableRowActions } from "./bills-table-row-actions";

export const BillsColumns: ColumnDef<Bill>[] = [
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
    accessorKey: "year_month",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Periodo" />
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue("year_month") as string;
      const parsed = parse(rawDate, "yyyy-MM", new Date());

      if (!isValid(parsed)) return <div>-</div>;

      const formatted = format(parsed, "MMMM yyyy", { locale: es });
      return (
        <div>{formatted.charAt(0).toUpperCase() + formatted.slice(1)}</div>
      );
    },
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => <div>{row.getValue("customer_name")}</div>,
  },
  {
    accessorKey: "sales_summary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ventas" />
    ),
    cell: ({ row }) => {
      const sales = row.getValue("sales_summary") as {
        date: string;
        sale_id: number;
        total: number;
      }[];

      if (!sales || sales.length === 0) return <div>-</div>;

      return (
        <div className="space-y-1">
          {sales.map((sale) => {
            // Parsea la fecha como local
            const parsedDate = parse(sale.date, "yyyy-MM-dd", new Date());
            return (
              <div key={sale.sale_id}>
                {format(parsedDate, "P", { locale: es })} - ($
                {sale.total.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                )
              </div>
            );
          })}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "total_debt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const total = row.getValue("total_debt") as number;

      const formattedTotal = Number(total).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return <div>$ {formattedTotal}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <BillsTableRowActions row={row} />,
  },
];
