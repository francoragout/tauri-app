import { format, isValid, parse } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";
import { es } from "date-fns/locale";
import { MonthlyFinancialReport } from "@/lib/types";

export const MonthlyFinancialReportColumns: ColumnDef<MonthlyFinancialReport>[] =
  [
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
      accessorKey: "local_month",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha" />
      ),
      cell: ({ row }) => {
        const rawDate = row.getValue("local_month") as string;
        const parsed = parse(rawDate, "yyyy-MM", new Date());

        if (!isValid(parsed)) return <div>-</div>;

        const formatted = format(parsed, "MMMM yyyy", { locale: es });
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

        return <div>$ {formattedSales}</div>;
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

        return <div>$ {formattedPurchases}</div>;
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

        return <div>$ {formattedExpenses}</div>;
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
