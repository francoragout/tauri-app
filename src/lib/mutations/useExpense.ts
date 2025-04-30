import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense } from "../zod";
import Database from "@tauri-apps/plugin-sql";

export function CreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Expense) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO expenses (category, product_id, total, quantity)
           VALUES ($1, $2, $3, $4)`,
        [values.category, values.product_id, values.total, values.quantity]
      );

      if (values.product_id) {
        await db.execute(
          `UPDATE products SET stock = stock + $1 WHERE id = $2`,
          [values.quantity, values.product_id]
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function UpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Expense) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `UPDATE expenses
           SET category = $1, product_id = $2, total = $3, quantity = $4
           WHERE id = $6`,
        [
          values.category,
          values.product_id,
          values.total,
          values.quantity,
          values.id,
        ]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function DeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(`DELETE FROM expenses WHERE id = $1`, [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function DeleteExpenses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(`DELETE FROM expenses WHERE id IN (${ids.join(",")})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
