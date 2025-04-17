"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ProductSchema } from "@/lib/zod";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/features/cart/cartSlice";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function ProductsTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const product = ProductSchema.parse(row.original);
  const dispatch = useDispatch();
  const productName =
    product.name + " " + product.variant + " " + product.weight + product.unit;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        name: productName,
        price: product.price,
        quantity: 1,
      })
    );
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={handleAddToCart}
    >
      <Plus />
    </Button>
  );
}
