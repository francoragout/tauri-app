import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense } from "../zod";
import Database from "@tauri-apps/plugin-sql";

export function GetExpenses(): Promise<Expense[]> {
  return Database.load("sqlite:mydatabase.db").then((db) =>
    db.select(
      `SELECT id, amount, date, datetime(date, '-3 hours') AS local_date FROM expenses`
    )
  );
}

export function CreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Expense) => {
      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO expenses (category, description, amount)
           VALUES ($1, $2, $3)`,
        [values.category, values.description, values.amount]
      );
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
           SET category = $1, description = $2, amount = $3
           WHERE id = $4`,
        [values.category, values.description, values.amount, values.id]
      );
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
