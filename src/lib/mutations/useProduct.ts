import { useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { Product } from "../zod";

export function CreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Product) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO products (name, variant, weight, unit, category, price, stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          values.name,
          values.variant,
          values.weight,
          values.unit,
          values.category,
          values.price,
          values.stock,
        ]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function UpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Product) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `UPDATE products SET name = $1, variant = $2, weight = $3, unit = $4, category = $5, price = $6, stock = $7 WHERE id = $8`,
        [
          values.name,
          values.variant,
          values.weight,
          values.unit,
          values.category,
          values.price,
          values.stock,
          values.id,
        ]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
