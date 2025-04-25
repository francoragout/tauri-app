import { useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { Product } from "../zod";

export function CreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Product) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO products (brand, variant, weight, category, price, stock)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          values.brand,
          values.variant,
          values.weight,
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
        `UPDATE products SET brand = $1, variant = $2, weight = $3, category = $4, price = $5, stock = $6 WHERE id = $7`,
        [
          values.brand,
          values.variant,
          values.weight,
          values.category,
          values.price,
          values.stock,
          values.id,
        ]
      );

      // Actualizar el precio en la tabla sale_items para ventas no pagadas (is_paid = 0)
      await db.execute(
        `UPDATE sale_items
         SET price = (SELECT price FROM products WHERE products.id = sale_items.product_id)
         WHERE sale_id IN (
           SELECT id FROM sales WHERE is_paid = 0
         )`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function DeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(`DELETE FROM products WHERE id = $1`, [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function DeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `DELETE FROM products WHERE id IN (${ids.map(() => "?").join(",")})`,
        ids
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
