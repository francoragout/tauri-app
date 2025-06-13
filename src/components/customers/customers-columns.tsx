import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";
import { CustomersTableRowActions } from "./customers-table-row-actions";
import { Customer } from "@/lib/zod";
import { Button } from "../ui/button";
import { IconBrandWhatsapp } from "@tabler/icons-react";

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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
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
    id: "actions",
    cell: ({ row }) => <CustomersTableRowActions row={row} />,
  },
];
