import { format, isValid, parse } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";
import { es } from "date-fns/locale";
import { FinancialReport } from "@/lib/types";

export const DashboardColumns: ColumnDef<FinancialReport>[] = [
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

      // Determinar y parsear formato
      let parsedDate: Date | null = null;
      let formatted = "-";

      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        parsedDate = parse(rawDate, "yyyy-MM-dd", new Date());
        if (isValid(parsedDate)) {
          formatted = format(parsedDate, "PP", {
            locale: es,
          });
        }
      } else if (/^\d{4}-\d{2}$/.test(rawDate)) {
        parsedDate = parse(rawDate, "yyyy-MM", new Date());
        if (isValid(parsedDate)) {
          formatted = format(parsedDate, "MMMM yyyy", { locale: es });
        }
      }

      return (
        <div>{formatted.charAt(0).toUpperCase() + formatted.slice(1)}</div>
      );
    },
  },
  {
    accessorKey: "sales",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ventas" />
    ),
    cell: ({ row }) => {
      const sales = row.getValue("sales");

      const formattedSales = Number(sales).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return <div className="text-chart-2 font-medium">$ {formattedSales}</div>;
    },
  },
  {
    accessorKey: "purchases",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Compras" />
    ),
    cell: ({ row }) => {
      const purchases = row.getValue("purchases");

      const formattedPurchases = Number(purchases).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return (
        <div className="text-chart-1 font-medium">$ {formattedPurchases}</div>
      );
    },
  },
  {
    accessorKey: "expenses",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gastos" />
    ),
    cell: ({ row }) => {
      const expenses = row.getValue("expenses");

      const formattedExpenses = Number(expenses).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return (
        <div className="text-chart-3 font-medium">$ {formattedExpenses}</div>
      );
    },
  },
  {
    accessorKey: "net_profit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ganancias" />
    ),
    cell: ({ row }) => {
      const netProfit = row.getValue("net_profit");

      const formattedNetProfit = Number(netProfit).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return <div>$ {formattedNetProfit}</div>;
    },
  },
];
