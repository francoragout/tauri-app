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
        `INSERT INTO purchases (product_id, supplier_id, quantity, total, payment_method)
           VALUES ($1, $2, $3, $4, $5)`,
        [
          values.product_id,
          values.supplier_id,
          values.quantity,
          values.total,
          values.payment_method,
        ]
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
           SET product_id = $1, supplier_id = $2, quantity = $3, total = $4, payment_method = $5
           WHERE id = $6`,
        [
          values.product_id,
          values.supplier_id,
          values.quantity,
          values.total,
          values.payment_method,
          values.id,
        ]
      );
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
