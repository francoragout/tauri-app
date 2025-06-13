import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Supplier } from "@/lib/zod";
import { SuppliersTableRowActions } from "./suppliers-table-row-actions";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { Button } from "../ui/button";

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
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      if (!phone) return null;
      return (
        <div className="flex items-center space-x-2">
          <span>{phone}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.open(`https://wa.me/+549${phone}`, "_blank");
            }}
          >
            <IconBrandWhatsapp />
          </Button>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dirección" />
    ),
    cell: ({ row }) => <div>{row.getValue("address")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "products",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Productos" />
    ),
    cell: ({ row }) => {
      const products = row.getValue("products") as {
        id: number;
        name: string;
      }[];

      if (!products || products.length === 0) return null;

      return (
        <div className="space-y-1">
          {products.map((product) => (
            <div key={product.id}>{product.name}</div>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <SuppliersTableRowActions row={row} />,
  },
];
