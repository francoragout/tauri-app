import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import * as React from "react";
import { DataTablePagination } from "@/components/data-table-pagination";
import { ProductsTableToolbar } from "./products-table-toolbar";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/features/cart/cartSlice";
import { Product } from "@/lib/zod";
import { RootState } from "@/store";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ProductsTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const dispatch = useDispatch();

  const cart = useSelector((state: RootState) => state.cart.items);

  const handleAddToCart = (product: Product) => {
    if (product.id === undefined) {
      toast.error("El producto no tiene ID y no puede agregarse al carrito.");
      return;
    }

    // Busca cuántas unidades ya hay en el carrito
    const cartItem = cart.find((item: any) => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    if (product.stock - quantityInCart <= 0) {
      toast.error(`Sin stock: ${product.name}`);
      return;
    }

    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        low_stock_threshold: product.low_stock_threshold,
        quantity: 1,
      })
    );

    toast.success("Agregado al carrito");
  };

  return (
    <div className="space-y-4">
      <ProductsTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleAddToCart(row.original as Product)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
