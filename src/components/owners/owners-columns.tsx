import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Owner } from "@/lib/zod";
import { OwnersTableRowActions } from "./owners-table-row-actions";

export const OwnersColumns: ColumnDef<Owner>[] = [
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
    accessorKey: "alias",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alias" />
    ),
    cell: ({ row }) => <div>{row.getValue("alias")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "total_products",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Productos" />
    ),
    cell: ({ row }) => <div>{row.getValue("total_products")}</div>,
  },
  {
    accessorKey: "net_profit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ganancias" />
    ),
    cell: ({ row }) => {
      const netProfit = row.getValue("net_profit") as number;
      const formattedNetProfit = Number(netProfit).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return <div>$ {formattedNetProfit}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <OwnersTableRowActions row={row} />,
  },
];
