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
    accessorKey: "product_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Productos" />
    ),
    cell: ({ row }) => <div>{row.getValue("product_count")}</div>,
  },
  {
    accessorKey: "net_gain",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ganancia neta" />
    ),
    cell: ({ row }) => {
      const netGain = row.getValue("net_gain") as number;

      const formattedNetGain = Number(netGain).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      if (netGain) {
        return <div>$ {formattedNetGain}</div>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <OwnersTableRowActions row={row} />,
  },
];
