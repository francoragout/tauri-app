import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Purchase } from "../zod";
import Database from "@tauri-apps/plugin-sql";

export function GetPurchases(): Promise<Purchase[]> {
  return Database.load("sqlite:mydatabase.db").then((db) =>
    db.select(
      `SELECT id, total, date, datetime(date, '-3 hours') AS local_date FROM purchases`
    )
  );
}

export function CreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Purchase) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO purchases (product_id, total, quantity)
           VALUES ($1, $2, $3)`,
        [values.product_id, values.total, values.quantity]
      );

      await db.execute(
        `UPDATE products
             SET stock = stock + $1
             WHERE id = $2`,
        [values.quantity, values.product_id]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
}

export function UpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Purchase) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `UPDATE purchases
           SET product_id = $1, total = $2, quantity = $3
           WHERE id = $4`,
        [values.product_id, values.total, values.quantity, values.id]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
}

export function DeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(`DELETE FROM purchases WHERE id = $1`, [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
}

export function DeletePurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(`DELETE FROM purchases WHERE id IN (${ids.join(",")})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
}
