import { useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { z } from "zod";
import { ProductSchema } from "../zod";

type Product = z.infer<typeof ProductSchema>;

export function useCreateProduct() {
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
      queryClient.invalidateQueries({ queryKey: ["products"] }); // 🔄 refresca la tabla automáticamente
    },
  });
}
