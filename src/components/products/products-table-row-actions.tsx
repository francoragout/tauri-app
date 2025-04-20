"use client";

import { Row } from "@tanstack/react-table";
import { ProductSchema } from "@/lib/zod";

import ProductUpdateForm from "./product-update-form";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function ProductsTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const product = ProductSchema.parse(row.original);

  return <ProductUpdateForm product={product} />;
}
