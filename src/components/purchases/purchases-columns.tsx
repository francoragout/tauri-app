import { endOfDay, format, isValid, parse, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Purchase } from "@/lib/zod";
import { DataTableColumnHeader } from "../data-table-column-header";
import { PurchasesTableRowActions } from "./purchases-table-row-actions";

export const PurchasesColumns: ColumnDef<Purchase>[] = [
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

      const formatted = format(parsed, "PPp", { locale: es });
      return <div>{formatted}</div>;
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue?.from || !filterValue?.to) return true;
      const rawDate = row.getValue(columnId) as string;
      const parsed = parse(rawDate, "yyyy-MM-dd HH:mm:ss", new Date());
      if (!isValid(parsed)) return false;
      // Incluye ambos extremos del rango
      return (
        parsed >= startOfDay(new Date(filterValue.from)) &&
        parsed <= endOfDay(new Date(filterValue.to))
      );
    },
  },
  {
    accessorKey: "product_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Producto" />
    ),
    cell: ({ row }) => <div>{row.getValue("product_name")}</div>,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => <div>{row.getValue("quantity")}</div>,
  },
  {
    accessorKey: "supplier_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proveedor" />
    ),
    cell: ({ row }) => <div>{row.getValue("supplier_name")}</div>,
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Metodo de pago" />
    ),
    cell: ({ row }) => {
      const paymentMethod = row.getValue("payment_method");

      const translatedPaymentMethod = {
        credit: "Crédito",
        debit: "Débito",
        cash: "Efectivo",
        transfer: "Transferencia",
      };

      return (
        <div>
          {
            translatedPaymentMethod[
              paymentMethod as keyof typeof translatedPaymentMethod
            ]
          }
        </div>
      );
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const total = row.getValue("total");

      const formattedTotal = Number(total).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return <div>$ {formattedTotal}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <PurchasesTableRowActions row={row} />,
  },
];
