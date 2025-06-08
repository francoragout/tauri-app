import { format, isValid, parse } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Expense } from "@/lib/zod";
import { DataTableColumnHeader } from "../data-table-column-header";
import { ExpensesTableRowActions } from "./expenses-table-row-actions";
import { es } from "date-fns/locale";

export const ExpensesColumns: ColumnDef<Expense>[] = [
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
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    filterFn: (row, columnId, filterValue) => {
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return <div>{description !== null ? description : ""}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const formattedAmount = Number(amount).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return <div>$ {formattedAmount}</div>;
    },
  },
  {
    accessorKey: "owners",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Propietarios" />
    ),
    cell: ({ row }) => {
      const owners = row.getValue("owners") as {
        id: number;
        name: string;
        percentage: number;
      }[];

      if (!owners || owners.length === 0) return <div>-</div>;

      return (
        <div className="space-y-1">
          {owners.map((owner) => (
            <div key={owner.id}>
              {owner.name} ({owner.percentage}%)
            </div>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <ExpensesTableRowActions row={row} />,
  },
];
