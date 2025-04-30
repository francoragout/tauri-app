import { useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { Product } from "../zod";

export function GetProducts(): Promise<Product[]> {
  return Database.load("sqlite:mydatabase.db").then((db) =>
    db.select(`SELECT * FROM products`)
  );
}

export function CreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Product) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO products (name, category, price, stock)
         VALUES ($1, $2, $3, $4)`,
        [values.name, values.category, values.price, values.stock]
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
        `UPDATE products
         SET name = $1, category = $2, price = $3, stock = $4
         WHERE id = $5`,
        [values.name, values.category, values.price, values.stock, values.id]
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
