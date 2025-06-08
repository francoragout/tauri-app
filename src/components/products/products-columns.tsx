import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { ProductsTableRowActions } from "./products-table-row-actions";
import { Product } from "@/lib/zod";

export const ProductsColumns: ColumnDef<Product>[] = [
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
        onClick={(event) => event.stopPropagation()}
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
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    filterFn: (row, columnId, filterValue) => {
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "unit_price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio compra" />
    ),
    cell: ({ row }) => {
      const unitPrice = row.getValue("unit_price") as number;
      const formattedUnitPrice = Number(unitPrice).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      if (unitPrice) {
        return <div>$ {formattedUnitPrice}</div>;
      }
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio venta" />
    ),
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      const formattedPrice = Number(price).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      if (price) {
        return <div>$ {formattedPrice}</div>;
      }
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => <div>{row.getValue("stock")}</div>,
  },
  {
    accessorKey: "times_sold",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ventas" />
    ),
    cell: ({ row }) => <div>{row.getValue("times_sold")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductsTableRowActions row={row} />,
  },
];
