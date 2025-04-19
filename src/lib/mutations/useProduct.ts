import { useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { Product } from "../zod";

export function CreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Product) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO products (name, variant, weight, category, price, stock)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          values.name,
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
