"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Customer, ExtendedCustomer } from "@/lib/zod";
import { DataTableColumnHeader } from "../data-table-column-header";
import { CustomersTableRowActions } from "./customers-table-row-actions";

export const CustomersColumns: ColumnDef<ExtendedCustomer>[] = [
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
      return <div>{reference ? reference : "-"}</div>;
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return <div>{phone ? phone : "-"}</div>;
    },
  },
  {
    accessorKey: "total_sales_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cuenta" />
    ),
    cell: ({ row }) => {
      const totalSalesAmount = row.getValue("total_sales_amount") as string;
      return <div>{totalSalesAmount ? `$${totalSalesAmount}` : "-"}</div>;
    },
  },
  {
      accessorKey: "sales_details",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Detalles" />
      ),
      cell: ({ row }) => {
        const salesDetails = row.getValue("sales_details") as string | null;
        if (!salesDetails) {
          return <div className="item-center">-</div>;
        }
        const products = salesDetails.split(", ");
        return (
          <div>
            {products.map((product, index) => (
              <div key={index}>{product}</div>
            ))}
          </div>
        );
      },
    },
  {
    id: "actions",
    cell: ({ row }) => <CustomersTableRowActions row={row} />,
  },
];
